# ServeXa Chatbot Microservice

## Overview
The chatbot service has been transformed into a proper microservice that communicates with other ServeXa services via REST APIs instead of direct database access.

## Architecture Changes

### Before
- Direct database connections to PostgreSQL
- Monolithic architecture
- No service-to-service communication

### After
- RESTful API communication with other microservices
- Service clients for each microservice
- Proper authentication token handling
- Containerized deployment

## New Files Created

1. **service_clients.py** - HTTP client classes for communicating with:
   - Authentication Service
   - Appointment Service
   - Vehicle Service
   - Notification Service

2. **service_microservices.py** - Updated service logic using microservice calls
3. **route_microservices.py** - Updated routes with async support and auth tokens
4. **main_microservices.py** - New FastAPI application with proper lifecycle management
5. **Dockerfile** & **Dockerfile.dev** - Container configurations
6. **.env.example** - Environment variable template

## Configuration

### Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Required variables:
OPENAI_API_KEY=your-openai-api-key

# Service URLs (for Docker)
AUTH_SERVICE_URL=http://auth-service:8081
APPOINTMENT_SERVICE_URL=http://appointment-service:8083
VEHICLE_SERVICE_URL=http://vehicle-service:8084
NOTIFICATION_SERVICE_URL=http://notification-service:8085
```

## Running the Service

### Using Docker Compose
```bash
# Production mode
docker-compose up chatbot-service

# Development mode with hot reload
docker-compose -f docker-compose.dev.yml up chatbot-service
```

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run the service
uvicorn main_microservices:app --host 0.0.0.0 --port 8086 --reload
```

## API Endpoints

- `POST /api/chat` - Main chat endpoint
  - Request body: `{"question": "string", "customer_id": "string"}`
  - Headers: `Authorization: Bearer <token>` (optional)
  
- `GET /health` - Health check endpoint
- `GET /` - Service information

## Features

1. **RAG System** - Uses LangChain and Chroma for document-based Q&A
2. **Service Integration** - Queries other microservices for real-time data
3. **Authentication** - Supports JWT tokens for user-specific queries
4. **Async Operations** - Non-blocking API calls to other services

## Migration Notes

To switch from the old implementation to the new one:
1. Update your `.env` file with service URLs
2. Replace references to `main.py` with `main_microservices.py`
3. Replace references to `service.py` with `service_microservices.py`
4. Replace references to `route.py` with `route_microservices.py`

## API Gateway Recommendation

While the service currently works without an API gateway, we recommend implementing one for:
- Centralized authentication
- Request routing
- Rate limiting
- Load balancing
- Single entry point for frontend

Consider using:
- Spring Cloud Gateway (to match your Java stack)
- Kong
- Traefik
- NGINX

## Testing

Test the service with:
```bash
# Without auth (general questions)
curl -X POST http://localhost:8086/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is ServeXa?"}'

# With auth (user-specific questions)
curl -X POST http://localhost:8086/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"question": "What are my appointments?", "customer_id": "user-uuid"}'
```