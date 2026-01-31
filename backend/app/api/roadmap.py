from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId

from app.models import RoadmapResponse, WeekPlan
from app.db import get_roadmaps_collection, get_test_sessions_collection
from app.api.auth import get_current_user
from app.services.ml_service import MLService

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])
ml_service = MLService()


@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(current_user: dict = Depends(get_current_user)):
    """Хэрэглэгчид зориулсан roadmap үүсгэх"""
    roadmaps_col = get_roadmaps_collection()
    sessions_col = get_test_sessions_collection()
    
    # Get user's latest test session
    latest_session = await sessions_col.find_one(
        {"user_id": current_user["_id"]},
        sort=[("completed_at", -1)]
    )
    
    if not latest_session:
        raise HTTPException(
            status_code=400,
            detail="Please complete a diagnostic test first"
        )
    
    # Generate roadmap using ML
    weeks = ml_service.generate_roadmap(
        level=latest_session["predicted_level"],
        weak_topics=latest_session["weak_topics"],
        target_score=current_user.get("profile", {}).get("target_score", 700)
    )
    
    # Save roadmap
    roadmap = {
        "user_id": current_user["_id"],
        "weeks": [w.model_dump() for w in weeks],
        "progress": 0.0,
        "generated_at": datetime.utcnow()
    }
    
    # Upsert - update if exists, insert if not
    result = await roadmaps_col.update_one(
        {"user_id": current_user["_id"]},
        {"$set": roadmap},
        upsert=True
    )
    
    # Get the roadmap
    saved = await roadmaps_col.find_one({"user_id": current_user["_id"]})
    
    return RoadmapResponse(
        id=str(saved["_id"]),
        user_id=str(saved["user_id"]),
        weeks=[WeekPlan(**w) for w in saved["weeks"]],
        progress=saved["progress"],
        generated_at=saved["generated_at"]
    )


@router.get("/", response_model=RoadmapResponse)
async def get_roadmap(current_user: dict = Depends(get_current_user)):
    """Хэрэглэгчийн roadmap авах"""
    roadmaps_col = get_roadmaps_collection()
    
    roadmap = await roadmaps_col.find_one({"user_id": current_user["_id"]})
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    return RoadmapResponse(
        id=str(roadmap["_id"]),
        user_id=str(roadmap["user_id"]),
        weeks=[WeekPlan(**w) for w in roadmap["weeks"]],
        progress=roadmap["progress"],
        generated_at=roadmap["generated_at"],
        updated_at=roadmap.get("updated_at")
    )


@router.patch("/{week_number}/progress")
async def update_progress(
    week_number: int,
    current_user: dict = Depends(get_current_user)
):
    """Тухайн долоо хоногийн progress шинэчлэх"""
    roadmaps_col = get_roadmaps_collection()
    
    result = await roadmaps_col.update_one(
        {"user_id": current_user["_id"], "weeks.week_number": week_number},
        {
            "$set": {
                "weeks.$.completed": True,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Week not found")
    
    # Recalculate overall progress
    roadmap = await roadmaps_col.find_one({"user_id": current_user["_id"]})
    completed = sum(1 for w in roadmap["weeks"] if w.get("completed", False))
    total = len(roadmap["weeks"])
    progress = (completed / total * 100) if total > 0 else 0
    
    await roadmaps_col.update_one(
        {"user_id": current_user["_id"]},
        {"$set": {"progress": progress}}
    )
    
    return {"message": "Progress updated", "progress": progress}
