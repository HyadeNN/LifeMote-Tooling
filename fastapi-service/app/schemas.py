from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel


class DeploymentStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUCCESS = "success"
    FAILED = "failed"


class ServiceBase(BaseModel):
    name: str
    url: str


class ServiceCreate(ServiceBase):
    pass


class DeploymentBase(BaseModel):
    version: str


class DeploymentCreate(DeploymentBase):
    pass


class Deployment(DeploymentBase):
    id: int
    service_id: int
    status: DeploymentStatus
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class Service(ServiceBase):
    id: int
    current_version: Optional[str] = None
    database_schema: Optional[str] = None
    created_at: datetime
    deployments: List[Deployment] = []

    class Config:
        orm_mode = True
