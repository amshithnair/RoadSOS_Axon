# ⚙️ ROADSoS — Engineering Decisions

> This document records the key architectural and engineering decisions made during the design and implementation of ROADSoS. Each decision is documented with context, the options considered, the final choice, and the rationale — following an ADR (Architecture Decision Record) format.

---

## Table of Contents

1. [API Framework — FastAPI](#1-api-framework--fastapi)
2. [Async-First Architecture](#2-async-first-architecture)
3. [PostGIS over Application-Level Geospatial](#3-postgis-over-application-level-geospatial)
4. [Geography Type over Geometry Type](#4-geography-type-over-geometry-type)
5. [UUID Primary Keys](#5-uuid-primary-keys)
6. [Redis Dual-Purpose (Cache + Broker)](#6-redis-dual-purpose-cache--broker)
7. [Device-Based Identification over User Accounts](#7-device-based-identification-over-user-accounts)
8. [Expo Managed Workflow for Mobile](#8-expo-managed-workflow-for-mobile)
9. [Zustand over Redux](#9-zustand-over-redux)
10. [Offline-First PWA Strategy](#10-offline-first-pwa-strategy)
11. [Celery for Background Data Ingestion](#11-celery-for-background-data-ingestion)
12. [OpenStreetMap as Primary Data Source](#12-openstreetmap-as-primary-data-source)
13. [Bystander Coordination Model](#13-bystander-coordination-model)
14. [Security — Fail-Secure Exception Handling](#14-security--fail-secure-exception-handling)
15. [Containerized Deployment](#15-containerized-deployment)

---

## 1. API Framework — FastAPI

**Status:** ✅ Accepted

**Context:**
We needed a Python web framework capable of handling high-concurrency geospatial queries with minimal latency. The API serves emergency-critical requests — response time directly impacts user safety.

**Options Considered:**
| Option | Pros | Cons |
|---|---|---|
| Django REST Framework | Mature, batteries-included | Synchronous by default, heavier overhead |
| Flask | Simple, flexible | No async support, manual validation |
| **FastAPI** | Native async, auto Swagger docs, Pydantic validation | Younger ecosystem |

**Decision:** FastAPI

**Rationale:**
- Native `async`/`await` support pairs perfectly with `asyncpg` for non-blocking database access
- Automatic OpenAPI/Swagger documentation eliminates the need for separate API docs
- Pydantic v2 integration provides zero-cost request validation with clear error messages
- Dependency injection system (`Depends()`) enables clean separation of concerns for auth, DB sessions, and caching

---

## 2. Async-First Architecture

**Status:** ✅ Accepted

**Context:**
Emergency service lookups involve I/O-heavy operations (database queries, Redis cache checks, external API calls). Under load, synchronous frameworks would block threads waiting for I/O.

**Decision:** Full async stack — `FastAPI` + `asyncpg` + `redis.asyncio` + `SQLAlchemy[asyncio]`

**Rationale:**
- A single Uvicorn worker can handle hundreds of concurrent connections without thread exhaustion
- `asyncpg` is benchmarked 3-5x faster than synchronous `psycopg2` for typical query patterns
- Redis operations via `redis.asyncio` avoid blocking the event loop during cache hits/misses
- Critical for a safety app: one slow request must never degrade service for other users

**Trade-off:** Celery tasks remain synchronous (Celery doesn't natively support async). Background tasks use a separate sync database engine, which is acceptable for non-latency-critical data ingestion.

---

## 3. PostGIS over Application-Level Geospatial

**Status:** ✅ Accepted

**Context:**
We need to answer "What are the nearest hospitals within 25km?" — a spatial query that requires distance calculation against potentially hundreds of thousands of records.

**Options Considered:**
| Option | Approach | Performance |
|---|---|---|
| Application-level (Haversine in Python) | Fetch all records, compute distance in memory | O(n) — scans entire table, unusable at scale |
| PostgreSQL `earthdistance` module | Built-in extension, cube-based distance | Approximate, no spatial indexing |
| **PostGIS** | Full GIS engine, GiST spatial indexes | O(log n) — index-driven, meters-accurate |

**Decision:** PostGIS 3.4 on PostgreSQL 16

**Rationale:**
- `ST_DWithin()` + GiST index = **index-only scan** — the database doesn't even look at rows outside the radius
- `ST_Distance()` on `Geography` types returns meters on the WGS 84 spheroid — no flat-earth approximation errors
- `ST_AsGeoJSON()` provides native GeoJSON serialization for direct frontend consumption
- PostGIS is the industry standard used by Uber, Lyft, and emergency dispatch systems

---

## 4. Geography Type over Geometry Type

**Status:** ✅ Accepted

**Context:**
PostGIS offers two spatial types: `Geometry` (flat Cartesian plane) and `Geography` (spheroidal Earth model).

**Decision:** `Geography(POINT, SRID 4326)` for all spatial columns

**Rationale:**
- `Geography` computes distances on a spheroid — results are in **meters**, not degrees
- For a global emergency app, distance accuracy is non-negotiable: at the equator, 1° longitude ≈ 111km, but at 60°N latitude, 1° longitude ≈ 55km. `Geometry` can't account for this
- `Geography` is slightly slower than `Geometry` for complex polygon operations, but for POINT-based radius queries the difference is negligible

---

## 5. UUID Primary Keys

**Status:** ✅ Accepted

**Context:**
We needed a primary key strategy that works for distributed/offline scenarios — users may create incidents while offline and sync later.

**Options Considered:**
| Option | Merge-safe? | Predictable? |
|---|---|---|
| Auto-increment `SERIAL` | ❌ Conflicts in distributed writes | ✅ Sequential |
| **UUID v4 (`gen_random_uuid()`)** | ✅ Collision-resistant | ❌ Random |

**Decision:** UUID v4, generated server-side via `gen_random_uuid()`

**Rationale:**
- Eliminates primary key conflicts when merging offline data
- Not guessable — an attacker can't enumerate incident IDs
- PostgreSQL 13+ generates UUIDs natively with `gen_random_uuid()` — no extension required
- 128-bit UUIDs have a collision probability of 10⁻¹⁸ for a billion records

---

## 6. Redis Dual-Purpose (Cache + Broker)

**Status:** ✅ Accepted

**Context:**
We need: (a) a low-latency cache for repeated geospatial queries, and (b) a message broker for Celery background tasks.

**Decision:** Single Redis 7 instance serving as both application cache and Celery broker/backend

**Rationale:**
- Reduces infrastructure complexity for an MVP — one fewer service to configure, monitor, and scale
- Redis 7's `allkeys-lru` eviction policy ensures cache entries are gracefully evicted under memory pressure without affecting Celery task queues
- Memory budget: 512MB cap is sufficient for caching ~50K geospatial results + Celery task metadata
- **Scale-up path:** In production, cache and broker would be separated into dedicated Redis instances or replaced with RabbitMQ for the broker

---

## 7. Device-Based Identification over User Accounts

**Status:** ✅ Accepted

**Context:**
In an emergency, requiring users to create an account before they can report an incident or find a hospital is unacceptable. Registration friction costs lives.

**Decision:**
- **Public endpoints** (service lookup, incident creation, telemetry) → anonymous, device-ID-based
- **Admin endpoints** (flag moderation, incident review) → JWT-authenticated superuser accounts

**Rationale:**
- Zero-friction emergency access: open the app → find help — no signup, no login
- Device IDs (`assignee_device_id`) are sufficient for bystander role assignment
- User accounts exist only for the admin moderation panel, protected by `fastapi-users` with JWT + bcrypt
- Telemetry pings use device ID + IP address for basic device tracking without PII

---

## 8. Expo Managed Workflow for Mobile

**Status:** ✅ Accepted

**Context:**
We needed to ship a working mobile app on iOS, Android, and Web from a single codebase within hackathon timelines.

**Options Considered:**
| Option | Time to ship | Native access | Web support |
|---|---|---|---|
| Native (Swift + Kotlin) | 3-4 weeks | Full | ❌ |
| Flutter | 1-2 weeks | Good | Partial |
| React Native (bare) | 1-2 weeks | Full | Partial |
| **Expo (managed)** | 3-5 days | Good (via modules) | ✅ First-class |

**Decision:** Expo SDK 49, managed workflow

**Rationale:**
- `expo-location`, `expo-camera`, `expo-notifications` provide native device access without Xcode/Android Studio configuration
- `expo start --web` with Vite gives us a PWA for desktop/laptop access with no extra code
- EAS Build handles native binary compilation in the cloud — no local build toolchain required
- React Native Web bridge (`react-native-web`) allows component reuse across mobile and web

---

## 9. Zustand over Redux

**Status:** ✅ Accepted

**Context:**
The frontend needs global state for: current emergency, user profile, location, bystander assignments, and offline status.

**Options Considered:**
| Option | Boilerplate | Bundle size | Learning curve |
|---|---|---|---|
| Redux Toolkit | Medium | ~10KB | Medium |
| MobX | Low | ~15KB | Medium |
| **Zustand** | Minimal | ~1KB | Low |
| React Context | None | 0KB | Low (but perf issues at scale) |

**Decision:** Zustand 4.4+

**Rationale:**
- Single `create()` call creates the entire store — no providers, reducers, action creators, or middleware
- Built-in `AsyncStorage` persistence via manual `saveToStorage()` — no additional persistence middleware
- TypeScript-first: the store type is the single source of truth
- 1KB bundle is critical for a PWA targeting low-bandwidth emergency scenarios

---

## 10. Offline-First PWA Strategy

**Status:** ✅ Accepted

**Context:**
Road emergencies frequently occur in areas with poor cellular coverage. The app must remain functional without network access.

**Decision:** Multi-layer offline strategy:

| Layer | Technology | What it caches |
|---|---|---|
| Service Worker | Cache API | Static HTML/JS/CSS + emergency numbers endpoint |
| Offline Bundle API | `GET /services/offline-bundle/download` | Pre-packs all services within a 50km radius as JSON |
| Client State | Zustand + AsyncStorage | User profile, medical details, emergency contacts |

**Rationale:**
- Service Worker intercepts all `fetch()` calls — serves cached responses when offline, falls back to network when available
- The offline bundle endpoint lets users pre-download their region's emergency services before entering a dead zone
- Emergency phone numbers are cached by the Service Worker as critical data — always available even fully offline
- Zustand state is persisted to AsyncStorage on every mutation — the app can be killed and restored without data loss

---

## 11. Celery for Background Data Ingestion

**Status:** ✅ Accepted

**Context:**
Emergency service data needs periodic refreshing from OpenStreetMap. This is a slow, network-dependent operation that should never block the API.

**Decision:** Celery with Redis broker, split into:
- **Worker** (4 concurrent processes): Executes one-off and periodic tasks
- **Beat** (scheduler): Triggers data sync tasks on a schedule

**Rationale:**
- Decouples data ingestion from request handling — a slow Overpass API response doesn't affect user-facing latency
- Task queues (`default`, `sync`) allow priority control — urgent tasks on `default`, bulk imports on `sync`
- Celery Beat enables automated, periodic data freshness without manual cron jobs
- Task results stored in Redis — the API can check sync status without polling the worker

---

## 12. OpenStreetMap as Primary Data Source

**Status:** ✅ Accepted

**Context:**
We needed a global, freely available dataset of emergency services (hospitals, police, fire stations) with geographic coordinates.

**Options Considered:**
| Option | Coverage | Cost | Freshness |
|---|---|---|---|
| Google Places API | Excellent | $17/1000 requests | Real-time |
| **OpenStreetMap (Overpass API)** | Very Good | Free (open data) | Community-updated |
| Government Open Data | Varies by country | Free | Quarterly |

**Decision:** OpenStreetMap as the primary source, with `osm_id` stored for data provenance

**Rationale:**
- Free and open — no API key costs or rate limit concerns for a hackathon MVP
- Overpass API supports structured queries by amenity type and bounding box
- `osm_id` column enables traceability: every record can be traced back to its OSM source
- The community-flagging system (`POST /services/flags`) supplements OSM data with crowd-sourced corrections
- **Scale-up path:** Google Places API can be layered on as a supplementary source for data enrichment

---

## 13. Bystander Coordination Model

**Status:** ✅ Accepted

**Context:**
When an accident occurs, multiple bystanders are often present but uncoordinated. We needed a way to distribute roles ("direct traffic", "call ambulance", "stay with victim") to avoid duplication of effort and ensure critical tasks are covered.

**Decision:** `IncidentRole` model with claim-based assignment

**Flow:**
1. Incident creator triggers `POST /incidents/` → auto-generates default roles
2. Nearby bystanders see available roles via `GET /incidents/nearby`
3. Any bystander can claim an unclaimed role via `POST /incidents/{id}/roles/{role_id}/assign`
4. Once assigned, the role status changes from `PENDING` → `ASSIGNED` and is locked

**Rationale:**
- No authentication required — roles are claimed by device ID (emergency scenario, zero friction)
- Optimistic locking: if a role is already `ASSIGNED`, the claim attempt returns HTTP 400 — no race conditions
- Default role templates ("Directing traffic", "Calling ambulance", "Stay with victim") ensure critical tasks are always created
- Private incidents (`is_private=true`) skip role generation — the reporter handles the situation alone

---

## 14. Security — Fail-Secure Exception Handling

**Status:** ✅ Accepted

**Context:**
In production, unhandled exceptions can leak stack traces, database schemas, and internal paths to attackers.

**Decision:** Global exception handler that:
1. Returns sanitized error messages to clients
2. Logs full exception details internally
3. Never exposes stack traces in API responses

```python
# User sees: {"detail": "An internal safety error occurred. Our team has been notified."}
# Server logs: Full traceback with file, line, and variable state
```

**Rationale:**
- Stack traces contain exploitable information (file paths, dependency versions, SQL fragments)
- Validation errors (`RequestValidationError`) are safe to return — they describe input issues, not server internals
- HTTP exceptions (`HTTPException`) are intentionally raised — safe to forward
- Everything else is treated as a potential information leak and sanitized

---

## 15. Containerized Deployment

**Status:** ✅ Accepted

**Context:**
The system consists of 6 services (API, PostgreSQL+PostGIS, Redis, Celery Worker, Celery Beat, Nginx). We needed reproducible, one-command deployment.

**Decision:** Docker Compose with Alpine-based images

**Services:**
| Service | Base Image | Purpose |
|---|---|---|
| `api` | `python:3.11-slim` | FastAPI + Uvicorn |
| `db` | `postgis/postgis:16-3.4-alpine` | PostgreSQL + PostGIS |
| `redis` | `redis:7-alpine` | Cache + Broker |
| `celery_worker` | `python:3.11-slim` | Background task execution |
| `celery_beat` | `python:3.11-slim` | Task scheduler |
| `nginx` | `nginx:alpine` | Reverse proxy |

**Rationale:**
- `docker compose up --build` → entire system running in < 60 seconds
- Alpine-based images minimize attack surface and image size
- Volume mounts (`- .:/app`) enable hot-reload during development
- `postgis/postgis` official image ships with PostGIS pre-installed — no manual extension setup
- Nginx handles SSL termination, rate limiting, and real-IP header injection in production

---

## Summary: Decision Matrix

| # | Decision | Category | Risk | Reversibility |
|---|---|---|---|---|
| 1 | FastAPI | Framework | Low | Medium |
| 2 | Async-first | Architecture | Low | Low |
| 3 | PostGIS | Database | Low | Low |
| 4 | Geography type | Database | Low | Medium |
| 5 | UUID PKs | Database | Low | Low |
| 6 | Redis dual-purpose | Infrastructure | Medium | High |
| 7 | Device-based ID | Auth | Medium | High |
| 8 | Expo managed | Mobile | Low | Medium |
| 9 | Zustand | State mgmt | Low | High |
| 10 | Offline-first | Architecture | Low | Medium |
| 11 | Celery | Background tasks | Low | High |
| 12 | OpenStreetMap | Data source | Medium | High |
| 13 | Bystander model | Domain | Low | High |
| 14 | Fail-secure errors | Security | Low | High |
| 15 | Docker Compose | Deployment | Low | High |
