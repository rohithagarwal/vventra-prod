import uuid
from decimal import Decimal
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.events import event_bus
from app.core.exceptions import AppError
from app.models.opportunity import Opportunity
from app.repositories.opportunity_repo import opportunity_repo
from app.schemas.opportunity import OpportunityCreate, OpportunityOut, OpportunityUpdate


def _serialize_opp(opp: Opportunity) -> dict[str, Any]:
    return {
        "id": str(opp.id),
        "code": opp.code,
        "title": opp.title,
        "sector": opp.sector,
        "category": opp.category,
        "status": opp.status,
        "deal_size": float(opp.deal_size) if opp.deal_size is not None else 0.0,
        "unlock_fee": float(opp.unlock_fee) if opp.unlock_fee is not None else 0.0,
        "target_return": opp.target_return,
        "timeline": opp.timeline,
        "headline": opp.headline,
        "summary": opp.summary,
        "problem_statement": opp.problem_statement,
        "solution_overview": opp.solution_overview,
        "market_size": opp.market_size,
        "business_model": opp.business_model,
        "doc_depth_pages": opp.doc_depth_pages,
        "readiness_score": opp.readiness_score,
        "financial_model": opp.financial_model or {},
        "is_featured": opp.is_featured,
        "created_at": opp.created_at.isoformat() if opp.created_at else None,
        "updated_at": opp.updated_at.isoformat() if opp.updated_at else None,
    }


async def list_opportunities(
    db: AsyncSession,
    *,
    sector: str | None = None,
    status: str | None = "active",
    search: str | None = None,
    sort_by: str | None = "trust",
    limit: int = 100,
    offset: int = 0,
) -> list[OpportunityOut]:
    items = await opportunity_repo.list_all(
        db,
        sector=sector,
        status=status,
        search=search,
        sort_by=sort_by,
        limit=limit,
        offset=offset,
    )
    return [OpportunityOut.model_validate(item) for item in items]


async def get_opportunity(db: AsyncSession, opportunity_id: uuid.UUID) -> OpportunityOut:
    opp = await opportunity_repo.get_by_id(db, opportunity_id)
    if not opp:
        raise AppError("Opportunity not found.", status_code=404)
    return OpportunityOut.model_validate(opp)


async def create_opportunity(
    db: AsyncSession, data: OpportunityCreate, creator_id: uuid.UUID | None = None
) -> OpportunityOut:
    opp = await opportunity_repo.create(db, data, creator_id=creator_id)
    await db.commit()
    await db.refresh(opp)

    serialized = _serialize_opp(opp)
    # Broadcast real-time creation event to all connected clients
    await event_bus.publish("opportunity_created", serialized)

    return OpportunityOut.model_validate(opp)


async def update_opportunity(
    db: AsyncSession, opportunity_id: uuid.UUID, data: OpportunityUpdate
) -> OpportunityOut:
    opp = await opportunity_repo.update(db, opportunity_id, data)
    if not opp:
        raise AppError("Opportunity not found.", status_code=404)
    await db.commit()
    await db.refresh(opp)

    serialized = _serialize_opp(opp)
    # Broadcast real-time update event
    await event_bus.publish("opportunity_updated", serialized)

    return OpportunityOut.model_validate(opp)


async def delete_opportunity(db: AsyncSession, opportunity_id: uuid.UUID) -> bool:
    success = await opportunity_repo.delete(db, opportunity_id)
    if not success:
        raise AppError("Opportunity not found.", status_code=404)
    await db.commit()

    # Broadcast real-time deletion event
    await event_bus.publish("opportunity_deleted", {"id": str(opportunity_id)})
    return True
