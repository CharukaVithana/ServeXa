---
marp: true
theme: gaia
class: lead
paginate: true
backgroundColor: #fff
backgroundImage: url('https://marp.app/assets/hero-background.svg')
---

# ServeXa Project
## Automobile Service Management System

**Team Knowledge Transfer Session**
Duration: 60 minutes

---

# Agenda

1. **Introduction** - What is ServeXa?
2. **Microservices Architecture** - Theory & Benefits
3. **Frontend Architecture** - Layered Approach
4. **Docker** - Containerization Basics
5. **Code Walkthrough** - Backend & Frontend
6. **Setup Guide** - Get it Running
7. **Demo & Q&A**

---

# What is ServeXa?

A modern web application for automobile service management:

- 🚗 **Customers** book service appointments
- 🔧 **Service Centers** manage work orders
- 👥 **Employees** track tasks
- 📊 **Admins** oversee operations

**Built with**: Spring Boot (Backend) + React (Frontend)

---

# Our Tech Stack

## Backend
- **Language**: Java 17
- **Framework**: Spring Boot 3.2
- **Security**: JWT Authentication
- **Database**: PostgreSQL
- **Cache**: Redis

## Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

---

# Traditional vs Microservices

## Monolithic Architecture
```
┌─────────────────────────┐
│    One Big Application  │
│  ┌─────────────────┐    │
│  │ • User Mgmt     │    │
│  │ • Auth          │    │
│  │ • Vehicles      │    │
│  │ • Booking       │    │
│  │ • Payments      │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

**Like**: One person running entire restaurant

---

# Microservices Architecture

```
┌──────┐  ┌──────┐  ┌─────────┐  ┌─────────┐
│ Auth │  │ User │  │ Vehicle │  │ Booking │
└───┬──┘  └──┬───┘  └────┬────┘  └────┬────┘
    └────────┴───────────┴─────────────┘
                    │
              API Gateway
                    │
               Frontend
```

**Like**: Specialized staff - waiter, chef, cashier

---

# Why Microservices?

## ✅ Benefits

1. **Independence** - One service fails, others keep working
2. **Scalability** - Scale busy services individually  
3. **Technology Freedom** - Use different tech per service
4. **Team Organization** - Teams own specific services

## ❌ Challenges
- More complex to manage
- Network communication overhead

---

# Our Architecture

```
         ┌──────────────┐
         │ React App    │
         │ (Port 5173)  │
         └──────┬───────┘
                │
         ┌──────▼───────┐
         │ API Gateway  │
         │ (Port 8080)  │
         └──────┬───────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───▼───┐  ┌───▼───┐  ┌────▼────┐
│ Auth  │  │ User  │  │ Vehicle │
│ :8081 │  │ :8082 │  │  :8083  │
└───┬───┘  └───┬───┘  └────┬────┘
    └──────────┴────────────┘
            ┌─────▼─────┐
            │  Eureka   │
            │  :8761    │
            └───────────┘
```

---

# Frontend: Layered Architecture

Think of it like building a house:

```
┌─────────────────────────────┐
│      PAGES (Rooms)          │ ← What users see
├─────────────────────────────┤
│   COMPONENTS (Furniture)    │ ← Reusable pieces
├─────────────────────────────┤
│  BUSINESS LOGIC (Wiring)    │ ← How things work
├─────────────────────────────┤
│    SERVICES (Utilities)     │ ← API calls
├─────────────────────────────┤
│    UTILITIES (Tools)        │ ← Helper functions
└─────────────────────────────┘
```

**Rule**: Each layer only talks to layers below it

---

# Frontend File Structure

```
frontend/src/
├── pages/              # User-facing screens
│   ├── Authentication/ # Login, Signup
│   ├── Dashboard/      # Main app
│   └── Landing/        # Home page
├── components/         # Reusable UI
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── services/           # API communication
│   └── authService.ts
├── contexts/           # Global state
│   └── AuthContext.tsx
└── utils/              # Helpers
    └── validation.ts
```

---

# What is Docker?

**Docker = Shipping Containers for Software**

## Without Docker:
"Works on my machine!" 😤

## With Docker:
"Works everywhere!" 🎉

### Key Concepts:
- **Image**: Recipe (like a cake recipe)
- **Container**: Running instance (the actual cake)
- **Docker Compose**: Run multiple containers together

---

# Our Docker Setup

```yaml
version: '3.8'
services:
  postgres-db:
    image: postgres:15
    ports: ["5432:5432"]
    
  redis-cache:
    image: redis:7
    ports: ["6379:6379"]
    
  auth-service:
    build: ./authentication-service
    ports: ["8081:8081"]
    depends_on: [postgres-db]
```

All services connected via `servexa-network`

---

# Backend Structure

```
authentication-service/
├── controller/      # REST endpoints
│   └── AuthController.java
├── service/         # Business logic
│   └── AuthService.java  
├── repository/      # Database access
│   └── UserRepository.java
├── entity/          # Data models
│   └── User.java
├── dto/             # Data transfer
│   ├── LoginRequest.java
│   └── AuthResponse.java
└── config/          # Configuration
    └── SecurityConfig.java
```

---

# Authentication Flow

```
Frontend          Controller       Service         Database
   │                  │               │                │
   ├─POST /login─────►│               │                │
   │                  ├─validateUser─►│                │
   │                  │               ├─findByEmail───►│
   │                  │               │◄───────────────┤
   │                  │◄─────────────┤                │
   │◄─────────────────┤ JWT Token    │                │
   │                  │               │                │
```

1. User submits credentials
2. Backend validates
3. Creates JWT token
4. Returns to frontend

---

# Backend Code Example

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // 1. Validate credentials
        AuthResponse response = authService.login(
            request.getEmail(), 
            request.getPassword()
        );
        
        // 2. Return JWT tokens
        return ResponseEntity.ok(response);
    }
}
```

---

# Frontend Login Flow

```typescript
// 1. Login Page (Login.tsx)
const handleSubmit = async (data) => {
    const response = await authService.login(data);
    // Store token and redirect
};

// 2. Auth Service (authService.ts)
export const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.accessToken);
    return data;
};

// 3. Protected Routes
<ProtectedRoute>
    <Dashboard />
</ProtectedRoute>
```

---

# JWT Authentication

**JWT = JSON Web Token**

```
Header.Payload.Signature
eyJhbG.eyJzdWIiOiIx.SflKxwRJSMeK
```

- **Stateless**: No server sessions
- **Contains**: User ID, roles, expiry
- **Sent with**: Every API request
- **Refresh Token**: Get new access token

---

# Setup Requirements

## 1. Install Prerequisites

- ☕ **Java 17** - [adoptium.net](https://adoptium.net)
- 📦 **Node.js 18+** - [nodejs.org](https://nodejs.org)
- 🐳 **Docker Desktop** - [docker.com](https://docker.com)
- 🔀 **Git** - [git-scm.com](https://git-scm.com)

## 2. Verify Installation
```bash
java -version    # Should show 17.x
node -v         # Should show 18.x
docker -v       # Docker version
git --version   # Git version
```

---

# Setup Steps

## 1. Clone Repository
```bash
git clone [repository-url]
cd ServeXa
```

## 2. Start Backend
```bash
cd backend
docker-compose -f docker-compose-dev.yml up -d
cd authentication-service
./mvnw spring-boot:run
```

---

# Setup Steps (continued)

## 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## 4. Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8081
- API Docs: http://localhost:8081/swagger-ui.html

---

# Common Issues & Solutions

## Port Already in Use
```bash
# Find process
lsof -i :8081
# Kill process
kill -9 [PID]
```

## Database Connection Failed
```bash
# Check Docker containers
docker ps
# View logs
docker logs postgres-db
```

## Frontend Can't Connect
- Check CORS settings
- Verify backend is running
- Check API URL in authService.ts

---

# Project Status

## ✅ Completed
- Authentication Service
- JWT Implementation
- Frontend Auth Flow
- Docker Setup

## 🚧 In Progress
- API Gateway
- User Service

## 📋 Planned
- Vehicle Service
- Appointment Service
- Payment Integration

---

# Demo Time!

Let's see it in action:

1. **Landing Page** - Public access
2. **Sign Up** - Create account
3. **Login** - Get JWT token
4. **Dashboard** - Protected route
5. **API Testing** - Postman collection

---

# Testing the API

Using the Postman collection:

```
backend/ServeXa_Auth_API.postman_collection.json
```

1. Import into Postman
2. Test endpoints:
   - POST /api/auth/signup
   - POST /api/auth/login
   - GET /api/auth/me
   - POST /api/auth/refresh

---

# Key Takeaways

1. **Microservices** = Independent services
2. **Layered Architecture** = Organized code
3. **Docker** = Consistent environments
4. **JWT** = Stateless authentication
5. **Spring Boot + React** = Powerful combo

---

# Next Steps

## For You:
1. 📖 Explore the codebase
2. 🧪 Run the tests
3. 🔧 Try small changes
4. ❓ Ask questions

## Resources:
- Spring Boot: spring.io/guides
- React: react.dev
- Docker: docs.docker.com

---

# Questions?

## Let's discuss:
- Architecture decisions
- Implementation details
- Future features
- Setup issues

**Remember**: No question is too basic!

---

# Thank You!

## Happy Coding! 🚀

### Contact:
- Team Chat
- GitHub Issues
- Pair Programming Sessions

**Let's build something awesome together!**