# File: fastapi-service/app/main.py
from datetime import datetime
from typing import List

import httpx
from fastapi import (
    BackgroundTasks,
    Depends,
    FastAPI,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas
from .celery_app import celery_app, deploy_service
from .database import get_db
from .websocket import manager

app = FastAPI()

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# WebSocket endpoints
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.websocket("/ws/service/{service_id}")
async def service_websocket_endpoint(websocket: WebSocket, service_id: int):
    await manager.connect(websocket, service_id)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_service_update(
                service_id,
                {"type": "service_update", "service_id": service_id, "data": data},
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket, service_id)


# REST API endpoints
@app.post("/services/", response_model=schemas.Service)
async def create_service(service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    db_service = models.Service(**service.dict())
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{service.url}/health/info")
            info = response.json()
            db_service.current_version = info.get("version")
            db_service.database_schema = info.get("database_schema")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Service health check failed")

    db.add(db_service)
    db.commit()
    db.refresh(db_service)

    # Notify clients about new service
    await manager.broadcast(
        {
            "type": "service_created",
            "service": {
                "id": db_service.id,
                "name": db_service.name,
                "url": db_service.url,
                "current_version": db_service.current_version,
                "database_schema": db_service.database_schema,
            },
        }
    )

    return db_service


@app.get("/services/", response_model=List[schemas.Service])
def list_services(db: Session = Depends(get_db)):
    return db.query(models.Service).all()


@app.get("/services/{service_id}", response_model=schemas.Service)
def get_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@app.post("/services/{service_id}/deployments/", response_model=schemas.Deployment)
async def create_deployment(
    service_id: int,
    deployment: schemas.DeploymentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # Create deployment record
    db_deployment = models.Deployment(**deployment.dict(), service_id=service_id)
    db.add(db_deployment)
    db.commit()
    db.refresh(db_deployment)

    # Start Celery task
    task = deploy_service.delay(service_id, service.url, deployment.version)

    # Store task ID and update status
    db_deployment.task_id = task.id
    db_deployment.status = models.DeploymentStatus.IN_PROGRESS
    db.commit()

    # Send WebSocket update
    await manager.broadcast(
        {
            "type": "deployment_started",
            "service_id": service_id,
            "deployment_id": db_deployment.id,
            "version": deployment.version,
            "status": "in_progress",
        }
    )

    return db_deployment


@app.get("/services/{service_id}/deployments/", response_model=List[schemas.Deployment])
def list_deployments(service_id: int, db: Session = Depends(get_db)):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service.deployments


@app.get("/deployments/{deployment_id}/status")
def get_deployment_status(deployment_id: int, db: Session = Depends(get_db)):
    deployment = (
        db.query(models.Deployment)
        .filter(models.Deployment.id == deployment_id)
        .first()
    )
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")

    if deployment.task_id:
        task = deploy_service.AsyncResult(deployment.task_id)
        if task.ready():
            result = task.get()
            deployment.status = result["status"]
            if deployment.status == models.DeploymentStatus.SUCCESS:
                deployment.completed_at = datetime.utcnow()

                # Update service version if deployment successful
                service = (
                    db.query(models.Service)
                    .filter(models.Service.id == deployment.service_id)
                    .first()
                )
                service.current_version = deployment.version
                db.commit()

                # Send WebSocket update for successful deployment
                background_tasks.add_task(
                    manager.broadcast,
                    {
                        "type": "deployment_completed",
                        "service_id": deployment.service_id,
                        "deployment_id": deployment.id,
                        "status": "success",
                        "version": deployment.version,
                    },
                )
            db.commit()

    return {
        "status": deployment.status,
        "completed_at": deployment.completed_at,
        "version": deployment.version,
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
