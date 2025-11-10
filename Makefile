# ServeXa Docker Automation Makefile

.PHONY: help build up down restart logs status clean dev prod test health-check

# Default target
help:
	@echo "ServeXa Docker Management Commands:"
	@echo "  make build        - Build all Docker images"
	@echo "  make up           - Start all services"
	@echo "  make down         - Stop all services"
	@echo "  make restart      - Restart all services"
	@echo "  make logs         - Show logs from all services"
	@echo "  make status       - Show status of all services"
	@echo "  make clean        - Remove all containers and volumes (WARNING: Data loss!)"
	@echo "  make dev          - Start in development mode"
	@echo "  make prod         - Start in production mode"
	@echo "  make test         - Run tests in Docker"
	@echo "  make health-check - Check health of all services"

# Build all services
build:
	@echo "Building all ServeXa services..."
	@docker-compose build --parallel

# Start services
up:
	@echo "Starting all ServeXa services..."
	@docker-compose up -d
	@echo ""
	@echo "Services started! Access points:"
	@echo "Frontend: http://localhost:3000"
	@echo "Auth Service: http://localhost:8081"
	@echo "Appointment Service: http://localhost:8083"
	@echo "Vehicle Service: http://localhost:8084"
	@echo ""
	@make health-check

# Stop services
down:
	@echo "Stopping all ServeXa services..."
	@docker-compose down

# Restart services
restart:
	@echo "Restarting all ServeXa services..."
	@docker-compose restart

# Show logs
logs:
	@docker-compose logs -f

# Show status
status:
	@docker-compose ps

# Clean everything (WARNING: Data loss!)
clean:
	@echo "WARNING: This will remove all containers and volumes (DATA LOSS)!"
	@read -p "Are you sure? (y/N): " confirm && \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		docker-compose down -v --remove-orphans; \
		docker system prune -f; \
		echo "Cleanup completed."; \
	else \
		echo "Cleanup cancelled."; \
	fi

# Development mode
dev:
	@echo "Starting ServeXa in development mode..."
	@docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production mode
prod:
	@echo "Starting ServeXa in production mode..."
	@docker-compose up -d

# Run tests
test:
	@echo "Running tests in Docker..."
	@docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
	@docker-compose -f docker-compose.test.yml down -v

# Health check
health-check:
	@echo "Checking health of services..."
	@sleep 5
	@echo -n "PostgreSQL: " && docker-compose exec -T postgres pg_isready -U postgres && echo "✓ Healthy" || echo "✗ Unhealthy"
	@echo -n "Redis: " && docker-compose exec -T redis redis-cli ping > /dev/null 2>&1 && echo "✓ Healthy" || echo "✗ Unhealthy"
	@echo -n "Auth Service: " && curl -sf http://localhost:8081/actuator/health > /dev/null && echo "✓ Healthy" || echo "✗ Unhealthy"
	@echo -n "Appointment Service: " && curl -sf http://localhost:8083/actuator/health > /dev/null && echo "✓ Healthy" || echo "✗ Unhealthy"
	@echo -n "Vehicle Service: " && curl -sf http://localhost:8084/actuator/health > /dev/null && echo "✓ Healthy" || echo "✗ Unhealthy"
	@echo -n "Frontend: " && curl -sf http://localhost:3000 > /dev/null && echo "✓ Healthy" || echo "✗ Unhealthy"

# Build specific service
build-%:
	@echo "Building $*..."
	@docker-compose build $*

# Restart specific service
restart-%:
	@echo "Restarting $*..."
	@docker-compose restart $*

# Show logs for specific service
logs-%:
	@docker-compose logs -f $*