from fastapi import APIRouter
from app.api.v1.endpoints import services, emergency, admin, sos
from app.core.users import auth_backend, fastapi_users
from app.schemas.user import UserRead, UserCreate

api_router = APIRouter()

# Public Routes
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(
    emergency.router, prefix="/emergency-numbers", tags=["emergency"]
)
api_router.include_router(sos.router, prefix="/sos", tags=["sos"])

# Admin Routes (Protected)
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])

# Auth Routes
api_router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)
api_router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
