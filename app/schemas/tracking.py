from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import List, Optional


class CachedCoordinate(BaseModel):
    lat: float = Field(..., description="Latitude coordinate of the ping")
    lng: float = Field(..., description="Longitude coordinate of the ping")
    recorded_at: datetime = Field(..., description="Device timestamp when coordinate was logged")
    accuracy: Optional[float] = Field(None, description="GPS location accuracy in meters")
    is_offline_cached: bool = Field(True, description="True if point was logged while device was offline")


class OfflineSyncRequest(BaseModel):
    session_id: Optional[UUID] = Field(
        None, description="Active emergency session UUID. If null, a new session is created."
    )
    chat_ids: Optional[List[str]] = Field(
        None,
        description="Optional explicit Telegram targets. If omitted, fetches registered Favorite Contacts.",
    )
    coordinates: List[CachedCoordinate] = Field(
        ..., description="Chronological batch of coordinates captured at 5-second intervals"
    )
    is_crash: bool = Field(
        False, description="Set to true if a vehicle crash signature was detected by the device"
    )
    custom_message: Optional[str] = Field(None, description="Optional custom detail text")


class SyncResponse(BaseModel):
    success: bool = Field(..., description="True if batch synchronization completed successfully")
    session_id: UUID = Field(..., description="Emergency tracking session UUID")
    points_synced: int = Field(..., description="Number of coordinates successfully synchronized")
    broadcast_success: bool = Field(..., description="True if alert broadcasted to Telegram successfully")
    message: str = Field(..., description="Status summary details")
    ip_address: str = Field(..., description="The captured network client IP address")
