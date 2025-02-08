import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class ResponseFormat(str, enum.Enum):
    AUTO = "auto"
    STANDARD = "standard"
    LIFEMOTE = "lifemote"
    SIMPLE = "simple"
    DETAILED = "detailed"
    LEGACY = "legacy"


class DeploymentStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUCCESS = "success"
    FAILED = "failed"


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    url = Column(String(200))
    healthEndpoint = Column(String(100), default="/api/health/info")
    response_format = Column(Enum(ResponseFormat), default=ResponseFormat.AUTO)
    current_version = Column(String(50))
    database_schema = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    last_check_at = Column(DateTime, nullable=True)
    deployments = relationship("Deployment", back_populates="service")


class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"))
    version = Column(String(50))
    task_id = Column(String(100), nullable=True)
    status = Column(Enum(DeploymentStatus), default=DeploymentStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    details = Column(String(500), nullable=True)

    service = relationship("Service", back_populates="deployments")
