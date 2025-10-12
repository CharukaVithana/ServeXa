# ServeXa Project: Visual Slides Companion

## Slide Visuals and Diagrams

### Slide 3: Traditional vs Microservices Architecture

```
MONOLITHIC ARCHITECTURE:
┌─────────────────────────────────┐
│         One Big Application     │
│  ┌─────────────────────────┐   │
│  │   User Management       │   │
│  │   Authentication        │   │
│  │   Vehicle Management    │   │
│  │   Appointment Booking   │   │
│  │   Payment Processing    │   │
│  │   Reports & Analytics   │   │
│  └─────────────────────────┘   │
│         Single Database         │
└─────────────────────────────────┘

MICROSERVICES ARCHITECTURE:
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  Auth   │ │  User   │ │ Vehicle │ │ Booking │
│ Service │ │ Service │ │ Service │ │ Service │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │           │           │           │
     └───────────┴─────┬─────┴───────────┘
                       │
                  API Gateway
                       │
                   Frontend
```

### Slide 4: Our Microservices Architecture

```
                           ┌─────────────────┐
                           │   Web Browser   │
                           │  (React App)    │
                           └────────┬────────┘
                                    │
                           ┌────────▼────────┐
                           │   API Gateway   │
                           │   Port: 8080    │
                           └────────┬────────┘
                                    │
          ┌─────────────┬───────────┴───────────┬─────────────┐
          │             │                       │             │
     ┌────▼─────┐ ┌─────▼─────┐         ┌─────▼─────┐ ┌─────▼─────┐
     │  Auth    │ │   User    │         │  Vehicle  │ │ Booking   │
     │ Service  │ │  Service  │         │  Service  │ │ Service   │
     │Port:8081 │ │Port:8082  │         │Port:8083  │ │Port:8084  │
     └────┬─────┘ └─────┬─────┘         └─────┬─────┘ └─────┬─────┘
          │             │                       │             │
          └─────────────┴───────┬───────────────┴─────────────┘
                                │
                        ┌───────▼────────┐
                        │ Eureka Server  │
                        │  Port: 8761    │
                        │(Service Registry)
                        └────────────────┘
```

### Slide 5: Frontend Layered Architecture

```
┌─────────────────────────────────────────────────┐
│                  PAGES LAYER                    │
│         (Login, Dashboard, Landing)             │
├─────────────────────────────────────────────────┤
│               COMPONENTS LAYER                  │
│    (Navbar, ProtectedRoute, FormInputs)        │
├─────────────────────────────────────────────────┤
│            BUSINESS LOGIC LAYER                 │
│      (AuthContext, Custom Hooks)               │
├─────────────────────────────────────────────────┤
│               SERVICE LAYER                     │
│        (authService, apiClient)                │
├─────────────────────────────────────────────────┤
│               UTILITY LAYER                     │
│       (validation, formatters)                 │
└─────────────────────────────────────────────────┘

Dependencies flow: Top → Bottom only
```

### Slide 7: Docker Containers Visualization

```
┌─────────────────────────── Docker Host ───────────────────────────┐
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  PostgreSQL  │  │    Redis     │  │ Auth Service │           │
│  │  Container   │  │  Container   │  │  Container   │           │
│  │              │  │              │  │              │           │
│  │  Port: 5432  │  │  Port: 6379  │  │  Port: 8081  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                    │
│  ┌─────────────────────── Docker Network ──────────────────────┐ │
│  │                   servexa-network                            │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

### Slide 9: Backend Package Structure

```
authentication-service/
├── src/main/java/com/servexa/auth/
│   ├── controller/          # REST endpoints
│   │   └── AuthController   # @RestController
│   ├── service/             # Business logic
│   │   └── AuthService      # @Service
│   ├── repository/          # Data access
│   │   └── UserRepository   # @Repository
│   ├── entity/              # Database models
│   │   └── User             # @Entity
│   ├── dto/                 # Data transfer
│   │   ├── LoginRequest
│   │   ├── SignupRequest
│   │   └── AuthResponse
│   └── config/              # Configuration
│       ├── SecurityConfig
│       └── CorsConfig
└── src/main/resources/
    ├── application.yml      # Main config
    ├── application-dev.yml  # Dev profile
    └── schema.sql           # DB schema
```

### Authentication Flow Diagram

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│ Frontend │      │Controller│      │ Service  │      │   JWT    │
│  (React) │      │  (REST)  │      │ (Logic)  │      │  Utils   │
└─────┬────┘      └─────┬────┘      └─────┬────┘      └─────┬────┘
      │                 │                 │                 │
      │   POST /login   │                 │                 │
      ├────────────────►│                 │                 │
      │                 │                 │                 │
      │                 │ Validate User   │                 │
      │                 ├────────────────►│                 │
      │                 │                 │                 │
      │                 │                 │ Generate Token │
      │                 │                 ├────────────────►│
      │                 │                 │                 │
      │                 │                 │◄────────────────┤
      │                 │◄────────────────┤  Access Token  │
      │                 │                 │  Refresh Token │
      │◄────────────────┤                 │                 │
      │  Auth Response  │                 │                 │
      │  (Tokens)       │                 │                 │
      │                 │                 │                 │
```

### Frontend Component Flow

```
                    ┌─────────────┐
                    │    App.tsx  │
                    │  (Router)   │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼─────┐    ┌──────▼──────┐   ┌─────▼─────┐
    │  Public  │    │  Protected  │   │   Auth    │
    │  Routes  │    │   Routes    │   │  Context  │
    └────┬─────┘    └──────┬──────┘   └─────┬─────┘
         │                 │                 │
    ┌────▼─────┐    ┌──────▼──────┐        │
    │ Landing  │    │  Dashboard  │        │
    │  Login   │    │  Profile    │        │
    │  SignUp  │    │  Settings   │        │
    └──────────┘    └─────────────┘        │
                                            │
                           ┌────────────────▼─────────────┐
                           │      authService.ts         │
                           │   (API Communication)       │
                           └──────────────────────────────┘
```

### Docker Compose Visualization

```yaml
version: '3.8'

services:
  ┌─────────────────────┐
  │    postgres-db      │ ← Database for all services
  │  Port: 5432         │
  │  Volume: pgdata     │
  └─────────────────────┘
           │
  ┌─────────────────────┐
  │     redis-cache     │ ← Caching layer
  │  Port: 6379         │
  └─────────────────────┘
           │
  ┌─────────────────────┐
  │  eureka-server      │ ← Service discovery
  │  Port: 8761         │
  │  Dashboard: /eureka │
  └─────────────────────┘
           │
  ┌─────────────────────┐
  │  auth-service       │ ← Our implemented service
  │  Port: 8081         │
  │  Depends on: DB     │
  └─────────────────────┘
           │
  ┌─────────────────────┐
  │   api-gateway       │ ← Routes all requests
  │  Port: 8080         │
  │  Depends on: Eureka │
  └─────────────────────┘

networks:
  servexa-network: ← All services connected here
```

### Setup Flow Chart

```
START
  │
  ▼
Install Prerequisites
  │
  ├─→ Java 17
  ├─→ Node.js 18+
  ├─→ Docker Desktop
  └─→ Git
  │
  ▼
Clone Repository
  │
  ▼
Start Docker Containers
  │
  ├─→ PostgreSQL (5432)
  └─→ Redis (6379)
  │
  ▼
Run Backend Services
  │
  └─→ Auth Service (8081)
  │
  ▼
Run Frontend
  │
  └─→ React App (5173)
  │
  ▼
Open Browser
  │
  └─→ http://localhost:5173
  │
  ▼
READY!
```

### Common Issues Debug Tree

```
Problem?
  │
  ├─→ Port Already in Use?
  │     │
  │     ├─→ Find process: lsof -i :PORT
  │     └─→ Kill process: kill -9 PID
  │
  ├─→ Database Connection Failed?
  │     │
  │     ├─→ Check Docker: docker ps
  │     ├─→ Check logs: docker logs postgres-db
  │     └─→ Verify credentials in application.yml
  │
  ├─→ Frontend Can't Connect to Backend?
  │     │
  │     ├─→ Check CORS config
  │     ├─→ Verify backend is running
  │     └─→ Check API_URL in authService.ts
  │
  └─→ Maven/NPM Issues?
        │
        ├─→ Clear cache: rm -rf ~/.m2 or npm cache clean
        └─→ Reinstall dependencies
```

## Quick Reference Cards

### Backend Ports
- API Gateway: 8080
- Auth Service: 8081
- User Service: 8082 (planned)
- Eureka Server: 8761
- PostgreSQL: 5432
- Redis: 6379

### Frontend Structure
- Pages: /src/pages/
- Components: /src/components/
- Services: /src/services/
- Contexts: /src/contexts/
- Hooks: /src/hooks/
- Utils: /src/utils/

### Key Commands
```bash
# Backend
cd backend
docker-compose -f docker-compose-dev.yml up -d
cd authentication-service
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev

# Docker
docker ps                # List containers
docker logs [container]  # View logs
docker-compose down      # Stop all
```