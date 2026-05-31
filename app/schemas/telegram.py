from pydantic import BaseModel, Field
from typing import List, Optional


class SOSRequest(BaseModel):
    lat: float = Field(..., description="Sender's latitude GPS coordinate")
    lng: float = Field(..., description="Sender's longitude GPS coordinate")
    chat_ids: Optional[List[str]] = Field(
        None,
        description="Optional list of Telegram chat/channel/user IDs to send the alert to. Falls back to default config if empty or None.",
    )
    custom_message: Optional[str] = Field(
        None, description="Optional custom context or description about the emergency"
    )


class TelegramResult(BaseModel):
    chat_id: str = Field(..., description="Target Telegram chat ID")
    success: bool = Field(..., description="Whether the message was sent successfully")
    error: Optional[str] = Field(None, description="Error message if the send failed")
    message_id: Optional[int] = Field(None, description="The sent Telegram message ID if successful")


class SOSResponse(BaseModel):
    success: bool = Field(..., description="True if alert was sent successfully to at least one chat")
    message: str = Field(..., description="Summary status message")
    results: List[TelegramResult] = Field(..., description="Result detail for each target chat ID")


class TelegramBotStatusResponse(BaseModel):
    valid: bool = Field(..., description="Whether the bot token is active and valid")
    bot_username: Optional[str] = Field(None, description="The bot's Telegram username if valid")
    error: Optional[str] = Field(None, description="Error message if validation failed")
