from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from service_microservices import classify_and_route_async
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class ChatQuery(BaseModel):
    question: str
    customer_id: Optional[str] = None

@router.post("/chat")
async def chat(query: ChatQuery, authorization: Optional[str] = Header(None)):
    """
    Chat endpoint that routes questions to appropriate services
    
    Args:
        query: ChatQuery object containing the question and optional customer_id
        authorization: Optional Bearer token from the Authorization header
    
    Returns:
        JSON response with the answer and customer_id
    """
    if not query.question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    
    # Extract token from Authorization header
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]  # Remove "Bearer " prefix
        logger.info(f"Received auth token: {token[:20]}...") if token else logger.info("No auth token")
    else:
        logger.info(f"No valid authorization header. Received: {authorization}")
    
    try:
        logger.info(f"Chat request - Question: '{query.question}', Customer ID: {query.customer_id}, Has Token: {bool(token)}")
        answer = await classify_and_route_async(query.question, query.customer_id, token)
        return {"answer": answer, "customer_id": query.customer_id}
    except Exception as e:
        logger.error(f"Error processing chat query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))