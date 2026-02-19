"""
SQLAlchemy ORM models for the Kid Caretaker Recommendation App.
"""

import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, ForeignKey, DateTime, Text, Table,
    Boolean,
)
from sqlalchemy.orm import relationship
from database import Base


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class InterestType(str, enum.Enum):
    SCIENCE = "science"
    ART = "art"
    SPORTS = "sports"
    CODING = "coding"


class MoodType(str, enum.Enum):
    HAPPY = "happy"
    CURIOUS = "curious"
    BORED = "bored"
    STRESSED = "stressed"


class CategoryType(str, enum.Enum):
    SCIENCE = "science"
    ART = "art"
    SPORTS = "sports"
    CODING = "coding"
    MUSIC = "music"
    NATURE = "nature"
    MATH = "math"
    HISTORY = "history"
    LANGUAGE = "language"
    FUN = "fun"


# ---------------------------------------------------------------------------
# Association table: child ↔ interests (many-to-many)
# ---------------------------------------------------------------------------

child_interests = Table(
    "child_interests",
    Base.metadata,
    Column("child_id", Integer, ForeignKey("children.id"), primary_key=True),
    Column("interest", String(20), primary_key=True),  # stored as plain string for SQLite compat
)


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class ParentUser(Base):
    """Parent account — owns one or more child profiles."""
    __tablename__ = "parents"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # relationships
    children = relationship("ChildProfile", back_populates="parent", cascade="all, delete-orphan")


class ChildProfile(Base):
    """Child profile created by a parent."""
    __tablename__ = "children"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("parents.id"), nullable=False)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    screen_time_limit = Column(Integer, default=60)
    created_at = Column(DateTime, default=datetime.utcnow)

    # relationships
    parent = relationship("ParentUser", back_populates="children")
    # Interests are stored in the child_interests association table
    # and queried via raw SQL / select() — no ORM relationship needed.
    watch_history = relationship("WatchHistory", back_populates="child", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="child", cascade="all, delete-orphan")


class Video(Base):
    """Video content — seeded or admin-managed."""
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    url = Column(Text, nullable=False)
    category = Column(String(20), nullable=False)   # stored as plain string for SQLite compat
    mood_type = Column(String(20), nullable=False)    # stored as plain string for SQLite compat
    min_age = Column(Integer, nullable=False, default=6)
    max_age = Column(Integer, nullable=False, default=15)
    education_score = Column(Float, nullable=False, default=0.5)
    safety_score = Column(Float, nullable=False, default=0.8)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # CheckConstraints omitted for SQLite compatibility


class WatchHistory(Base):
    """Tracks what a child watched and for how long."""
    __tablename__ = "watch_history"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False)
    watched_at = Column(DateTime, default=datetime.utcnow)
    duration_minutes = Column(Integer, default=0)

    # relationships
    child = relationship("ChildProfile", back_populates="watch_history")
    video = relationship("Video")


class Like(Base):
    """Child-liked / saved videos."""
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # relationships
    child = relationship("ChildProfile", back_populates="likes")
    video = relationship("Video")
