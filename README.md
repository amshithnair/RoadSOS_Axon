# ROADSoS Backend

## Overview
ROADSoS is an Emergency Services Locator API built with Python and FastAPI. It provides endpoints for locating emergency services and uses a PostgreSQL database with PostGIS for geospatial capabilities, Redis for caching, and Celery for background tasks.

## Tech Stack
- **Framework:** FastAPI
- **Database:** PostgreSQL with PostGIS (via asyncpg and GeoAlchemy2)
- **ORM:** SQLAlchemy (async)
- **Migrations:** Alembic
- **Caching & Task Queue:** Redis & Celery
- **Authentication:** FastAPI Users (JWT, bcrypt)
- **Containerization:** Docker & Docker Compose

## Project Structure
- `app/`
  - `api/`: API routers and endpoints
  - `core/`: Core configurations, exceptions, security, and Celery application definition
  - `data/`: Data management scripts and utilities
  - `db/`: Database session management and base models
  - `models/`: SQLAlchemy database models
  - `schemas/`: Pydantic models for request/response validation
  - `tasks/`: Celery background tasks
  - `main.py`: FastAPI application entry point
- `alembic/`: Database migration scripts
- `scripts/`: Utility scripts (e.g., `verify_system.py`)
- `docker-compose.yml`: Local development environment orchestration

## Getting Started

### Prerequisites
- Docker and Docker Compose

### Running Locally
1. Create a `.env` file in the root directory based on the required variables (do not commit it to version control).
   ```env
   DATABASE_URL=postgresql+asyncpg://roadsos:roadsos@db/roadsos
   REDIS_URL=redis://redis:6379/0
   SECRET_KEY=your_secure_secret_key
   ```
2. Start the services using Docker Compose:
   ```bash
   docker-compose up --build
   ```
3. The API will be available at `http://localhost:8000`.
4. Access the auto-generated Swagger documentation at `http://localhost:8000/api/v1/openapi.json` (or typically `/docs`).

## Background Tasks
Celery is used for background processing. The `docker-compose.yml` includes services for `celery_worker` and `celery_beat` to automatically consume and schedule tasks.

## 🚨 SOS Broadcast Feature (Telegram Bot)
ROADSoS integrates with Telegram Bots to broadcast emergency SOS alerts with GPS coordinates and custom context directly to chat rooms, channels, or specific users instantly and completely for free.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/sos/` | Broadcast SOS alert to target Telegram chats |
| `GET`  | `/api/v1/sos/bot-status` | Verify bot token credentials & fetch profile info |

### Example SOS Request
```bash
curl -X POST http://localhost:8000/api/v1/sos/ \
  -H "Content-Type: application/json" \
  -d '{
    "chat_ids": ["123456789", "@my_emergency_channel"],
    "lat": 37.7749,
    "lng": -122.4194,
    "custom_message": "Car accident on I-280"
  }'
```

Recipients will receive a beautiful, rich HTML message:
> 🚨 **ROADSoS EMERGENCY ALERT** 🚨
> 
> 📍 **Location:** [Click to Open Google Maps](https://maps.google.com/?q=37.7749,-122.4194)
> 🌐 **Coordinates:** `37.7749, -122.4194`
> 
> 📝 **Details:**
> *Car accident on I-280*
> 
> 📣 *Broadcast via the ROADSoS Emergency System. Please dispatch aid immediately!*

### Telegram Bot Setup
1. Message `@BotFather` on Telegram to create a new bot and obtain your `TELEGRAM_BOT_TOKEN`.
2. Find your personal chat ID or your channel's ID (e.g. using `@userinfobot`).
3. Set your variables in `.env` (see below) and restart your app container.

## API Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **OpenAPI JSON**: `http://localhost:8000/api/v1/openapi.json`
- **Postman**: Import `postman_collection.json` from the repo root into Postman

## Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://roadsos:roadsos@db/roadsos` | PostgreSQL connection |
| `REDIS_URL` | `redis://redis:6379/0` | Redis connection |
| `SECRET_KEY` | *(prototype default)* | JWT signing key |
| `TELEGRAM_BOT_TOKEN` | `None` | Telegram Bot Token from @BotFather |
| `TELEGRAM_DEFAULT_CHAT_ID` | `None` | Default chat ID fallback for SOS broadcasts |

