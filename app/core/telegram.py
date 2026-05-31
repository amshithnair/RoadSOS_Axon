import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class TelegramError(Exception):
    """Custom exception raised when Telegram API requests fail."""

    def __init__(self, message: str, status_code: int | None = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


async def send_telegram_message(chat_id: str, text: str) -> dict:
    """
    Send a message via Telegram Bot API using httpx.
    
    Args:
        chat_id: The target Telegram chat ID, channel username, or user ID.
        text: The text content of the message.
        
    Returns:
        The response dictionary from Telegram.
        
    Raises:
        TelegramError: If the token is missing, request fails, or Telegram returns an error.
    """
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        raise TelegramError("TELEGRAM_BOT_TOKEN is not configured in .env settings", status_code=500)

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": False,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            data = resp.json()

            if resp.status_code != 200 or not data.get("ok"):
                error_msg = data.get("description", "Unknown Telegram error")
                logger.error(
                    "Telegram sendMessage failed for chat %s. Status: %s, Error: %s",
                    chat_id,
                    resp.status_code,
                    error_msg,
                )
                raise TelegramError(error_msg, status_code=resp.status_code)

            return data.get("result", {})
    except httpx.HTTPError as e:
        logger.exception("HTTP transport error communicating with Telegram")
        raise TelegramError(f"Failed to communicate with Telegram: {e}", status_code=502)


async def get_bot_info() -> dict:
    """
    Retrieve bot profile information from Telegram's getMe endpoint to verify token validity.
    
    Returns:
        A dict containing bot info (id, first_name, username, etc.)
        
    Raises:
        TelegramError: If the bot token is invalid, missing, or request fails.
    """
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        raise TelegramError("TELEGRAM_BOT_TOKEN is not configured in .env settings", status_code=500)

    url = f"https://api.telegram.org/bot{token}/getMe"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            data = resp.json()

            if resp.status_code != 200 or not data.get("ok"):
                error_msg = data.get("description", "Invalid or expired bot token")
                raise TelegramError(error_msg, status_code=resp.status_code)

            return data.get("result", {})
    except httpx.HTTPError as e:
        logger.exception("HTTP transport error communicating with Telegram getMe")
        raise TelegramError(f"Failed to communicate with Telegram: {e}", status_code=502)
