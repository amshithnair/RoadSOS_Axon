from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from app.models.service import ServiceCategory


class ServiceBase(BaseModel):
    name: str
    category: ServiceCategory
    address: Optional[str] = None
    city: Optional[str] = None
    country_code: str = Field(..., min_length=2, max_length=2)
    phones: List[str] = []
    open_24h: bool = False
    rating: Optional[float] = None


class ServiceRead(ServiceBase):
    id: UUID
    distance_km: Optional[float] = None
    coordinates: dict

    class Config:
        from_attributes = True


class IncidentCreate(BaseModel):
    lat: float
    lng: float
    description: str
    incident_type: str


class FlagCreate(BaseModel):
    service_id: UUID
    reason: str
    details: Optional[str] = None
