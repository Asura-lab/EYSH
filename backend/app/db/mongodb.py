from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from app.config import get_settings

settings = get_settings()


class Database:
    client: AsyncIOMotorClient = None
    db = None


db = Database()


async def connect_to_mongo():
    """MongoDB холболт үүсгэх"""
    db.client = AsyncIOMotorClient(settings.mongodb_url)
    db.db = db.client[settings.database_name]
    print(f"Connected to MongoDB: {settings.database_name}")


async def close_mongo_connection():
    """MongoDB холболт хаах"""
    if db.client:
        db.client.close()
        print("Closed MongoDB connection")


def get_database():
    """Database instance авах"""
    return db.db


# Collections
def get_users_collection():
    return db.db["users"]


def get_questions_collection():
    return db.db["questions"]


def get_test_sessions_collection():
    return db.db["test_sessions"]


def get_roadmaps_collection():
    return db.db["roadmaps"]


def get_mentorships_collection():
    return db.db["mentorships"]


def get_mentor_profiles_collection():
    return db.db["mentor_profiles"]


def get_topics_collection():
    return db.db["topics"]


def get_topic_views_collection():
    return db.db["topic_views"]


def get_problems_collection():
    return db.db["problems"]


def get_problem_images_bucket():
    return AsyncIOMotorGridFSBucket(db.db, bucket_name="problem_images")
