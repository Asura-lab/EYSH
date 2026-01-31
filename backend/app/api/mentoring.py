from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.models import (
    MentorProfileCreate,
    MentorProfileResponse,
    MentorshipRequest,
    MentorshipResponse,
)
from app.db import (
    get_mentor_profiles_collection,
    get_mentorships_collection,
    get_users_collection,
)
from app.api.auth import get_current_user
from app.services.ml_service import MLService

router = APIRouter(prefix="/api/mentoring", tags=["mentoring"])
ml_service = MLService()


@router.get("/mentors", response_model=List[MentorProfileResponse])
async def get_mentors(
    subject: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Mentor жагсаалт авах"""
    mentors_col = get_mentor_profiles_collection()
    users_col = get_users_collection()
    
    query = {}
    if subject:
        query["subjects"] = {"$in": [subject]}
    
    mentors = []
    async for mentor in mentors_col.find(query).sort("rating", -1):
        user = await users_col.find_one({"_id": ObjectId(mentor["user_id"])})
        if user:
            mentors.append(MentorProfileResponse(
                id=str(mentor["_id"]),
                user_id=str(mentor["user_id"]),
                user_name=user["name"],
                university=mentor["university"],
                major=mentor["major"],
                subjects=mentor["subjects"],
                experience=mentor.get("experience"),
                bio=mentor.get("bio"),
                availability=mentor.get("availability", []),
                rating=mentor.get("rating", 0),
                review_count=mentor.get("review_count", 0)
            ))
    
    return mentors


@router.post("/become-mentor", response_model=MentorProfileResponse)
async def become_mentor(
    profile: MentorProfileCreate,
    current_user: dict = Depends(get_current_user)
):
    """Mentor болох"""
    mentors_col = get_mentor_profiles_collection()
    users_col = get_users_collection()
    
    # Check if already a mentor
    existing = await mentors_col.find_one({"user_id": current_user["_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Already registered as mentor")
    
    # Create mentor profile
    mentor_data = profile.model_dump()
    mentor_data["user_id"] = current_user["_id"]
    mentor_data["rating"] = 0.0
    mentor_data["review_count"] = 0
    mentor_data["created_at"] = datetime.utcnow()
    
    result = await mentors_col.insert_one(mentor_data)
    
    # Update user role
    await users_col.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"role": "mentor"}}
    )
    
    return MentorProfileResponse(
        id=str(result.inserted_id),
        user_id=current_user["_id"],
        user_name=current_user["name"],
        **profile.model_dump()
    )


@router.post("/request/{mentor_id}", response_model=MentorshipResponse)
async def request_mentor(
    mentor_id: str,
    request: MentorshipRequest,
    current_user: dict = Depends(get_current_user)
):
    """Mentor-т хүсэлт илгээх"""
    mentors_col = get_mentor_profiles_collection()
    mentorships_col = get_mentorships_collection()
    users_col = get_users_collection()
    
    # Check mentor exists
    mentor = await mentors_col.find_one({"_id": ObjectId(mentor_id)})
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    mentor_user = await users_col.find_one({"_id": ObjectId(mentor["user_id"])})
    
    # Create mentorship
    mentorship = {
        "student_id": current_user["_id"],
        "mentor_id": mentor["user_id"],
        "subjects": request.subjects,
        "status": "pending",
        "schedule": [],
        "created_at": datetime.utcnow()
    }
    
    result = await mentorships_col.insert_one(mentorship)
    
    return MentorshipResponse(
        id=str(result.inserted_id),
        student_id=current_user["_id"],
        student_name=current_user["name"],
        mentor_id=str(mentor["user_id"]),
        mentor_name=mentor_user["name"],
        subjects=request.subjects,
        status="pending",
        schedule=[],
        created_at=mentorship["created_at"]
    )


@router.get("/my-mentor", response_model=Optional[MentorshipResponse])
async def get_my_mentor(current_user: dict = Depends(get_current_user)):
    """Миний mentor авах"""
    mentorships_col = get_mentorships_collection()
    users_col = get_users_collection()
    
    mentorship = await mentorships_col.find_one({
        "student_id": current_user["_id"],
        "status": {"$in": ["pending", "active"]}
    })
    
    if not mentorship:
        return None
    
    mentor_user = await users_col.find_one({"_id": ObjectId(mentorship["mentor_id"])})
    
    return MentorshipResponse(
        id=str(mentorship["_id"]),
        student_id=str(mentorship["student_id"]),
        student_name=current_user["name"],
        mentor_id=str(mentorship["mentor_id"]),
        mentor_name=mentor_user["name"] if mentor_user else "Unknown",
        subjects=mentorship["subjects"],
        status=mentorship["status"],
        schedule=mentorship.get("schedule", []),
        created_at=mentorship["created_at"]
    )
