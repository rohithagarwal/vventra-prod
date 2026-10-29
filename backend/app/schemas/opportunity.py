from datetime import datetime
from decimal import Decimal
from typing import Any
import uuid

from pydantic import BaseModel, Field


class OpportunityBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    sector: str = Field(..., max_length=100)
    category: str | None = None
    deal_size: Decimal = Field(default=Decimal("0.00"), ge=0)
    unlock_fee: Decimal = Field(default=Decimal("0.00"), ge=0)
    target_return: str | None = None
    timeline: str | None = None
    headline: str | None = None
    summary: str | None = None
    problem_statement: str | None = None
    solution_overview: str | None = None
    market_size: str | None = None
    business_model: str | None = None
    doc_depth_pages: int = Field(default=90, ge=1)
    readiness_score: int = Field(default=0, ge=0, le=100)
    financial_model: dict[str, Any] = Field(default_factory=dict)
    is_featured: bool = False


class OpportunityCreate(OpportunityBase):
    code: str | None = None
    status: str = "active"


class OpportunityUpdate(BaseModel):
    title: str | None = None
    sector: str | None = None
    category: str | None = None
    status: str | None = None
    deal_size: Decimal | None = None
    unlock_fee: Decimal | None = None
    target_return: str | None = None
    timeline: str | None = None
    headline: str | None = None
    summary: str | None = None
    problem_statement: str | None = None
    solution_overview: str | None = None
    market_size: str | None = None
    business_model: str | None = None
    doc_depth_pages: int | None = None
    readiness_score: int | None = None
    financial_model: dict[str, Any] | None = None
    is_featured: bool | None = None


class OpportunityOut(OpportunityBase):
    id: uuid.UUID
    code: str
    creator_id: uuid.UUID | None = None
    status: str
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OpportunityListResponse(BaseModel):
    total: int
    items: list[OpportunityOut]
