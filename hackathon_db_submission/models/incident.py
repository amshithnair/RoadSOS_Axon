import enum
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geography
from app.db.base_class import Base

class IncidentType(str, enum.Enum):
    MEDICAL = "MEDICAL"
    FIRE = "FIRE"
    BREAKDOWN = "BREAKDOWN"
    FUEL = "FUEL"
    FLOOD = "FLOOD"
    CRIME = "CRIME"

class IncidentStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"

class IncidentRoleStatus(str, enum.Enum):
    PENDING = "PENDING"
    ASSIGNED = "ASSIGNED"

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(
        UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid()
    )
    incident_type = Column(SQLEnum(IncidentType), nullable=False)
    severity = Column(String)
    location = Column(Geography(geometry_type="POINT", srid=4326), nullable=False)
    status = Column(SQLEnum(IncidentStatus), server_default="ACTIVE", nullable=False)
    is_private = Column(Boolean, server_default="false", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    roles = relationship("IncidentRole", back_populates="incident", cascade="all, delete-orphan")

class IncidentRole(Base):
    __tablename__ = "incident_roles"

    id = Column(
        UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid()
    )
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=False)
    role_name = Column(String, nullable=False)
    assignee_device_id = Column(String)
    status = Column(SQLEnum(IncidentRoleStatus), server_default="PENDING", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    incident = relationship("Incident", back_populates="roles")
