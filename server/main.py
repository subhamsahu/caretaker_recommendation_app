"""
Kid Caretaker Recommendation App — FastAPI entry point.

Registers all routes, CORS middleware, and startup events.
"""

from contextlib import asynccontextmanager
from datetime import datetime
from typing import List

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func, and_, delete
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db, init_db
from models import (
    ParentUser, ChildProfile, Video, WatchHistory, Like,
    child_interests,
)
from schemas import (
    ParentRegister, ParentLogin, Token, ParentOut,
    ChildCreate, ChildOut,
    VideoOut, VideoRecommendation,
    WatchCreate, WatchHistoryOut,
    LikeOut,
    ParentDashboard, ChildDashboard, CategoryStat,
)
from auth import (
    hash_password, verify_password, create_access_token, get_current_parent,
)
from recommender import get_recommendations


# ---------------------------------------------------------------------------
# App lifecycle
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup tasks (create tables) and yield."""
    await init_db()
    yield


app = FastAPI(
    title="Kid Caretaker Recommendation API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===================================================================
#  AUTH ROUTES
# ===================================================================

@app.post("/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(payload: ParentRegister, db: AsyncSession = Depends(get_db)):
    """Register a new parent account and return a JWT."""
    # Check for existing email / username
    existing = await db.execute(
        select(ParentUser).where(
            (ParentUser.email == payload.email) | (ParentUser.username == payload.username)
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Email or username already registered")

    parent = ParentUser(
        email=payload.email,
        username=payload.username,
        hashed_password=hash_password(payload.password),
    )
    db.add(parent)
    await db.flush()  # populate parent.id

    token = create_access_token({"sub": str(parent.id)})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/auth/login", response_model=Token)
async def login(payload: ParentLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate parent and return a JWT."""
    result = await db.execute(
        select(ParentUser).where(ParentUser.email == payload.email)
    )
    parent = result.scalars().first()
    if not parent or not verify_password(payload.password, parent.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(parent.id)})
    return {"access_token": token, "token_type": "bearer"}


# ===================================================================
#  CHILD PROFILE ROUTES
# ===================================================================

@app.post("/children/", response_model=ChildOut, status_code=status.HTTP_201_CREATED)
async def create_child(
    payload: ChildCreate,
    parent: ParentUser = Depends(get_current_parent),
    db: AsyncSession = Depends(get_db),
):
    """Create a child profile under the authenticated parent."""
    child = ChildProfile(
        parent_id=parent.id,
        name=payload.name,
        age=payload.age,
        screen_time_limit=payload.screen_time_limit,
    )
    db.add(child)
    await db.flush()

    # Insert interests into the association table
    VALID_INTERESTS = {"science", "art", "sports", "coding"}
    valid_interests = [i.lower() for i in payload.interests if i.lower() in VALID_INTERESTS]

    for interest in valid_interests:
        await db.execute(
            child_interests.insert().values(child_id=child.id, interest=interest)
        )

    return ChildOut(
        id=child.id,
        name=child.name,
        age=child.age,
        interests=valid_interests,
        screen_time_limit=child.screen_time_limit,
        created_at=child.created_at,
    )


@app.get("/children/", response_model=List[ChildOut])
async def list_children(
    parent: ParentUser = Depends(get_current_parent),
    db: AsyncSession = Depends(get_db),
):
    """Return all children belonging to the authenticated parent."""
    result = await db.execute(
        select(ChildProfile).where(ChildProfile.parent_id == parent.id)
    )
    children = result.scalars().all()

    output = []
    for child in children:
        interests_result = await db.execute(
            select(child_interests.c.interest).where(child_interests.c.child_id == child.id)
        )
        interests = [str(row[0]) for row in interests_result.fetchall()]
        output.append(ChildOut(
            id=child.id,
            name=child.name,
            age=child.age,
            interests=interests,
            screen_time_limit=child.screen_time_limit,
            created_at=child.created_at,
        ))
    return output


@app.get("/children/{child_id}", response_model=ChildOut)
async def get_child(
    child_id: int,
    parent: ParentUser = Depends(get_current_parent),
    db: AsyncSession = Depends(get_db),
):
    """Return a single child profile (must belong to the parent)."""
    result = await db.execute(
        select(ChildProfile).where(
            and_(ChildProfile.id == child_id, ChildProfile.parent_id == parent.id)
        )
    )
    child = result.scalars().first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    interests_result = await db.execute(
        select(child_interests.c.interest).where(child_interests.c.child_id == child.id)
    )
    interests = [str(row[0]) for row in interests_result.fetchall()]

    return ChildOut(
        id=child.id,
        name=child.name,
        age=child.age,
        interests=interests,
        screen_time_limit=child.screen_time_limit,
        created_at=child.created_at,
    )


# ===================================================================
#  VIDEO / RECOMMENDATION ROUTES
# ===================================================================

@app.get("/videos/recommend/{child_id}", response_model=List[VideoRecommendation])
async def recommend_videos(
    child_id: int,
    mood: str = Query(..., description="Child mood: happy, curious, bored, stressed"),
    parent: ParentUser = Depends(get_current_parent),
    db: AsyncSession = Depends(get_db),
):
    """Return recommended videos for a child based on mood + interests."""
    # Validate mood
    VALID_MOODS = {"happy", "curious", "bored", "stressed"}
    mood_lower = mood.lower()
    if mood_lower not in VALID_MOODS:
        raise HTTPException(status_code=400, detail=f"Invalid mood. Choose from: {sorted(VALID_MOODS)}")

    # Fetch child (ownership check)
    result = await db.execute(
        select(ChildProfile).where(
            and_(ChildProfile.id == child_id, ChildProfile.parent_id == parent.id)
        )
    )
    child = result.scalars().first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    recommendations = await get_recommendations(db, child, mood_lower)
    return recommendations


@app.post("/videos/{video_id}/like", response_model=LikeOut)
async def like_video(
    video_id: int,
    child_id: int = Query(..., description="ID of the child liking the video"),
    parent: ParentUser = Depends(get_current_parent),
    db: AsyncSession = Depends(get_db),
):
    """Child likes / saves a video."""
    # Ownership check
    result = await db.execute(
        select(ChildProfile).where(
            and_(ChildProfile.id == child_id, ChildProfile.parent_id == parent.id)
        )
    )
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Child not found")

    # Check video exists
    vid = await db.execute(select(Video).where(Video.id == video_id))
    if not vid.scalars().first():
        raise HTTPException(status_code=404, detail="Video not found")

    # Prevent duplicate likes
    existing = await db.execute(
        select(Like).where(and_(Like.child_id == child_id, Like.video_id == video_id))
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Already liked")

    like = Like(child_id=child_id, video_id=video_id)
    db.add(like)
    await db.flush()
    return LikeOut(
        id=like.id,
        child_id=like.child_id,
        video_id=like.video_id,
        created_at=like.created_at,
    )


@app.post("/videos/{video_id}/watch", response_model=WatchHistoryOut)
async def watch_video(
    video_id: int,
    payload: WatchCreate,
    child_id: int = Query(..., description="ID of the child watching"),
    parent: ParentUser = Depends(get_current_parent),
    db: AsyncSession = Depends(get_db),
):
    """Record that a child watched a video for N minutes."""
    # Ownership check
    result = await db.execute(
        select(ChildProfile).where(
            and_(ChildProfile.id == child_id, ChildProfile.parent_id == parent.id)
        )
    )
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Child not found")

    vid_result = await db.execute(select(Video).where(Video.id == video_id))
    if not vid_result.scalars().first():
        raise HTTPException(status_code=404, detail="Video not found")

    watch = WatchHistory(
        child_id=child_id,
        video_id=video_id,
        duration_minutes=payload.duration_minutes,
    )
    db.add(watch)
    await db.flush()
    return WatchHistoryOut(
        id=watch.id,
        child_id=watch.child_id,
        video_id=watch.video_id,
        watched_at=watch.watched_at,
        duration_minutes=watch.duration_minutes,
        video=None,
    )


# ===================================================================
#  PARENT DASHBOARD
# ===================================================================

@app.get("/parent/dashboard", response_model=ParentDashboard)
async def parent_dashboard(
    parent: ParentUser = Depends(get_current_parent),
    db: AsyncSession = Depends(get_db),
):
    """
    Aggregated dashboard for the parent showing per-child stats:
    - total watch time
    - learning vs entertainment ratio
    - top categories
    """
    result = await db.execute(
        select(ChildProfile).where(ChildProfile.parent_id == parent.id)
    )
    children = result.scalars().all()

    children_data: List[ChildDashboard] = []
    # Education-heavy categories
    LEARNING_CATEGORIES = {"science", "coding", "math", "history", "language", "nature"}

    for child in children:
        # Total watch time
        total_q = await db.execute(
            select(func.coalesce(func.sum(WatchHistory.duration_minutes), 0)).where(
                WatchHistory.child_id == child.id
            )
        )
        total_minutes = total_q.scalar()

        # Per-category minutes
        cat_q = await db.execute(
            select(Video.category, func.sum(WatchHistory.duration_minutes))
            .join(Video, Video.id == WatchHistory.video_id)
            .where(WatchHistory.child_id == child.id)
            .group_by(Video.category)
            .order_by(func.sum(WatchHistory.duration_minutes).desc())
        )
        rows = cat_q.fetchall()

        learning_minutes = 0
        entertainment_minutes = 0
        top_cats: List[CategoryStat] = []

        for cat_val, minutes in rows:
            cat_name = str(cat_val)
            top_cats.append(CategoryStat(category=cat_name, total_minutes=minutes))
            if cat_name in LEARNING_CATEGORIES:
                learning_minutes += minutes
            else:
                entertainment_minutes += minutes

        total_cat = learning_minutes + entertainment_minutes
        children_data.append(
            ChildDashboard(
                child_name=child.name,
                total_watch_minutes=total_minutes,
                learning_ratio=round(learning_minutes / total_cat, 2) if total_cat else 0.0,
                entertainment_ratio=round(entertainment_minutes / total_cat, 2) if total_cat else 0.0,
                top_categories=top_cats[:5],
            )
        )

    return ParentDashboard(parent_username=parent.username, children=children_data)


# ===================================================================
#  HEALTH CHECK
# ===================================================================

@app.get("/health")
async def health():
    return {"status": "ok"}
