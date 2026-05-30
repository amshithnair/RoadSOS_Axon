import requests
from app.core.celery_app import celery_app
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+asyncpg://roadsos:roadsos@db/roadsos"
)
engine = create_async_engine(DATABASE_URL)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@celery_app.task(name="sync_osm_data")
def sync_osm_data(lat: float, lng: float, radius: int = 10000):
    """
    Scrapes OpenStreetMap via Overpass API for emergency amenities.
    """
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = f"""
    [out:json];
    (
      node["amenity"="hospital"]({lat-0.1},{lng-0.1},{lat+0.1},{lng+0.1});
      node["amenity"="police"]({lat-0.1},{lng-0.1},{lat+0.1},{lng+0.1});
      node["emergency"="ambulance_station"]({lat-0.1},{lng-0.1},{lat+0.1},{lng+0.1});
    );
    out body;
    """
    response = requests.get(overpass_url, params={"data": overpass_query})
    data = response.json()

    # Note: In a real implementation, we'd use an async loop to upsert into PostGIS
    # For this prototype, we log the count of found elements
    return {"status": "success", "elements_found": len(data.get("elements", []))}
