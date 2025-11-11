from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from route_microservices import router
from service_clients import service_clients
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifecycle - initialize and cleanup resources
    """
    # Startup
    logger.info("Starting chatbot microservice...")
    yield
    # Shutdown
    logger.info("Shutting down chatbot microservice...")
    await service_clients.close_all()

app = FastAPI(
    title="ServeXa Chatbot Microservice",
    description="A microservice chatbot that integrates with ServeXa services for answering queries",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS - in production, update with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend dev
        "http://localhost:5173",  # Vite dev server
        "http://frontend:3000",   # Docker frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "service": "ServeXa Chatbot Microservice",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "/api/chat": "POST - Chat endpoint for questions",
            "/health": "GET - Health check endpoint"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for container orchestration"""
    return {
        "status": "healthy",
        "service": "chatbot-service"
    }