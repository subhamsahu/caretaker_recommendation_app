"""
Seed the database with 15 sample videos for the MVP.
Run once after tables are created:
    python seed.py
"""

import asyncio
from database import engine, async_session, init_db, Base
from models import Video


SAMPLE_VIDEOS = [
    # --- SCIENCE ---
    Video(title="How Volcanoes Erupt — Crash Course Kids", url="https://www.youtube.com/watch?v=vKGT2y2tGlA", category="science", mood_type="curious", min_age=6, max_age=12, education_score=0.9, safety_score=0.95),
    Video(title="Why Is the Sky Blue? — SciShow Kids", url="https://www.youtube.com/watch?v=R3O7GKMfWgk", category="science", mood_type="happy", min_age=6, max_age=10, education_score=0.85, safety_score=0.95),

    # --- ART ---
    Video(title="Drawing Animals for Kids — Art for Kids Hub", url="https://www.youtube.com/watch?v=ez7KO-wUpco", category="art", mood_type="happy", min_age=6, max_age=12, education_score=0.7, safety_score=0.95),
    Video(title="Origami Butterfly Step-by-Step", url="https://www.youtube.com/watch?v=kfIKNfqEiGM", category="art", mood_type="stressed", min_age=6, max_age=15, education_score=0.6, safety_score=0.9),

    # --- SPORTS ---
    Video(title="Yoga for Kids — Cosmic Kids", url="https://www.youtube.com/watch?v=35mDSj5-pnU", category="sports", mood_type="stressed", min_age=6, max_age=15, education_score=0.5, safety_score=0.95),
    Video(title="Soccer Tricks for Beginners", url="https://www.youtube.com/watch?v=2jN8xBqsB90", category="sports", mood_type="bored", min_age=8, max_age=15, education_score=0.4, safety_score=0.9),

    # --- CODING ---
    Video(title="Scratch Programming for Kids — Beginner", url="https://www.youtube.com/watch?v=szQjAhNZEbI", category="coding", mood_type="curious", min_age=8, max_age=15, education_score=0.95, safety_score=0.95),
    Video(title="Build a Minecraft Mod — Easy Steps", url="https://www.youtube.com/watch?v=M03J7-bnvho", category="coding", mood_type="happy", min_age=10, max_age=15, education_score=0.8, safety_score=0.85),

    # --- MUSIC ---
    Video(title="Ukulele for Beginners — Kids Edition", url="https://www.youtube.com/watch?v=E6O8-UGGi1I", category="music", mood_type="bored", min_age=6, max_age=12, education_score=0.65, safety_score=0.95),
    Video(title="Calming Music & Nature Sounds for Focus", url="https://www.youtube.com/watch?v=lCOF9LN_Zxs", category="music", mood_type="stressed", min_age=6, max_age=15, education_score=0.3, safety_score=1.0),

    # --- NATURE ---
    Video(title="Amazing Ocean Animals — National Geographic Kids", url="https://www.youtube.com/watch?v=WiU_SaOOinw", category="nature", mood_type="curious", min_age=6, max_age=15, education_score=0.85, safety_score=0.95),
    Video(title="Rainforest Adventure — Virtual Field Trip", url="https://www.youtube.com/watch?v=pcFq_T4MxJA", category="nature", mood_type="bored", min_age=6, max_age=12, education_score=0.8, safety_score=0.9),

    # --- MATH ---
    Video(title="Times Tables Song — Fun Math for Kids", url="https://www.youtube.com/watch?v=2SKSEqJJhgY", category="math", mood_type="happy", min_age=6, max_age=10, education_score=0.9, safety_score=1.0),

    # --- FUN ---
    Video(title="Funny Science Experiments You Can Do at Home", url="https://www.youtube.com/watch?v=3qWSCL9hZn8", category="fun", mood_type="bored", min_age=8, max_age=15, education_score=0.6, safety_score=0.85),
    Video(title="Top 10 Optical Illusions for Kids", url="https://www.youtube.com/watch?v=4Tu_1aUm_Rs", category="fun", mood_type="curious", min_age=6, max_age=15, education_score=0.5, safety_score=0.9),
]


async def seed():
    """Insert sample videos if the table is empty."""
    await init_db()
    async with async_session() as session:
        result = await session.execute(Video.__table__.select().limit(1))
        if result.first():
            print("⚡ Videos already seeded — skipping.")
            return

        session.add_all(SAMPLE_VIDEOS)
        await session.commit()
        print(f"✅ Seeded {len(SAMPLE_VIDEOS)} sample videos.")


if __name__ == "__main__":
    asyncio.run(seed())
