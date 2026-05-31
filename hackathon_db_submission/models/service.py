import enum
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Numeric,
    BigInteger,
    DateTime,
    Enum as SQLEnum,
    ARRAY,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geography
from app.db.base_class import Base


class ServiceCategory(str, enum.Enum):
    HOSPITAL = "HOSPITAL"
    POLICE = "POLICE"
    AMBULANCE = "AMBULANCE"
    TOWING = "TOWING"
    TYRE_SHOP = "TYRE_SHOP"
    CAR_DEALER = "CAR_DEALER"
    FIRE_BRIGADE = "FIRE_BRIGADE"
    PETROL_PUMP = "PETROL_PUMP"
    CLINIC = "CLINIC"
    SHELTER = "SHELTER"


class Service(Base):
    __tablename__ = "services"

    id = Column(
        UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid()
    )
    name = Column(String, nullable=False)
    category = Column(SQLEnum(ServiceCategory), nullable=False)
    location = Column(Geography(geometry_type="POINT", srid=4326), nullable=False)
    address = Column(String)
    city = Column(String)
    country_code = Column(String(2), nullable=False)
    phones = Column(ARRAY(String), server_default="{}")
    open_24h = Column(Boolean, server_default="false")
    rating = Column(Numeric(2, 1))
    osm_id = Column(BigInteger)
    verified_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    is_active = Column(Boolean, server_default="true")
