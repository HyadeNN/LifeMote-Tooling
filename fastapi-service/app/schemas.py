from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, HttpUrl

from .models import DeploymentStatus, ResponseFormat


class ServiceBase(BaseModel):
    name: str
    url: str
    healthEndpoint: str = "/api/health/info"  # Default endpoint, test için
    response_format: ResponseFormat


class ServiceCreate(ServiceBase):
    class Config:
        use_enum_values = True  # This ensures enum is serialized properly


class ServiceUpdate(ServiceBase):
    name: Optional[str] = None
    url: Optional[str] = None
    response_format: Optional[ResponseFormat] = None


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
    details: Optional[str] = None

    class Config:
        orm_mode = True


class Service(ServiceBase):
    id: int
    current_version: Optional[str] = None
    database_schema: Optional[str] = Field(None, alias="schema")  # Fix for schema name
    created_at: datetime
    last_check_at: Optional[datetime] = None
    deployments: List[Deployment] = []

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class HealthResponse(BaseModel):
    platform: Optional[str] = None
    release: str
    database_schema: str = Field(alias="schema")  # Fix for schema name

    class Config:
        allow_population_by_field_name = True
