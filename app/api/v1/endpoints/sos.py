"""
SOS Telegram endpoints — broadcast emergency alerts, sync batch pings in Redis, and manage favorite contacts.
"""

import logging
import uuid
import json
from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.telegram import send_telegram_message, get_bot_info, TelegramError
from app.core.cache import cache
from app.db.session import get_db
from app.core.users import current_active_user, fastapi_users
from app.models.user import User
from app.models.contact import FavoriteContact
from app.schemas.contact import ContactCreate, ContactResponse
from app.schemas.tracking import OfflineSyncRequest, SyncResponse, CachedCoordinate
from app.schemas.telegram import (
    SOSRequest,
    SOSResponse,
    TelegramBotStatusResponse,
    TelegramResult,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# Optional dependency helper for user authentication in SOS
get_optional_active_user = fastapi_users.current_user(active=True, optional=True)


def _build_sos_message(
    lat: float,
    lng: float,
    custom_message: str | None,
    session_id: uuid.UUID,
    ip_address: str,
    points_count: int,
    is_crash: bool = False,
) -> str:
    """Build a premium, well-formatted HTML message body for Telegram."""
    maps_url = f"https://maps.google.com/?q={lat},{lng}"
    
    header = "🚨 <b>ROADSoS CRASH DETECTION WARNING</b> 🚨" if is_crash else "🚨 <b>ROADSoS EMERGENCY ALERT</b> 🚨"
    
    msg = (
        f"{header}\n\n"
        f"📍 <b>Last Known Location:</b> <a href='{maps_url}'>Click to Open Google Maps</a>\n"
        f"🌐 <b>Coordinates:</b> <code>{lat}, {lng}</code>\n"
        f"💻 <b>Device IP Address:</b> <code>{ip_address}</code>\n"
        f"⏱ <b>High-Speed Pings Synced:</b> <code>{points_count} points</code>\n"
        f"🆔 <b>Emergency Session ID:</b> <code>{session_id}</code>\n"
    )
    
    if custom_message:
        clean_msg = custom_message.replace("<", "&lt;").replace(">", "&gt;")
        msg += f"\n📝 <b>Emergency Details:</b>\n<i>{clean_msg}</i>\n"
        
    msg += "\n📣 <i>Broadcast via high-accuracy Redis SOS sync. Please dispatch immediate aid!</i>"
    return msg


@router.post("/", response_model=SOSResponse)
async def send_sos_alert(sos: SOSRequest, request: Request, db: AsyncSession = Depends(get_db), user: User | None = Depends(get_optional_active_user)):
    """
    Broadcast an emergency SOS alert to Telegram chats, channels, or users.

    If specific `chat_ids` are provided in the request payload, the alert is sent to them.
    Otherwise, it defaults to the pre-configured `TELEGRAM_DEFAULT_CHAT_ID` set in the environment.
    """
    targets = []
    if sos.chat_ids:
        targets.extend(sos.chat_ids)
        
    if not targets and user:
        # Fetch user's registered favorite contacts from PostgreSQL
        query = select(FavoriteContact).where(
            FavoriteContact.user_id == user.id, FavoriteContact.is_active == True
        )
        result = await db.execute(query)
        contacts = result.scalars().all()
        targets.extend([c.telegram_chat_id for c in contacts])
        
    if not targets and settings.TELEGRAM_DEFAULT_CHAT_ID:
        targets.append(settings.TELEGRAM_DEFAULT_CHAT_ID)

    if not targets:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "No target chats specified. You must provide 'chat_ids' in the request payload, "
                "register Favorite Contacts, or configure TELEGRAM_DEFAULT_CHAT_ID in the server's environment."
            ),
        )

    ip_address = request.client.host if request.client else "unknown"
    session_id = uuid.uuid4()
    message = _build_sos_message(sos.lat, sos.lng, sos.custom_message, session_id, ip_address, 1, is_crash=False)
    
    results = []
    success_count = 0

    for chat_id in targets:
        chat_id_str = str(chat_id).strip()
        try:
            res = await send_telegram_message(chat_id_str, message)
            results.append(
                TelegramResult(
                    chat_id=chat_id_str,
                    success=True,
                    message_id=res.get("message_id"),
                )
            )
            success_count += 1
        except TelegramError as e:
            results.append(TelegramResult(chat_id=chat_id_str, success=False, error=e.message))
        except Exception as e:
            logger.exception("Unexpected error sending Telegram message to %s", chat_id_str)
            results.append(TelegramResult(chat_id=chat_id_str, success=False, error=str(e)))

    if success_count == 0:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={
                "message": "Failed to send SOS alert to any target chats",
                "results": [r.dict() for r in results],
            },
        )

    return SOSResponse(
        success=True,
        message=f"SOS alert successfully broadcast to {success_count}/{total} target chats.",
        results=results,
    )


@router.post("/sync", response_model=SyncResponse)
async def sync_offline_coordinates(
    sync_req: OfflineSyncRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_active_user),
):
    """
    Synchronize high-frequency coordinates (logged at 5-second intervals) from client-side device.
    
    Stores session tracking and coordinates in Redis for ultra-high speed performance.
    If `is_crash` is true, immediately resolves target recipients and broadcasts an SOS alert to Telegram.
    """
    if not sync_req.coordinates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coordinate timeline list cannot be empty",
        )

    # 1. Establish session ID and metadata
    session_id = sync_req.session_id or uuid.uuid4()
    ip_address = request.client.host if request.client else "unknown"

    meta_key = f"roadsos:session:{session_id}:meta"
    pings_key = f"roadsos:session:{session_id}:pings"

    # Ensure Redis connection is up
    if not cache.redis:
        await cache.connect()

    # 2. Save active session metadata in Redis Hash
    session_status = "CRASH_DETECTED" if sync_req.is_crash else "ACTIVE"
    await cache.redis.hset(
        meta_key,
        mapping={
            "user_id": str(user.id) if user else "",
            "ip_address": ip_address,
            "status": session_status,
            "created_at": datetime.utcnow().isoformat(),
        },
    )
    await cache.redis.expire(meta_key, 604800)  # Expire in 7 days

    # 3. Append coordinate pings to Redis list
    serialized_pings = [
        json.dumps(
            {
                "lat": c.lat,
                "lng": c.lng,
                "recorded_at": c.recorded_at.isoformat(),
                "accuracy": c.accuracy,
                "is_offline_cached": c.is_offline_cached,
            }
        )
        for c in sync_req.coordinates
    ]
    await cache.redis.rpush(pings_key, *serialized_pings)
    await cache.redis.expire(pings_key, 604800)

    # Sort coordinates chronologically by recorded time to determine last known location
    sorted_coords = sorted(sync_req.coordinates, key=lambda c: c.recorded_at)
    latest_coord = sorted_coords[-1]

    # 4. If is_crash or first session initialization, broadcast Telegram alert
    broadcast_success = False
    broadcast_msg = "Coordinates synchronized to Redis."

    if sync_req.is_crash:
        # Resolve target contacts
        targets = []
        if sync_req.chat_ids:
            targets.extend(sync_req.chat_ids)
            
        if not targets and user:
            query = select(FavoriteContact).where(
                FavoriteContact.user_id == user.id, FavoriteContact.is_active == True
            )
            res = await db.execute(query)
            contacts = res.scalars().all()
            targets.extend([c.telegram_chat_id for c in contacts])

        if not targets and settings.TELEGRAM_DEFAULT_CHAT_ID:
            targets.append(settings.TELEGRAM_DEFAULT_CHAT_ID)

        if targets:
            message = _build_sos_message(
                latest_coord.lat,
                latest_coord.lng,
                sync_req.custom_message,
                session_id,
                ip_address,
                len(sync_req.coordinates),
                is_crash=True,
            )
            success_count = 0
            for chat_id in targets:
                try:
                    await send_telegram_message(str(chat_id).strip(), message)
                    success_count += 1
                except Exception:
                    logger.exception("Failed to send crash alert to %s", chat_id)
            
            if success_count > 0:
                broadcast_success = True
                broadcast_msg = f"Crash SOS broadcasted to {success_count}/{len(targets)} emergency contacts."
            else:
                broadcast_msg = "Crash detected but failed to send to contacts."
        else:
            broadcast_msg = "Crash detected but no target emergency contacts could be resolved."

    return SyncResponse(
        success=True,
        session_id=session_id,
        points_synced=len(sync_req.coordinates),
        broadcast_success=broadcast_success,
        message=broadcast_msg,
        ip_address=ip_address,
    )


@router.get("/session/{session_id}/route", response_model=List[CachedCoordinate])
async def get_session_route(session_id: uuid.UUID):
    """
    Fetch the chronological timeline route of location pings logged for an active emergency tracking session.
    
    Looks up data directly from Redis lists for sub-millisecond query performance.
    """
    pings_key = f"roadsos:session:{session_id}:pings"
    
    if not cache.redis:
        await cache.connect()

    raw_pings = await cache.redis.lrange(pings_key, 0, -1)
    if not raw_pings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tracking session {session_id} not found or expired",
        )

    coordinates = []
    for raw in raw_pings:
        data = json.loads(raw)
        coordinates.append(
            CachedCoordinate(
                lat=data["lat"],
                lng=data["lng"],
                recorded_at=datetime.fromisoformat(data["recorded_at"]),
                accuracy=data.get("accuracy"),
                is_offline_cached=data.get("is_offline_cached", True),
            )
        )
    
    # Sort chronologically
    return sorted(coordinates, key=lambda c: c.recorded_at)


# --- Favorite Contacts Management Endpoints ---

@router.post("/contacts", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite_contact(
    contact: ContactCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    """
    Register a new emergency Favorite Contact.

    When an emergency alert or crash sync is posted, alerts are dispatched automatically to these targets.
    """
    db_contact = FavoriteContact(
        user_id=user.id,
        name=contact.name,
        telegram_chat_id=contact.telegram_chat_id,
    )
    db.add(db_contact)
    await db.commit()
    await db.refresh(db_contact)
    return db_contact


@router.get("/contacts", response_model=List[ContactResponse])
async def list_favorite_contacts(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    """List all registered Favorite Contacts for the currently authenticated user."""
    query = select(FavoriteContact).where(FavoriteContact.user_id == user.id)
    result = await db.execute(query)
    return result.scalars().all()


@router.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_favorite_contact(
    contact_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    """Remove a Favorite Contact from your emergency list."""
    query = delete(FavoriteContact).where(
        FavoriteContact.id == contact_id, FavoriteContact.user_id == user.id
    )
    result = await db.execute(query)
    await db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found or not associated with your account",
        )


@router.get("/bot-status", response_model=TelegramBotStatusResponse)
async def check_bot_status():
    """Verify bot token credentials and fetch profile info."""
    try:
        bot_info = await get_bot_info()
        return TelegramBotStatusResponse(
            valid=True,
            bot_username=bot_info.get("username"),
        )
    except TelegramError as e:
        return TelegramBotStatusResponse(valid=False, error=e.message)
    except Exception as e:
        return TelegramBotStatusResponse(valid=False, error=str(e))
