from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class ContactCreate(BaseModel):
    name: str = Field(..., description="Friendly name of the contact (e.g. Dad, Wife, Alerts)")
    telegram_chat_id: str = Field(
        ...,
        description="Telegram Chat/User ID (e.g. 123456789) or public channel username (e.g. @channel)",
    )


class ContactResponse(BaseModel):
    id: UUID
    name: str
    telegram_chat_id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
