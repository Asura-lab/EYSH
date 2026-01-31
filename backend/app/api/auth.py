from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional

from app.config import get_settings
from app.models import UserCreate, UserResponse, Token, TokenData
from app.db import get_users_collection

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    users = get_users_collection()
    from bson import ObjectId
    user = await users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    user["_id"] = str(user["_id"])
    return user


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    users = get_users_collection()
    
    # Check if user exists
    existing = await users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user_dict = user_data.model_dump()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["profile"] = {}
    user_dict["created_at"] = datetime.utcnow()
    
    result = await users.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    
    return UserResponse(
        id=user_dict["id"],
        email=user_dict["email"],
        name=user_dict["name"],
        role=user_dict["role"],
        profile=user_dict["profile"],
        created_at=user_dict["created_at"]
    )


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    users = get_users_collection()
    user = await users.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": str(user["_id"])},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
    )
    
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["_id"],
        email=current_user["email"],
        name=current_user["name"],
        role=current_user["role"],
        profile=current_user.get("profile", {}),
        created_at=current_user["created_at"]
    )
