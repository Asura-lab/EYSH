from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.models import QuestionInTest, TestSubmit, TestResult
from app.db import get_questions_collection, get_test_sessions_collection
from app.api.auth import get_current_user
from app.services.ml_service import MLService

router = APIRouter(prefix="/api/tests", tags=["tests"])
ml_service = MLService()


@router.get("/questions", response_model=List[QuestionInTest])
async def get_questions(
    subject: Optional[str] = None,
    count: int = Query(default=10, ge=1, le=50)
):
    """Тест авахад зориулсан асуултууд авах (auth шаардахгүй)"""
    questions_col = get_questions_collection()
    
    query = {}
    if subject:
        query["subject"] = subject
    
    # Topic MN mapping
    topic_mn_map = {
        "algebra": "Алгебр",
        "geometry": "Геометр",
        "trigonometry": "Тригонометр",
        "calculus": "Анализ",
        "probability": "Магадлал",
        "sequences": "Дараалал",
        "functions": "Функц",
        "vectors": "Вектор"
    }
    
    # Use to_list() instead of async for loop for reliability
    pipeline = [
        {"$match": query},
        {"$sample": {"size": count}}
    ]
    
    docs = await questions_col.aggregate(pipeline).to_list(length=count)
    
    questions = []
    for q in docs:
        questions.append(QuestionInTest(
            id=str(q["_id"]),
            subject=q.get("subject", "Математик"),
            topic=q.get("topic", ""),
            topic_mn=topic_mn_map.get(q.get("topic", ""), q.get("topic_mn", "")),
            difficulty=q.get("difficulty", 2),
            content=q.get("content", q.get("question", "")),
            options=q.get("options", []),
            correct_answer=q.get("correct_answer"),
            explanation=q.get("explanation", ""),
            time_limit=q.get("time_limit", 60)
        ))
    
    return questions


@router.post("/submit", response_model=TestResult)
async def submit_test(
    test_data: TestSubmit,
    current_user: dict = Depends(get_current_user)
):
    """Тестийн хариултуудыг илгээж, үр дүн авах"""
    questions_col = get_questions_collection()
    sessions_col = get_test_sessions_collection()
    
    # Calculate score
    correct_count = 0
    question_results = []
    topics_wrong = []
    
    for answer in test_data.answers:
        question = await questions_col.find_one({"_id": ObjectId(answer.question_id)})
        if not question:
            continue
        
        is_correct = question["correct_answer"] == answer.answer
        if is_correct:
            correct_count += 1
        else:
            topics_wrong.append(question["topic"])
        
        question_results.append({
            "question_id": answer.question_id,
            "answer": answer.answer,
            "is_correct": is_correct,
            "time_spent": answer.time_spent
        })
    
    total = len(test_data.answers)
    score = (correct_count / total * 100) if total > 0 else 0
    
    # ML Prediction
    predicted_level = ml_service.predict_level(question_results)
    weak_topics = ml_service.detect_weaknesses(question_results, topics_wrong)
    
    # Save session
    session = {
        "user_id": current_user["_id"],
        "questions": question_results,
        "score": score,
        "predicted_level": predicted_level,
        "weak_topics": weak_topics,
        "completed_at": datetime.utcnow()
    }
    
    result = await sessions_col.insert_one(session)
    
    return TestResult(
        id=str(result.inserted_id),
        score=score,
        total_questions=total,
        correct_count=correct_count,
        predicted_level=predicted_level,
        weak_topics=weak_topics,
        completed_at=session["completed_at"]
    )


@router.get("/history", response_model=List[TestResult])
async def get_test_history(current_user: dict = Depends(get_current_user)):
    """Хэрэглэгчийн тестийн түүх"""
    sessions_col = get_test_sessions_collection()
    
    cursor = sessions_col.find(
        {"user_id": current_user["_id"]}
    ).sort("completed_at", -1).limit(20)
    
    results = []
    async for session in cursor:
        results.append(TestResult(
            id=str(session["_id"]),
            score=session["score"],
            total_questions=len(session["questions"]),
            correct_count=sum(1 for q in session["questions"] if q["is_correct"]),
            predicted_level=session["predicted_level"],
            weak_topics=session["weak_topics"],
            completed_at=session["completed_at"]
        ))
    
    return results
