from fastapi import APIRouter, Depends
from app.core.users import current_superuser
from app.models.user import User

router = APIRouter()


@router.get("/flags")
async def get_pending_flags(user: User = Depends(current_superuser)):
    """List all pending service flags for moderation. Restricted to Superusers."""
    return [
        {
            "id": 1,
            "service_id": "uuid-1",
            "reason": "Incorrect phone number",
            "status": "pending",
        },
        {
            "id": 2,
            "service_id": "uuid-2",
            "reason": "Facility closed",
            "status": "pending",
        },
    ]


@router.get("/incidents")
async def get_reported_incidents(user: User = Depends(current_superuser)):
    """List all reported incidents for review."""
    return [
        {
            "id": "inc-123",
            "type": "Accident",
            "lat": 37.77,
            "lng": -122.41,
            "timestamp": "2026-05-30T10:00:00Z",
        }
    ]
