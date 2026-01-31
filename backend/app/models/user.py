from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Literal
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, handler):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)


# User Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: Literal["student", "mentor", "admin"] = "student"


class UserCreate(UserBase):
    password: str


class UserProfile(BaseModel):
    grade: Optional[int] = None
    target_university: Optional[str] = None
    target_score: Optional[int] = None
    subjects: List[str] = []


class UserInDB(UserBase):
    id: str = Field(alias="_id")
    hashed_password: str
    profile: UserProfile = UserProfile()
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class UserResponse(UserBase):
    id: str
    profile: UserProfile
    created_at: datetime


# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None
