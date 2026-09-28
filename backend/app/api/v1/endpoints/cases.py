"""
IP-SAKTI Backend — Cases CRUD endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import uuid
from datetime import datetime, timezone

from app.db.session import get_db
from app.models.models import Case, User
from app.schemas.schemas import (
    CaseCreate, CaseUpdate, CasePublic, CaseListResponse, MessageResponse
)
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.get("", response_model=CaseListResponse)
async def list_cases(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all cases belonging to the current user."""
    offset = (page - 1) * per_page

    # Total count
    count_result = await db.execute(
        select(func.count(Case.id)).where(
            Case.user_id == current_user.id,
            Case.deleted_at.is_(None)
        )
    )
    total = count_result.scalar_one()

    # Paginated items
    result = await db.execute(
        select(Case)
        .where(Case.user_id == current_user.id, Case.deleted_at.is_(None))
        .order_by(Case.updated_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    cases = result.scalars().all()

    return CaseListResponse(
        items=[CasePublic.model_validate(c) for c in cases],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.post("", response_model=CasePublic, status_code=201)
async def create_case(
    data: CaseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new case."""
    case = Case(
        id=uuid.uuid4(),
        user_id=current_user.id,
        title=data.title,
        description=data.description,
        jurisdiction=data.jurisdiction,
        language=data.language,
    )
    db.add(case)
    await db.flush()
    return CasePublic.model_validate(case)


@router.get("/{case_id}", response_model=CasePublic)
async def get_case(
    case_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific case (must be owned by current user)."""
    case = await _get_user_case(case_id, current_user.id, db)
    return CasePublic.model_validate(case)


@router.patch("/{case_id}", response_model=CasePublic)
async def update_case(
    case_id: uuid.UUID,
    data: CaseUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a case."""
    case = await _get_user_case(case_id, current_user.id, db)

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(case, field, value)

    return CasePublic.model_validate(case)


@router.delete("/{case_id}", response_model=MessageResponse)
async def delete_case(
    case_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a case."""
    case = await _get_user_case(case_id, current_user.id, db)
    case.deleted_at = datetime.now(timezone.utc)
    return MessageResponse(message="Case deleted successfully.")


# ─── Helper ───────────────────────────────────────────────────────────────────

async def _get_user_case(case_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession) -> Case:
    """Fetch a case ensuring it belongs to the user (prevents cross-user leakage)."""
    result = await db.execute(
        select(Case).where(
            Case.id == case_id,
            Case.user_id == user_id,
            Case.deleted_at.is_(None),
        )
    )
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found.",
        )
    return case
