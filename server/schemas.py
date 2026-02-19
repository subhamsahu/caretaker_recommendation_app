"""
Pydantic schemas for request / response validation.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class ParentRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)


class ParentLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ParentOut(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Child
# ---------------------------------------------------------------------------

class ChildCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    age: int = Field(..., ge=6, le=15)
    interests: List[str] = Field(
        ...,
        description="List of interests: science, art, sports, coding",
    )
    screen_time_limit: int = Field(60, ge=1, le=480, description="Minutes per day")


class ChildOut(BaseModel):
    id: int
    name: str
    age: int
    interests: List[str]
    screen_time_limit: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Video
# ---------------------------------------------------------------------------

class VideoOut(BaseModel):
    id: int
    title: str
    url: str
    category: str
    mood_type: str
    min_age: int
    max_age: int
    education_score: float
    safety_score: float

    class Config:
        from_attributes = True


class VideoRecommendation(VideoOut):
    """Extended with a relevance score for recommendations."""
    relevance_score: float = 0.0


# ---------------------------------------------------------------------------
# Watch History
# ---------------------------------------------------------------------------

class WatchCreate(BaseModel):
    duration_minutes: int = Field(..., ge=1, description="Minutes watched")


class WatchHistoryOut(BaseModel):
    id: int
    child_id: int
    video_id: int
    watched_at: datetime
    duration_minutes: int
    video: Optional[VideoOut] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Like
# ---------------------------------------------------------------------------

class LikeOut(BaseModel):
    id: int
    child_id: int
    video_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

class CategoryStat(BaseModel):
    category: str
    total_minutes: int


class ChildDashboard(BaseModel):
    child_name: str
    total_watch_minutes: int
    learning_ratio: float
    entertainment_ratio: float
    top_categories: List[CategoryStat]


class ParentDashboard(BaseModel):
    parent_username: str
    children: List[ChildDashboard]
