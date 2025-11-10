from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from service import classify_and_route

router = APIRouter()

class ChatQuery(BaseModel):
    question: str
    customer_id: Optional[str] = None  # changed from int to str (UUID)

@router.post("/chat")
async def chat(query: ChatQuery):
    if not query.question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    try:
        answer = classify_and_route(query.question, query.customer_id)
        return {"answer": answer, "customer_id": query.customer_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
