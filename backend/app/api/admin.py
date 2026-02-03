from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.db import get_users_collection, get_topics_collection, get_questions_collection, get_topic_views_collection, get_test_sessions_collection, get_roadmaps_collection
from app.api.auth import get_current_user
from app.models import UserResponse, UserUpdate
from bson import ObjectId
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Dependency to check if user is admin
async def get_current_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have admin privileges"
        )
    return current_user

@router.get("/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_admin)):
    users_collection = get_users_collection()
    topics_collection = get_topics_collection()
    questions_collection = get_questions_collection()
    
    total_users = await users_collection.count_documents({})
    total_topics = await topics_collection.count_documents({})
    total_questions = await questions_collection.count_documents({})
    
    return {
        "total_users": total_users,
        "total_topics": total_topics,
        "total_questions": total_questions
    }

@router.get("/users")
async def get_all_users(current_user: dict = Depends(get_current_admin)):
    users_collection = get_users_collection()
    # Sort by created_at desc
    cursor = users_collection.find().sort("created_at", -1)
    
    users = []
    async for user in cursor:
        # UserResponse model expects 'id' but mongo has '_id'
        user_data = {
            "id": str(user["_id"]),
            "email": user.get("email"),
            "name": user.get("name"),
            "role": user.get("role", "student"),
            "created_at": user.get("created_at"),
            "profile": user.get("profile", {})
        }
        users.append(user_data)
    return users

@router.patch("/users/{user_id}")
async def update_user(user_id: str, updates: UserUpdate, current_user: dict = Depends(get_current_admin)):
    users_collection = get_users_collection()
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    
    if update_data:
        await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    # Return formatted
    user_data = {
        "id": str(user["_id"]),
        "email": user.get("email"),
        "name": user.get("name"),
        "role": user.get("role", "student"),
        "created_at": user.get("created_at"),
        "profile": user.get("profile", {})
    }
    return user_data


@router.get("/analytics/topic-views")
async def get_topic_views_analytics(current_user: dict = Depends(get_current_admin)):
    """Хичээлүүдийн үзэлтийн статистик"""
    views_collection = get_topic_views_collection()
    
    # Aggregate views by topic
    pipeline = [
        {
            "$group": {
                "_id": "$topic",
                "view_count": {"$sum": 1},
                "unique_users": {"$addToSet": "$user_id"},
                "last_viewed": {"$max": "$viewed_at"}
            }
        },
        {
            "$project": {
                "topic": "$_id",
                "view_count": 1,
                "unique_users": {"$size": "$unique_users"},
                "last_viewed": 1
            }
        },
        {"$sort": {"view_count": -1}},
        {"$limit": 20}
    ]
    
    cursor = views_collection.aggregate(pipeline)
    results = []
    async for doc in cursor:
        results.append({
            "topic": doc["topic"],
            "view_count": doc["view_count"],
            "unique_users": doc["unique_users"],
            "last_viewed": doc.get("last_viewed")
        })
    
    return results


@router.get("/analytics/daily-views")
async def get_daily_views(days: int = 30, current_user: dict = Depends(get_current_admin)):
    """Сүүлийн X өдрийн өдөр тутмын үзэлт"""
    views_collection = get_topic_views_collection()
    start_date = datetime.utcnow() - timedelta(days=days)
    
    pipeline = [
        {"$match": {"viewed_at": {"$gte": start_date}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$viewed_at"}
                },
                "views": {"$sum": 1},
                "unique_users": {"$addToSet": "$user_id"}
            }
        },
        {
            "$project": {
                "date": "$_id",
                "views": 1,
                "unique_users": {"$size": "$unique_users"}
            }
        },
        {"$sort": {"date": 1}}
    ]
    
    cursor = views_collection.aggregate(pipeline)
    results = []
    async for doc in cursor:
        results.append({
            "date": doc["date"],
            "views": doc["views"],
            "unique_users": doc["unique_users"]
        })
    
    return results


@router.get("/analytics/user-activity")
async def get_user_activity(current_user: dict = Depends(get_current_admin)):
    """Хэрэглэгчдийн идэвхийн статистик"""
    users_collection = get_users_collection()
    test_sessions = get_test_sessions_collection()
    views_collection = get_topic_views_collection()
    
    # Count users by role
    role_pipeline = [
        {"$group": {"_id": "$role", "count": {"$sum": 1}}}
    ]
    role_cursor = users_collection.aggregate(role_pipeline)
    users_by_role = {}
    async for doc in role_cursor:
        users_by_role[doc["_id"] or "student"] = doc["count"]
    
    # New users in last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_users_week = await users_collection.count_documents({
        "created_at": {"$gte": week_ago}
    })
    
    # New users in last 30 days
    month_ago = datetime.utcnow() - timedelta(days=30)
    new_users_month = await users_collection.count_documents({
        "created_at": {"$gte": month_ago}
    })
    
    # Total test sessions
    total_tests = await test_sessions.count_documents({})
    
    # Tests in last 7 days
    tests_week = await test_sessions.count_documents({
        "created_at": {"$gte": week_ago}
    })
    
    return {
        "users_by_role": users_by_role,
        "new_users_week": new_users_week,
        "new_users_month": new_users_month,
        "total_tests": total_tests,
        "tests_this_week": tests_week
    }


@router.get("/analytics/suggested-topics")
async def get_suggested_topics(current_user: dict = Depends(get_current_admin)):
    """Нэмэхийг санал болгож буй хичээлүүд (хамгийн их хайсан боловч байхгүй)"""
    views_collection = get_topic_views_collection()
    topics_collection = get_topics_collection()
    
    # Get all existing topics
    existing_topics = set()
    async for topic in topics_collection.find({}, {"topic": 1}):
        existing_topics.add(topic["topic"])
    
    # Get viewed topics and filter out existing ones
    pipeline = [
        {
            "$group": {
                "_id": "$topic",
                "search_count": {"$sum": 1},
                "unique_users": {"$addToSet": "$user_id"}
            }
        },
        {
            "$project": {
                "topic": "$_id",
                "search_count": 1,
                "unique_users": {"$size": "$unique_users"}
            }
        },
        {"$sort": {"search_count": -1}}
    ]
    
    cursor = views_collection.aggregate(pipeline)
    suggestions = []
    async for doc in cursor:
        topic_name = doc["topic"]
        # Check if this topic doesn't have a proper match in existing topics
        is_existing = topic_name in existing_topics
        if not is_existing:
            # Also check for partial matches
            for existing in existing_topics:
                if existing in topic_name or topic_name in existing:
                    is_existing = True
                    break
        
        if not is_existing:
            suggestions.append({
                "topic": topic_name,
                "demand_count": doc["search_count"],
                "unique_users": doc["unique_users"]
            })
    
    return suggestions[:10]  # Top 10 suggestions


@router.get("/analytics/weekly-growth")
async def get_weekly_growth(weeks: int = 8, current_user: dict = Depends(get_current_admin)):
    """Долоо хоног тутмын өсөлт"""
    users_collection = get_users_collection()
    
    results = []
    for i in range(weeks - 1, -1, -1):
        week_start = datetime.utcnow() - timedelta(weeks=i+1)
        week_end = datetime.utcnow() - timedelta(weeks=i)
        
        new_users = await users_collection.count_documents({
            "created_at": {"$gte": week_start, "$lt": week_end}
        })
        
        results.append({
            "week": f"Week {weeks - i}",
            "week_start": week_start.strftime("%Y-%m-%d"),
            "new_users": new_users
        })
    
    return results


@router.get("/analytics/test-performance")
async def get_test_performance(current_user: dict = Depends(get_current_admin)):
    """Тестийн гүйцэтгэлийн статистик"""
    test_sessions = get_test_sessions_collection()
    
    # Average scores by subject
    pipeline = [
        {
            "$group": {
                "_id": "$subject",
                "avg_score": {"$avg": "$score"},
                "total_tests": {"$sum": 1},
                "max_score": {"$max": "$score"},
                "min_score": {"$min": "$score"}
            }
        },
        {"$sort": {"total_tests": -1}}
    ]
    
    cursor = test_sessions.aggregate(pipeline)
    results = []
    async for doc in cursor:
        results.append({
            "subject": doc["_id"] or "Математик",
            "avg_score": round(doc["avg_score"] or 0, 1),
            "total_tests": doc["total_tests"],
            "max_score": doc.get("max_score", 0),
            "min_score": doc.get("min_score", 0)
        })
    
    return results
