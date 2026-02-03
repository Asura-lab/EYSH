from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
import io

from app.db import get_problems_collection, get_problem_images_bucket
from app.models import ProblemCreate, ProblemUpdate, ProblemResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/problems", tags=["problems"])


async def get_current_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="You do not have admin privileges")
    return current_user


@router.get("", response_model=List[ProblemResponse])
async def list_problems(
    subject: Optional[str] = None,
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    source: Optional[str] = None,
    limit: int = Query(default=20, ge=1, le=200),
    skip: int = Query(default=0, ge=0),
    current_user: dict = Depends(get_current_user),
):
    problems = get_problems_collection()
    query = {}
    if subject:
        query["subject"] = subject
    if topic:
        query["topic"] = topic
    if difficulty:
        query["difficulty"] = difficulty
    if source:
        query["source"] = source

    cursor = problems.find(query).sort("created_at", -1).skip(skip).limit(limit)
    items: List[ProblemResponse] = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        items.append(ProblemResponse(**doc))
    return items


@router.get("/{problem_id}", response_model=ProblemResponse)
async def get_problem(problem_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(problem_id):
        raise HTTPException(status_code=400, detail="Invalid problem id")
    problems = get_problems_collection()
    doc = await problems.find_one({"_id": ObjectId(problem_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Problem not found")
    doc["id"] = str(doc["_id"])
    return ProblemResponse(**doc)


@router.post("", response_model=ProblemResponse)
async def create_problem(
    payload: ProblemCreate,
    current_user: dict = Depends(get_current_admin),
):
    problems = get_problems_collection()
    doc = payload.model_dump()
    doc["created_at"] = datetime.utcnow()
    result = await problems.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return ProblemResponse(**doc)


@router.patch("/{problem_id}", response_model=ProblemResponse)
async def update_problem(
    problem_id: str,
    payload: ProblemUpdate,
    current_user: dict = Depends(get_current_admin),
):
    if not ObjectId.is_valid(problem_id):
        raise HTTPException(status_code=400, detail="Invalid problem id")
    problems = get_problems_collection()
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    await problems.update_one({"_id": ObjectId(problem_id)}, {"$set": update_data})
    doc = await problems.find_one({"_id": ObjectId(problem_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Problem not found")
    doc["id"] = str(doc["_id"])
    return ProblemResponse(**doc)


@router.delete("/{problem_id}")
async def delete_problem(
    problem_id: str,
    current_user: dict = Depends(get_current_admin),
):
    if not ObjectId.is_valid(problem_id):
        raise HTTPException(status_code=400, detail="Invalid problem id")
    problems = get_problems_collection()
    doc = await problems.find_one({"_id": ObjectId(problem_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Problem not found")

    bucket = get_problem_images_bucket()
    for image in doc.get("images", []) or []:
        image_id = image.get("id")
        if image_id and ObjectId.is_valid(image_id):
            try:
                await bucket.delete(ObjectId(image_id))
            except Exception:
                pass

    await problems.delete_one({"_id": ObjectId(problem_id)})
    return {"status": "deleted", "id": problem_id}


@router.post("/images")
async def upload_problem_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_admin),
):
    bucket = get_problem_images_bucket()
    data = await file.read()
    metadata = {"content_type": file.content_type}
    file_id = await bucket.upload_from_stream(
        file.filename,
        io.BytesIO(data),
        metadata=metadata,
    )
    return {
        "id": str(file_id),
        "filename": file.filename,
        "content_type": file.content_type,
    }


@router.get("/images/{image_id}")
async def get_problem_image(image_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(image_id):
        raise HTTPException(status_code=400, detail="Invalid image id")
    bucket = get_problem_images_bucket()
    try:
        grid_out = await bucket.open_download_stream(ObjectId(image_id))
    except Exception:
        raise HTTPException(status_code=404, detail="Image not found")

    async def stream():
        while True:
            chunk = await grid_out.readchunk()
            if not chunk:
                break
            yield chunk

    media_type = None
    if grid_out.metadata:
        media_type = grid_out.metadata.get("content_type")
    return StreamingResponse(stream(), media_type=media_type or "application/octet-stream")
