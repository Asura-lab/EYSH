from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class TimeSlot(BaseModel):
    day_of_week: int  # 0-6 (Monday-Sunday)
    start_time: str  # "09:00"
    end_time: str  # "10:00"


class MentorProfileBase(BaseModel):
    university: str
    major: str
    subjects: List[str]
    experience: Optional[str] = None
    bio: Optional[str] = None
    availability: List[TimeSlot] = []


class MentorProfileCreate(MentorProfileBase):
    pass


class MentorProfileResponse(MentorProfileBase):
    id: str
    user_id: str
    user_name: str
    rating: float = 0.0
    review_count: int = 0


class MentorProfileInDB(MentorProfileBase):
    user_id: str
    rating: float = 0.0
    review_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Mentorship Models
class MentorshipRequest(BaseModel):
    mentor_id: str
    subjects: List[str]
    message: Optional[str] = None


class MentorshipResponse(BaseModel):
    id: str
    student_id: str
    student_name: str
    mentor_id: str
    mentor_name: str
    subjects: List[str]
    status: Literal["pending", "active", "completed", "cancelled"]
    schedule: List[TimeSlot] = []
    created_at: datetime


class MentorshipInDB(BaseModel):
    student_id: str
    mentor_id: str
    subjects: List[str]
    status: Literal["pending", "active", "completed", "cancelled"] = "pending"
    schedule: List[TimeSlot] = []
    rating: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
