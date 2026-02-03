from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class TopicContentBase(BaseModel):
    topic: str  # Unique identifier relevant to what's used in Roadmap generator
    title: str
    youtube_id: str = ""
    summary: str
    difficulty: str = "beginner"

class TopicContentCreate(TopicContentBase):
    pass

class TopicContentInDB(TopicContentBase):
    id: str = Field(alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class TopicContentResponse(TopicContentBase):
    pass
