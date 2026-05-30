from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.service import Service, ServiceCategory
from app.schemas.service import ServiceRead, IncidentCreate, FlagCreate
from app.core.cache import cache
from geoalchemy2.functions import ST_DWithin
from typing import List, Optional
import json
from uuid import UUID

router = APIRouter()


def get_geohash(lat: float, lng: float):
    return f"{round(lat, 2)}:{round(lng, 2)}"


@router.get("/nearby", response_model=List[ServiceRead])
async def get_nearby_services(
    lat: float,
    lng: float,
    radius: int = Query(25000, description="Radius in meters"),
    category: Optional[ServiceCategory] = None,
    db: AsyncSession = Depends(get_db),
):
    geohash = get_geohash(lat, lng)
    cat_str = category.value if category else "ALL"

    cached_data = await cache.get_nearby(geohash, cat_str)
    if cached_data:
        return cached_data

    point = func.ST_MakePoint(lng, lat)
    point_geog = func.cast(point, Service.location.type)

    query = select(
        Service.id,
        Service.name,
        Service.category,
        Service.address,
        Service.city,
        Service.country_code,
        Service.phones,
        Service.open_24h,
        Service.rating,
        func.ST_AsGeoJSON(Service.location).label("coordinates"),
        (func.ST_Distance(Service.location, point_geog) / 1000).label("distance_km"),
    ).where(ST_DWithin(Service.location, point_geog, radius), Service.is_active.is_(True))

    if category:
        query = query.where(Service.category == category)

    query = query.order_by("distance_km")

    result = await db.execute(query)
    services = result.all()

    response_data = [
        {
            "id": s.id,
            "name": s.name,
            "category": s.category,
            "address": s.address,
            "city": s.city,
            "country_code": s.country_code,
            "phones": s.phones,
            "open_24h": s.open_24h,
            "rating": float(s.rating) if s.rating else None,
            "coordinates": json.loads(s.coordinates),
            "distance_km": round(float(s.distance_km), 2),
        }
        for s in services
    ]

    await cache.set_nearby(geohash, cat_str, response_data)
    return response_data


@router.get("/{id}", response_model=ServiceRead)
async def get_service(id: UUID, db: AsyncSession = Depends(get_db)):
    query = select(
        Service.id,
        Service.name,
        Service.category,
        Service.address,
        Service.city,
        Service.country_code,
        Service.phones,
        Service.open_24h,
        Service.rating,
        func.ST_AsGeoJSON(Service.location).label("coordinates"),
    ).where(Service.id == id)

    result = await db.execute(query)
    service = result.first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    return {
        **service._asdict(),
        "coordinates": json.loads(service.coordinates),
        "rating": float(service.rating) if service.rating else None,
    }


@router.get("/offline-bundle/download")
async def get_offline_bundle(
    lat: float, lng: float, radius: int = 50000, db: AsyncSession = Depends(get_db)
):
    """Pre-packs a 50km region for IndexedDB caching."""
    # Similar to nearby but larger radius and no cache check
    point = func.ST_MakePoint(lng, lat)
    point_geog = func.cast(point, Service.location.type)

    query = select(Service).where(ST_DWithin(Service.location, point_geog, radius))
    result = await db.execute(query)
    services = result.scalars().all()
    return {"region": f"{lat},{lng}", "count": len(services), "data": services}


@router.post("/incidents")
async def create_incident(incident: IncidentCreate):
    # Log incident (simplified for prototype)
    return {"status": "Incident reported", "id": "inc-123"}


@router.post("/flags")
async def flag_service(flag: FlagCreate):
    # Log data quality flag
    return {"status": "Flag received", "service_id": str(flag.service_id)}
