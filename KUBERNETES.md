# Kubernetes Deployment Guide for ServeXa

This guide provides comprehensive instructions for deploying ServeXa on Kubernetes using both raw YAML manifests and Helm charts.

## Prerequisites

- Kubernetes cluster (local or cloud-based)
- kubectl configured to access your cluster
- Docker images built and available in a registry
- Helm 3.x installed (for Helm deployment)
- NGINX Ingress Controller (optional, for external access)

## Quick Setup Commands

### For Docker Desktop Kubernetes:

```bash
# Enable Kubernetes in Docker Desktop
# Then run:
kubectl cluster-info
kubectl get nodes
```

### For Minikube:

```bash
# Start Minikube
minikube start --memory=4096 --cpus=4

# Enable ingress addon
minikube addons enable ingress

# Get Minikube IP
minikube ip
```

## Deployment Options

### Option 1: Raw Kubernetes Manifests

Deploy using the YAML files in the `k8s/` directory:

```bash
# Navigate to the project root
cd /path/to/ServeXa

# Apply all manifests in order
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/auth-service.yaml
kubectl apply -f k8s/backend-services.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress-and-scaling.yaml

# Verify deployment
kubectl get all -n servexa
```

### Option 2: Helm Chart (Recommended)

Deploy using the Helm chart:

```bash
# Navigate to the helm directory
cd helm

# Install the chart
helm install servexa ./servexa \
  --namespace servexa \
  --create-namespace \
  --values ./servexa/values.yaml

# Verify deployment
helm status servexa -n servexa
kubectl get all -n servexa
```

## Pre-Deployment Steps

### 1. Build and Push Docker Images

```bash
# Build all images
docker-compose build

# Tag for your registry (replace with your registry)
docker tag servexa/frontend:latest your-registry/servexa-frontend:v1.0.0
docker tag servexa/auth-service:latest your-registry/servexa-auth-service:v1.0.0
docker tag servexa/customer-service:latest your-registry/servexa-customer-service:v1.0.0
docker tag servexa/appointment-service:latest your-registry/servexa-appointment-service:v1.0.0
docker tag servexa/vehicle-service:latest your-registry/servexa-vehicle-service:v1.0.0

# Push to registry
docker push your-registry/servexa-frontend:v1.0.0
docker push your-registry/servexa-auth-service:v1.0.0
docker push your-registry/servexa-customer-service:v1.0.0
docker push your-registry/servexa-appointment-service:v1.0.0
docker push your-registry/servexa-vehicle-service:v1.0.0
```

### 2. Update Image References

If using a custom registry, update the image references in:

- `k8s/*.yaml` files
- `helm/servexa/values.yaml`

## Configuration

### Environment Variables

Key configurations can be modified in:

**For Raw YAML:**

- Database credentials in `k8s/postgres.yaml`
- Service configurations in respective YAML files

**For Helm:**

- Modify `helm/servexa/values.yaml`

### Custom Configuration Example

```yaml
# values-custom.yaml
postgres:
  auth:
    password: "your-secure-password"

frontend:
  replicaCount: 5

authService:
  replicaCount: 3
  resources:
    limits:
      memory: 2Gi
      cpu: 1000m
```

Deploy with custom values:

```bash
helm install servexa ./servexa \
  --namespace servexa \
  --create-namespace \
  --values values-custom.yaml
```

## Accessing the Application

### Method 1: LoadBalancer (Cloud Kubernetes)

```bash
# Get external IP
kubectl get svc -n servexa

# Access via external IP
# Frontend: http://<EXTERNAL-IP>
```

### Method 2: Port Forwarding (Local Development)

```bash
# Port forward frontend
kubectl port-forward -n servexa svc/frontend 3000:80

# Port forward individual services
kubectl port-forward -n servexa svc/auth-service 8081:8081
kubectl port-forward -n servexa svc/customer-service 8082:8082

# Access at:
# Frontend: http://localhost:3000
# Auth Service: http://localhost:8081
```

### Method 3: Ingress (Production)

```bash
# Add to /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
<INGRESS-IP> servexa.local

# Access at: http://servexa.local
```

## Monitoring and Management

### Health Checks

```bash
# Check pod status
kubectl get pods -n servexa

# Check service endpoints
kubectl get endpoints -n servexa

# View pod logs
kubectl logs -n servexa deployment/auth-service
kubectl logs -n servexa deployment/frontend

# Follow logs
kubectl logs -n servexa -f deployment/auth-service
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment auth-service --replicas=3 -n servexa

# Check HPA status
kubectl get hpa -n servexa

# View HPA details
kubectl describe hpa frontend-hpa -n servexa
```

### Database Access

```bash
# Connect to PostgreSQL
kubectl exec -it -n servexa deployment/postgres -- psql -U postgres

# Port forward to access from local tools
kubectl port-forward -n servexa svc/postgres 5432:5432
```

## Troubleshooting

### Common Issues

1. **Images not pulling:**

   ```bash
   # Check image names and registry access
   kubectl describe pod <pod-name> -n servexa
   ```

2. **Services not starting:**

   ```bash
   # Check logs for errors
   kubectl logs -n servexa deployment/<service-name>

   # Check resource constraints
   kubectl describe pod <pod-name> -n servexa
   ```

3. **Database connection issues:**

   ```bash
   # Verify database is running
   kubectl get pods -n servexa -l app=postgres

   # Test connectivity from a service pod
   kubectl exec -it -n servexa deployment/auth-service -- nc -zv postgres 5432
   ```

4. **Ingress not working:**

   ```bash
   # Check ingress controller
   kubectl get pods -n ingress-nginx

   # Verify ingress resource
   kubectl describe ingress servexa-ingress -n servexa
   ```

### Debugging Commands

```bash
# Get all resources in namespace
kubectl get all -n servexa

# Describe problematic resources
kubectl describe deployment <deployment-name> -n servexa
kubectl describe pod <pod-name> -n servexa

# Check events
kubectl get events -n servexa --sort-by='.lastTimestamp'

# Execute shell in pod
kubectl exec -it -n servexa deployment/auth-service -- sh
```

## Cleanup

### Remove Application

```bash
# Using Helm
helm uninstall servexa -n servexa
kubectl delete namespace servexa

# Using kubectl
kubectl delete -f k8s/
kubectl delete namespace servexa
```

### Complete Cleanup (including persistent data)

```bash
# Delete persistent volumes (⚠️ DATA LOSS!)
kubectl delete pvc -n servexa --all
kubectl delete pv --all  # Only if no other applications use PVs
```

## Production Considerations

### Security

- Use proper RBAC
- Enable network policies
- Use secrets for sensitive data
- Regular security updates

### Monitoring

- Implement proper logging (ELK stack)
- Set up monitoring (Prometheus + Grafana)
- Configure alerting

### Backup

- Regular database backups
- Persistent volume snapshots
- Configuration backups

### Performance

- Resource limits and requests
- Horizontal pod autoscaling
- Cluster autoscaling
- CDN for frontend assets

## Advanced Configurations

### Multi-Environment Setup

```bash
# Development environment
helm install servexa-dev ./servexa \
  --namespace servexa-dev \
  --create-namespace \
  --values values-dev.yaml

# Production environment
helm install servexa-prod ./servexa \
  --namespace servexa-prod \
  --create-namespace \
  --values values-prod.yaml
```

### Blue-Green Deployment

```bash
# Deploy green version
helm install servexa-green ./servexa \
  --namespace servexa-green \
  --create-namespace \
  --values values-green.yaml

# Switch traffic (update ingress)
# Remove blue version when confirmed
helm uninstall servexa-blue -n servexa-blue
```
