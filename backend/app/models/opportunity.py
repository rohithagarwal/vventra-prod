import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Opportunity(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "opportunities"
    __table_args__ = (
        Index("ix_opportunities_code", "code"),
        Index("ix_opportunities_sector", "sector"),
        Index("ix_opportunities_status", "status"),
    )

    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    creator_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    sector: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active", server_default="draft")
    deal_size: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    unlock_fee: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    target_return: Mapped[str | None] = mapped_column(String(100), nullable=True)
    timeline: Mapped[str | None] = mapped_column(String(100), nullable=True)
    headline: Mapped[str | None] = mapped_column(Text, nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    problem_statement: Mapped[str | None] = mapped_column(Text, nullable=True)
    solution_overview: Mapped[str | None] = mapped_column(Text, nullable=True)
    market_size: Mapped[str | None] = mapped_column(Text, nullable=True)
    business_model: Mapped[str | None] = mapped_column(Text, nullable=True)
    doc_depth_pages: Mapped[int] = mapped_column(Integer, default=90, nullable=False)
    readiness_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    financial_model: Mapped[dict[str, Any] | None] = mapped_column(JSONB, default=dict)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class AccessRequest(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "access_requests"

    opportunity_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False
    )
    buyer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    tier: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    deposit_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"))
    nda_signed: Mapped[bool] = mapped_column(Boolean, default=False)
    nda_signed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    inspection_ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    architect_note: Mapped[str | None] = mapped_column(Text)
    buyer_note: Mapped[str | None] = mapped_column(Text)
