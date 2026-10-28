from fastapi import APIRouter
from app.api.v1.endpoints import auth, opportunities, profile, users, verification

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(profile.router, prefix="/profile", tags=["profile"])
router.include_router(verification.router, prefix="/verification", tags=["verification"])
router.include_router(opportunities.router, prefix="/opportunities", tags=["opportunities"])
