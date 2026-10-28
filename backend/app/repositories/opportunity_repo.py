import uuid
from decimal import Decimal
from typing import Sequence

from sqlalchemy import delete, desc, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.opportunity import Opportunity
from app.schemas.opportunity import OpportunityCreate, OpportunityUpdate


class OpportunityRepo:
    async def list_all(
        self,
        db: AsyncSession,
        *,
        sector: str | None = None,
        status: str | None = "active",
        search: str | None = None,
        sort_by: str | None = "trust",
        limit: int = 100,
        offset: int = 0,
    ) -> Sequence[Opportunity]:
        query = select(Opportunity)

        if status and status != "all":
            query = query.where(Opportunity.status == status)

        if sector and sector != "all":
            query = query.where(Opportunity.sector.ilike(f"%{sector}%"))

        if search:
            search_filter = or_(
                Opportunity.title.ilike(f"%{search}%"),
                Opportunity.headline.ilike(f"%{search}%"),
                Opportunity.summary.ilike(f"%{search}%"),
                Opportunity.sector.ilike(f"%{search}%"),
            )
            query = query.where(search_filter)

        if sort_by == "price-low":
            query = query.order_by(Opportunity.unlock_fee.asc())
        elif sort_by == "price-high":
            query = query.order_by(Opportunity.unlock_fee.desc())
        elif sort_by == "newest":
            query = query.order_by(Opportunity.created_at.desc())
        else:  # default trust score / readiness score
            query = query.order_by(desc(Opportunity.readiness_score), desc(Opportunity.created_at))

        query = query.limit(limit).offset(offset)
        result = await db.execute(query)
        return result.scalars().all()

    async def get_by_id(self, db: AsyncSession, opportunity_id: uuid.UUID) -> Opportunity | None:
        query = select(Opportunity).where(Opportunity.id == opportunity_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_code(self, db: AsyncSession, code: str) -> Opportunity | None:
        query = select(Opportunity).where(Opportunity.code == code)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def create(
        self, db: AsyncSession, data: OpportunityCreate, creator_id: uuid.UUID | None = None
    ) -> Opportunity:
        # Generate stable human-readable code if not supplied
        if not data.code:
            prefix = data.sector[:3].upper() if data.sector else "VVE"
            short_id = uuid.uuid4().hex[:6].upper()
            code = f"{prefix}-{short_id}"
        else:
            code = data.code

        opp = Opportunity(
            code=code,
            creator_id=creator_id,
            title=data.title,
            sector=data.sector,
            category=data.category,
            status=data.status or "active",
            deal_size=data.deal_size,
            unlock_fee=data.unlock_fee,
            target_return=data.target_return,
            timeline=data.timeline,
            headline=data.headline,
            summary=data.summary,
            problem_statement=data.problem_statement,
            solution_overview=data.solution_overview,
            market_size=data.market_size,
            business_model=data.business_model,
            doc_depth_pages=data.doc_depth_pages,
            readiness_score=data.readiness_score,
            financial_model=data.financial_model,
            is_featured=data.is_featured,
        )
        db.add(opp)
        await db.flush()
        return opp

    async def update(
        self, db: AsyncSession, opportunity_id: uuid.UUID, data: OpportunityUpdate
    ) -> Opportunity | None:
        opp = await self.get_by_id(db, opportunity_id)
        if not opp:
            return None

        update_dict = data.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            setattr(opp, key, val)

        await db.flush()
        return opp

    async def delete(self, db: AsyncSession, opportunity_id: uuid.UUID) -> bool:
        opp = await self.get_by_id(db, opportunity_id)
        if not opp:
            return False
        await db.delete(opp)
        await db.flush()
        return True


opportunity_repo = OpportunityRepo()
