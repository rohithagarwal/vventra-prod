import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_current_user_optional, get_db
from app.core.events import event_bus
from app.models.user import User
from app.schemas.opportunity import (
    OpportunityCreate,
    OpportunityListResponse,
    OpportunityOut,
    OpportunityUpdate,
)
from app.services import opportunity_service

router = APIRouter()

DbSession = Annotated[AsyncSession, Depends(get_db)]
OptionalUser = Annotated[User | None, Depends(get_current_user_optional)]


@router.get("/stream")
async def stream_opportunities():
    """Real-time Server-Sent Events (SSE) feed for instant listing updates and deletions."""
    return StreamingResponse(
        event_bus.stream_events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("", response_model=OpportunityListResponse)
async def list_opportunities(
    db: DbSession,
    sector: str | None = Query(None, description="Filter by industry/sector"),
    status: str | None = Query("active", description="Filter by status (default active, or all)"),
    search: str | None = Query(None, description="Search keyword in title or summary"),
    sort_by: str | None = Query("trust", description="Sort order: trust, price-low, price-high, newest"),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> OpportunityListResponse:
    """Browse verified marketplace opportunities with sorting, filtering, and pagination."""
    items = await opportunity_service.list_opportunities(
        db,
        sector=sector,
        status=status,
        search=search,
        sort_by=sort_by,
        limit=limit,
        offset=offset,
    )
    return OpportunityListResponse(total=len(items), items=items)


@router.get("/{opportunity_id}", response_model=OpportunityOut)
async def get_opportunity(opportunity_id: uuid.UUID, db: DbSession) -> OpportunityOut:
    """Retrieve full details and confidential dossier overview for an opportunity."""
    return await opportunity_service.get_opportunity(db, opportunity_id)


@router.post("", response_model=OpportunityOut, status_code=status.HTTP_201_CREATED)
async def create_opportunity(
    body: OpportunityCreate, db: DbSession, user: OptionalUser = None
) -> OpportunityOut:
    """Publish a new opportunity. Automatically triggers real-time SSE broadcast."""
    creator_id = user.id if user else None
    return await opportunity_service.create_opportunity(db, body, creator_id=creator_id)


@router.patch("/{opportunity_id}", response_model=OpportunityOut)
async def update_opportunity(
    opportunity_id: uuid.UUID, body: OpportunityUpdate, db: DbSession
) -> OpportunityOut:
    """Update opportunity details and broadcast real-time update."""
    return await opportunity_service.update_opportunity(db, opportunity_id, body)


@router.delete("/{opportunity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_opportunity(opportunity_id: uuid.UUID, db: DbSession) -> None:
    """Delete an opportunity and broadcast real-time deletion event."""
    await opportunity_service.delete_opportunity(db, opportunity_id)
