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
