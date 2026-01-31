from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db import connect_to_mongo, close_mongo_connection
from app.api import auth_router, tests_router, roadmap_router, mentoring_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
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


@app.get("/")
async def root():
    return {"message": "EYSH API", "version": "0.1.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
