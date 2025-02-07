import time
from enum import Enum

import httpx
from celery import Celery


class DeploymentStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUCCESS = "success"
    FAILED = "failed"


celery_app = Celery(
    "tooling_worker", broker="redis://redis:6379/0", backend="redis://redis:6379/0"
)


@celery_app.task
def deploy_service(service_id: int, service_url: str, new_version: str):
    # Simulate deployment process
    time.sleep(10)  # Simulating work

    try:
        # Synchronous HTTP request
        with httpx.Client() as client:
            response = client.get(f"{service_url}/health/info")
            info = response.json()

            # Verify deployment success
            if info.get("version") == new_version:
                return {"status": DeploymentStatus.SUCCESS.value, "info": info}
            else:
                return {
                    "status": DeploymentStatus.FAILED.value,
                    "error": "Version mismatch",
                }

    except Exception as e:
        return {"status": DeploymentStatus.FAILED.value, "error": str(e)}
