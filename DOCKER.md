# ServeXa Docker Orchestration

This repository contains Docker configurations to run the complete ServeXa application stack, including both frontend and backend services.

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB of available RAM
- Ports 3000, 8080-8084, 5432, and 6379 available on your system

## Quick Start

1. **Clone the repository** (if not already done):

   ```bash
   git clone <repository-url>
   cd ServeXa
   ```

2. **Set up environment variables** (optional):

   ```bash
   cp .env.example .env
   # Edit .env file if you want to customize any settings
   ```

3. **Start the complete application**:

   ```bash
   # Start all services
   docker-compose up -d

   # Or start with logs visible
   docker-compose up
   ```

4. **Access the application**:
   - **Frontend**: http://localhost:3000
   - **API Gateway**: http://localhost:8080 (if available)
   - **Direct Services**:
     - Auth Service: http://localhost:8081
     - Customer Service: http://localhost:8082
     - Appointment Service: http://localhost:8083
     - Vehicle Service: http://localhost:8084

## Service Architecture

```
┌─────────────────┐    ┌──────────────────┐
│   Frontend      │    │   API Gateway    │
│   (React/Vite)  │◄──►│   (Optional)     │
│   Port: 3000    │    │   Port: 8080     │
└─────────────────┘    └──────────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
        ┌───────────▼─┐  ┌──────▼──────┐  ┌─▼─────────────┐
        │ Auth Service│  │Customer Svc │  │Appointment Svc│
        │ Port: 8081  │  │Port: 8082   │  │Port: 8083     │
        └─────────────┘  └─────────────┘  └───────────────┘
                    │           │           │
                    └───────────┼───────────┘
                                │
                    ┌───────────▼─┐  ┌──────────────┐
                    │Vehicle Svc  │  │  PostgreSQL  │
                    │Port: 8084   │  │  Port: 5432  │
                    └─────────────┘  └──────────────┘
                                │           │
                            ┌───▼───────────▼──┐
                            │     Redis        │
                            │   Port: 6379     │
                            └──────────────────┘
```

## Available Commands

### Basic Operations

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f frontend
docker-compose logs -f auth-service
```

### Development Commands

```bash
# Rebuild and start services
docker-compose up --build

# Start only infrastructure (DB, Redis)
docker-compose up -d postgres redis

# Start with API Gateway (if available)
docker-compose --profile with-gateway up -d

# Scale specific services
docker-compose up -d --scale customer-service=2
```

### Maintenance Commands

```bash
# Remove all containers and volumes (⚠️ Data loss!)
docker-compose down -v

# Remove all containers, networks, and images
docker-compose down --rmi all

# View running containers
docker-compose ps

# Execute command in running container
docker-compose exec frontend sh
docker-compose exec postgres psql -U postgres
```

## Service Health Checks

All services include health checks and proper dependency management:

- **PostgreSQL**: Health check ensures database is ready before services start
- **Services**: Will restart automatically if they fail
- **Dependencies**: Services wait for their dependencies to be healthy

## Environment Variables

Key environment variables (see `.env.example`):

| Variable                 | Description           | Default                 |
| ------------------------ | --------------------- | ----------------------- |
| `POSTGRES_PASSWORD`      | Database password     | `password`              |
| `SPRING_PROFILES_ACTIVE` | Spring profile        | `docker`                |
| `VITE_API_BASE_URL`      | Frontend API base URL | `http://localhost:8080` |

## Troubleshooting

### Common Issues

1. **Port conflicts**:

   ```bash
   # Check which process is using a port
   netstat -ano | findstr :8080
   # Stop the process or change ports in docker-compose.yml
   ```

2. **Services not connecting**:

   ```bash
   # Check service logs
   docker-compose logs auth-service

   # Verify network connectivity
   docker-compose exec auth-service ping postgres
   ```

3. **Database issues**:

   ```bash
   # Reset database (⚠️ Data loss!)
   docker-compose down -v
   docker-compose up -d postgres

   # Check database logs
   docker-compose logs postgres
   ```

4. **Build failures**:
   ```bash
   # Clean build
   docker-compose down
   docker system prune -f
   docker-compose build --no-cache
   ```

### Performance Tuning

For better performance on development machines:

```bash
# Limit service resources
docker-compose up -d --scale customer-service=1
# or modify docker-compose.yml to add resource limits
```

## Development Workflow

1. **Code Changes**: Make changes to source code
2. **Rebuild**: `docker-compose build <service-name>`
3. **Restart**: `docker-compose up -d <service-name>`
4. **Test**: Access the application and test changes
5. **Debug**: Use `docker-compose logs -f <service-name>` for debugging

## Production Considerations

This configuration is optimized for development. For production:

1. Use proper secrets management
2. Configure reverse proxy (nginx/traefik)
3. Set up proper logging and monitoring
4. Use production-grade database settings
5. Implement backup strategies
6. Configure resource limits and health checks
