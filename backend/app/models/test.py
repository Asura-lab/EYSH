from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Question Models
class QuestionBase(BaseModel):
    subject: str
    topic: str
    difficulty: int = Field(ge=1, le=10)
    content: str
    options: List[str]
    correct_answer: int
    explanation: Optional[str] = None
    tags: List[str] = []


class QuestionCreate(QuestionBase):
    pass


class QuestionResponse(QuestionBase):
    id: str


class QuestionInTest(BaseModel):
    id: str
    subject: str
    topic: str
    difficulty: int
    content: str
    options: List[str]
    # correct_answer hidden from student


# Test Session Models
class AnswerSubmit(BaseModel):
    question_id: str
    answer: int
    time_spent: int  # seconds


class TestSubmit(BaseModel):
    answers: List[AnswerSubmit]


class TestResult(BaseModel):
    id: str
    score: float
    total_questions: int
    correct_count: int
    predicted_level: int
    weak_topics: List[str]
    completed_at: datetime


class TestSessionInDB(BaseModel):
    user_id: str
    questions: List[dict]
    score: float
    predicted_level: int
    weak_topics: List[str]
    completed_at: datetime = Field(default_factory=datetime.utcnow)
