from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ProblemImage(BaseModel):
    id: str
    filename: Optional[str] = None
    content_type: Optional[str] = None
    source_url: Optional[str] = None


class ProblemBase(BaseModel):
    subject: str = "Математик"
    topic: str
    difficulty: str = "beginner"  # beginner | intermediate | advanced
    text: str
    images: List[ProblemImage] = Field(default_factory=list)
    source: Optional[str] = None
    source_url: Optional[str] = None
    source_ref: Optional[str] = None
    number: Optional[int] = None
    tags: List[str] = Field(default_factory=list)


class ProblemCreate(ProblemBase):
    pass


class ProblemUpdate(BaseModel):
    subject: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    text: Optional[str] = None
    images: Optional[List[ProblemImage]] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    source_ref: Optional[str] = None
    number: Optional[int] = None
    tags: Optional[List[str]] = None


class ProblemInDB(ProblemBase):
    id: str = Field(alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class ProblemResponse(ProblemBase):
    id: str
    created_at: datetime
