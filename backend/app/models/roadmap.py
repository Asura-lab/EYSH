from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class WeekPlan(BaseModel):
    week_number: int
    topics: List[str]
    goals: List[str]
    resources: List[str]
    practice_question_ids: List[str] = []
    completed: bool = False


class RoadmapCreate(BaseModel):
    user_id: str
    weeks: List[WeekPlan]


class RoadmapResponse(BaseModel):
    id: str
    user_id: str
    weeks: List[WeekPlan]
    progress: float = 0.0
    generated_at: datetime
    updated_at: Optional[datetime] = None


class RoadmapInDB(BaseModel):
    user_id: str
    weeks: List[WeekPlan]
    progress: float = 0.0
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
