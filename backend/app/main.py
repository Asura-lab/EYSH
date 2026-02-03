from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db import connect_to_mongo, close_mongo_connection, get_users_collection
from app.api import auth_router, tests_router, roadmap_router, mentoring_router, topics_router, problems_router
from app.api.admin import router as admin_router
from app.api.auth import get_password_hash
from datetime import datetime


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    
    # Create default admin user
    try:
        users = get_users_collection()
        admin_email = "admin@eysh.mn"
        existing_admin = await users.find_one({"email": admin_email})
        
        if not existing_admin:
            print("Creating default admin user...")
            admin_user = {
                "email": admin_email,
                "hashed_password": get_password_hash("admin123"),
                "name": "System Administrator",
                "role": "admin",
                "profile": {},
                "created_at": datetime.utcnow()
            }
            await users.insert_one(admin_user)
            print(f"Admin user created: {admin_email} / admin123")
        else:
            # Ensure role is admin
            if existing_admin.get("role") != "admin":
                await users.update_one({"email": admin_email}, {"$set": {"role": "admin"}})
    except Exception as e:
        print(f"Error creating admin user: {e}")
        
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="EYSH API",
    description="Элсэлтийн Шалгалтанд Бэлдэх Систем",
    version="0.1.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(tests_router)
app.include_router(roadmap_router)
app.include_router(mentoring_router)
app.include_router(topics_router)
app.include_router(admin_router)
app.include_router(problems_router)


@app.get("/")
async def root():
    return {"message": "EYSH API", "version": "0.1.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
