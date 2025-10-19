# ServeXa Project: Complete Presentation Script (60 minutes)

## Introduction (5 minutes)

**[Slide 1: Welcome]**

"Good morning/afternoon everyone! Today I'm excited to walk you through our ServeXa project - an Automobile Service Management System. 

By the end of this session, you'll understand:
- What microservices architecture is and why we use it
- How our frontend is organized with layered architecture
- What Docker is and how it helps us
- How to navigate and work with our codebase
- How to set everything up on your machine

Don't worry if you're new to these concepts - we'll start from the basics and build up from there."

**[Slide 2: What is ServeXa?]**

"ServeXa is a web application for managing automobile services. Think of it like a system where:
- Customers can book service appointments for their vehicles
- Service centers can manage these appointments
- Employees can track work orders
- Admins can oversee everything

We've built this using modern technologies:
- Backend: Java Spring Boot with microservices
- Frontend: React with TypeScript
- Database: PostgreSQL
- Containerization: Docker"

## Part 1: Understanding Microservices Architecture (10 minutes)

**[Slide 3: Traditional vs Microservices]**

"Let's start with the basics. Traditionally, we build applications as one big program - we call this a monolith. Imagine a restaurant where one person does everything - takes orders, cooks, serves, and cleans.

Microservices are different. It's like having specialized staff:
- A waiter takes orders
- A chef cooks
- A server delivers food
- Each person is an expert at their job

In our project:
- Authentication Service handles login/signup
- User Service will manage user profiles
- Vehicle Service will handle car information
- Each service is independent"

**[Slide 4: Benefits of Microservices]**

"Why do we use microservices?

1. **Independence**: If the login system breaks, the rest keeps working
2. **Scalability**: During busy times, we can add more instances of busy services
3. **Technology Freedom**: Each service can use different technologies
4. **Team Organization**: Different teams can work on different services

Let me show you our architecture..."

**[Show diagram: backend/README.md architecture]**

"Here's our planned architecture:
- API Gateway (Port 8080) - The front door, routes requests
- Authentication Service (Port 8081) - Handles login/signup
- Eureka Server (Port 8761) - Helps services find each other
- Future services: User, Vehicle, Appointment, etc."

## Part 2: Frontend Layered Architecture (10 minutes)

**[Slide 5: Frontend Organization]**

"Now let's talk about our frontend. We organize our React code in layers, like a cake:

1. **Presentation Layer** (What users see)
   - Location: `frontend/src/pages/`
   - Examples: Login page, Dashboard, Landing page

2. **Component Layer** (Reusable UI pieces)
   - Location: `frontend/src/components/`
   - Examples: Navbar, PasswordStrengthIndicator

3. **Business Logic Layer** (How things work)
   - Location: `frontend/src/hooks/` and `frontend/src/contexts/`
   - Examples: useAuth hook, AuthContext

4. **Service Layer** (Talks to backend)
   - Location: `frontend/src/services/`
   - Example: authService.ts

5. **Utility Layer** (Helper functions)
   - Location: `frontend/src/utils/`
   - Example: validation.ts"

**[Slide 6: Why Layers?]**

"Think of it like building a house:
- Foundation (utilities)
- Walls (services)
- Rooms (business logic)
- Furniture (components)
- Decoration (pages)

Each layer has a specific job and depends on layers below it, not above."

## Part 3: Understanding Docker (10 minutes)

**[Slide 7: What is Docker?]**

"Docker is like a shipping container for software. Just like shipping containers:
- Standard size and shape
- Can contain anything
- Work on any ship (computer)
- Isolated from other containers

Without Docker: 'It works on my machine!' problems
With Docker: It works the same everywhere"

**[Slide 8: Docker Concepts]**

"Key concepts:

1. **Image**: Recipe for your application (like a cake recipe)
2. **Container**: Running instance (like the actual cake)
3. **Dockerfile**: Instructions to build image
4. **Docker Compose**: Run multiple containers together

Let me show you our Docker setup..."

**[Show: backend/docker-compose.yml]**

"Our docker-compose.yml defines:
- PostgreSQL database container
- Redis cache container
- Our microservices containers
- How they connect to each other"

## Part 4: Backend Code Walkthrough (10 minutes)

**[Slide 9: Backend Structure]**

"Let's explore our backend code:

```
backend/
├── authentication-service/    # Our main service
├── common-libs/              # Shared code
├── docker-compose.yml        # Container setup
└── pom.xml                   # Maven parent config
```

**[Open: backend/authentication-service/src/main/java/com/servexa/auth/]**

"Here's how our authentication service is organized:

1. **Controller Layer** (AuthController.java)
   - Receives HTTP requests
   - Like a receptionist directing visitors

2. **Service Layer** (AuthService.java)
   - Business logic
   - Like the actual worker doing the job

3. **Repository Layer** (UserRepository.java)
   - Database operations
   - Like a filing cabinet

4. **Entity Layer** (User.java)
   - Data structure
   - Like a form template

5. **DTO Layer** (LoginRequest, AuthResponse, etc.)
   - Data transfer objects
   - Like envelopes for sending data"

**[Show code example: AuthController.java]**

"Let's see how login works:

```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    // Controller receives request
    // Calls service to handle logic
    // Returns response
}
```

The flow:
1. User sends login request
2. Controller receives it
3. Service validates credentials
4. Creates JWT token
5. Returns token to user"

## Part 5: Frontend Code Walkthrough (10 minutes)

**[Slide 10: Frontend Flow]**

"Now let's see how the frontend works:

**[Open: frontend/src/pages/Authentication/Login.tsx]**

"The login page:
1. Uses our custom useForm hook for form handling
2. Calls authService when user submits
3. Stores token using AuthContext
4. Redirects to dashboard

**[Show: frontend/src/services/authService.ts]**

"Our authService:
- Makes HTTP requests to backend
- Handles token storage
- Manages authentication state

**[Show: frontend/src/contexts/AuthContext.tsx]**

"AuthContext provides:
- Global authentication state
- Login/logout functions
- Protected route support

**[Show: frontend/src/components/ProtectedRoute.tsx]**

"ProtectedRoute ensures:
- Only logged-in users access certain pages
- Redirects to login if not authenticated"

## Part 6: Setup Instructions (10 minutes)

**[Slide 11: Prerequisites]**

"To run this project, you need:

1. **Java 17** - For backend
   - Download from: adoptium.net
   - Verify: `java -version`

2. **Node.js 18+** - For frontend
   - Download from: nodejs.org
   - Verify: `node -v`

3. **Docker Desktop** - For containers
   - Download from: docker.com
   - Verify: `docker -v`

4. **Git** - For code management
   - Verify: `git --version`"

**[Slide 12: Setup Steps]**

"Let's set it up together:

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd ServeXa
   ```

2. **Start Docker containers**
   ```bash
   cd backend
   docker-compose -f docker-compose-dev.yml up -d
   ```
   This starts PostgreSQL and Redis

3. **Run Authentication Service**
   ```bash
   cd authentication-service
   ./mvnw spring-boot:run
   ```
   Service runs on http://localhost:8081

4. **Run Frontend**
   ```bash
   cd ../../frontend
   npm install
   npm run dev
   ```
   Frontend runs on http://localhost:5173

5. **Test the application**
   - Open browser to http://localhost:5173
   - Click 'Sign Up' to create account
   - Login with your credentials"

## Demo and Q&A (5 minutes)

**[Slide 13: Live Demo]**

"Let me show you the application in action:

1. Landing page - What visitors see
2. Sign up flow - Creating new account
3. Login flow - Authentication process
4. Dashboard - Protected content
5. Logout - Clearing session

**[Show Postman collection]**

"For testing APIs directly:
- Open backend/ServeXa_Auth_API.postman_collection.json
- Import into Postman
- Test each endpoint"

**[Slide 14: Common Issues & Solutions]**

"Troubleshooting tips:

1. **Port already in use**
   - Check what's using the port
   - Stop other applications
   - Or change port in configuration

2. **Database connection failed**
   - Ensure Docker is running
   - Check PostgreSQL container status
   - Verify connection settings

3. **Frontend can't connect to backend**
   - Check CORS settings
   - Verify backend is running
   - Check API URL in authService.ts"

**[Slide 15: Next Steps]**

"What you can do next:

1. **Explore the code**
   - Read through different files
   - Understand the flow
   - Try making small changes

2. **Run tests**
   - Backend: `./mvnw test`
   - Frontend: `npm test` (when implemented)

3. **Try adding features**
   - Add a new field to signup
   - Create a new protected page
   - Add a new API endpoint

4. **Ask questions**
   - Use our team chat
   - Create issues in Git
   - Pair program with teammates"

## Closing (5 minutes)

**[Slide 16: Key Takeaways]**

"Remember:

1. **Microservices** = Independent services working together
2. **Layered Architecture** = Organized code with clear responsibilities  
3. **Docker** = Consistent environments everywhere
4. **JWT Authentication** = Secure, stateless user sessions
5. **Spring Boot + React** = Powerful full-stack combination

The code is well-organized and ready for expansion. Each part has a specific job, making it easier to understand and modify."

**[Slide 17: Resources]**

"Helpful resources:

- Spring Boot: spring.io/guides
- React: react.dev
- Docker: docs.docker.com
- TypeScript: typescriptlang.org
- Our README files in each directory

Questions? Let's discuss!"

---

## Presenter Notes:

- Keep examples simple and relatable
- Use analogies to explain complex concepts
- Encourage questions throughout
- Show actual code, not just talk about it
- Be patient with setup issues
- Emphasize that it's okay to not understand everything immediately
- Offer to do pair programming sessions for deeper understanding