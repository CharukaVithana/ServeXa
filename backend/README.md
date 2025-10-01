# ServeXa Backend Microservices

## Architecture

This backend uses a microservices architecture with Spring Boot:

### Services
- **Authentication Service**: Handles user registration, login, and JWT token management
- **User Service**: Manages user profiles and information (To be implemented)
- **API Gateway**: Routes requests to appropriate microservices
- **Eureka Server**: Service discovery and registration

### Technology Stack
- **Framework**: Spring Boot 3.2
- **Security**: Spring Security with JWT
- **Database**: PostgreSQL
- **Cache**: Redis
- **Service Discovery**: Netflix Eureka
- **API Documentation**: SpringDoc OpenAPI (Swagger)

### Authentication Strategy
- JWT-based stateless authentication
- Role-based access control (Customer, Employee, Admin)
- Refresh token mechanism
- Password encryption using BCrypt

## Running the Application

### Prerequisites
- Java 17
- Maven 3.6+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Development Setup

1. Start infrastructure services:
```bash
docker-compose up -d postgres redis
```

2. Build the project:
```bash
mvn clean install
```

3. Run individual services:
```bash
# Terminal 1: Eureka Server
cd eureka-server && mvn spring-boot:run

# Terminal 2: Authentication Service
cd authentication-service && mvn spring-boot:run

# Terminal 3: API Gateway
cd api-gateway && mvn spring-boot:run
```

### Docker Setup

Build and run all services:
```bash
docker-compose up --build
```

### Service URLs
- API Gateway: http://localhost:8080
- Authentication Service: http://localhost:8081
- Eureka Dashboard: http://localhost:8761
- Swagger UI: http://localhost:8081/swagger-ui.html

### API Endpoints

#### Authentication Service
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/validate` - Validate token

## Next Steps
- Implement User Service
- Add Vehicle Service
- Add Appointment Service
- Implement WebSocket for real-time updates
- Add monitoring and logging (ELK stack)
- Implement CI/CD pipeline