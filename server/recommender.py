"""
Recommendation engine — tag-based filtering with diversity logic.

Algorithm (MVP):
1. Match child interests → video category.
2. Match mood type.
3. Filter by age range.
4. Sort by (safety_score + education_score) descending.
5. Apply category-diversity penalty to avoid repeated categories.
"""

from typing import List

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from models import Video, ChildProfile, WatchHistory, Like, child_interests


# Map interest names to compatible video categories
INTEREST_TO_CATEGORIES = {
    "science": ["science", "nature", "math"],
    "art": ["art", "music", "history"],
    "sports": ["sports", "fun"],
    "coding": ["coding", "math", "science"],
}


async def get_recommendations(
    db: AsyncSession,
    child: ChildProfile,
    mood: str,
    limit: int = 10,
) -> List[dict]:
    """
    Return a ranked list of recommended videos for *child* given their
    current *mood*.

    Each returned dict mirrors the VideoRecommendation schema.
    """

    # 1. Resolve child interests → allowed categories
    result = await db.execute(
        select(child_interests.c.interest).where(child_interests.c.child_id == child.id)
    )
    raw_interests = [row[0] for row in result.fetchall()]
    # raw_interests are plain strings like "science", "art"
    interest_strs = [str(i) for i in raw_interests]

    allowed_categories = set()
    for interest in interest_strs:
        for cat in INTEREST_TO_CATEGORIES.get(interest, [interest]):
            allowed_categories.add(cat)

    # Always include "fun" to guarantee at least some entertainment content
    allowed_categories.add("fun")

    # 2. Fetch candidate videos matching mood + age range
    mood_lower = mood.lower()
    stmt = (
        select(Video)
        .where(
            and_(
                Video.mood_type == mood_lower,
                Video.min_age <= child.age,
                Video.max_age >= child.age,
                Video.is_active == True,  # noqa: E712
            )
        )
    )
    result = await db.execute(stmt)
    candidates = result.scalars().all()

    # 3. Filter by allowed categories
    filtered = [v for v in candidates if v.category in allowed_categories]

    # If no match by category, fall back to all candidates
    if not filtered:
        filtered = list(candidates)

    # 4. Get recently watched video IDs to deprioritize
    recent_stmt = (
        select(WatchHistory.video_id)
        .where(WatchHistory.child_id == child.id)
        .order_by(WatchHistory.watched_at.desc())
        .limit(20)
    )
    result = await db.execute(recent_stmt)
    recently_watched_ids = {row[0] for row in result.fetchall()}

    # 5. Get liked video IDs to slightly boost
    liked_stmt = select(Like.video_id).where(Like.child_id == child.id)
    result = await db.execute(liked_stmt)
    liked_ids = {row[0] for row in result.fetchall()}

    # 6. Score each video
    scored: List[dict] = []
    category_count: dict = {}
    for video in filtered:
        cat = video.category
        base_score = video.safety_score + video.education_score  # 0–2

        # Diversity penalty: lower score for categories already seen
        cat_freq = category_count.get(cat, 0)
        diversity_penalty = cat_freq * 0.3

        # Recently watched penalty
        recency_penalty = 0.5 if video.id in recently_watched_ids else 0.0

        # Liked boost
        liked_boost = 0.15 if video.id in liked_ids else 0.0

        relevance = round(base_score - diversity_penalty - recency_penalty + liked_boost, 4)

        scored.append({
            "id": video.id,
            "title": video.title,
            "url": video.url,
            "category": cat,
            "mood_type": video.mood_type,
            "min_age": video.min_age,
            "max_age": video.max_age,
            "education_score": video.education_score,
            "safety_score": video.safety_score,
            "relevance_score": relevance,
        })

        category_count[cat] = cat_freq + 1

    # 7. Sort by relevance descending & return top N
    scored.sort(key=lambda v: v["relevance_score"], reverse=True)
    return scored[:limit]
