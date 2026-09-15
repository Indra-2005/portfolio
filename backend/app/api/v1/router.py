from fastapi import APIRouter
from app.api.v1.endpoints import auth, contact, health, projects

api_v1_router = APIRouter()

# Register endpoint routers
api_v1_router.include_router(health.router, tags=["Health"])
api_v1_router.include_router(auth.router)
api_v1_router.include_router(projects.router)
api_v1_router.include_router(contact.router)
