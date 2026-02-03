from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pathlib import Path
import json
from app.db import get_topics_collection, get_topic_views_collection
from app.models import TopicContentInDB, TopicContentCreate
from app.api.auth import get_current_user
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/topics", tags=["topics"])


def _load_seed_topics() -> List[dict]:
    data_path = Path(__file__).parent.parent / "data" / "eesh_topics_mn.json"
    if data_path.exists():
        try:
            with data_path.open("r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        except json.JSONDecodeError:
            pass
    return []


# Seed Data (loaded from JSON if available)
SEED_TOPICS = _load_seed_topics()


@router.post("/seed", status_code=status.HTTP_201_CREATED)
async def seed_topics():
    topics_collection = get_topics_collection()

    count = 0
    for item in SEED_TOPICS:
        # Create full document
        doc = item.copy()
        doc["created_at"] = datetime.utcnow()
        if not doc.get("youtube_id"):
            doc.pop("youtube_id", None)

        # Upsert
        result = await topics_collection.update_one(
            {"topic": item["topic"]},
            {"$set": doc},
            upsert=True,
        )
        if result.upserted_id:
            count += 1

    return {"message": f"Topics seeded successfully. Added {count} new topics."}


async def record_topic_view(topic_name: str, user_id: str):
    """Record a topic view for analytics"""
    views_collection = get_topic_views_collection()
    await views_collection.insert_one({
        "topic": topic_name,
        "user_id": user_id,
        "viewed_at": datetime.utcnow(),
    })


@router.get("/{topic_name}", response_model=TopicContentInDB)
async def get_topic_content(topic_name: str, current_user: dict = Depends(get_current_user)):
    topics_collection = get_topics_collection()
    # Search via regex for partial match if exact match fails?
    # For now, let's look for exact first, then partial.

    # Record the view for analytics
    user_id = str(current_user.get("_id", current_user.get("id", "")))
    await record_topic_view(topic_name, user_id)

    # Try exact match
    topic = await topics_collection.find_one({"topic": topic_name})

    if not topic:
        # Try simplified match (e.g. if topic_name is "Тригонометрийн тэгшитгэл" but we have "Тригонометр")
        for seed in SEED_TOPICS:
            if seed.get("topic") and (seed["topic"] in topic_name or topic_name in seed["topic"]):
                topic = await topics_collection.find_one({"topic": seed["topic"]})
                break

    if not topic:
        # Fallback for ANY topic - creates a generic response so UI works
        return TopicContentInDB(
            _id=str(ObjectId()),
            topic=topic_name,
            title=f"{topic_name}",
            youtube_id="",
            summary=f"{topic_name} сэдвийн дэлгэрэнгүй хичээл болон жишээ бодлогууд.",
            difficulty="beginner",
            created_at=datetime.utcnow(),
        )

    topic["_id"] = str(topic["_id"])
    return topic
