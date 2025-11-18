# ServeXa Deployment to Google Kubernetes Engine (GKE)

This guide walks you through deploying ServeXa to Google Cloud Platform using GKE Autopilot with Docker Hub images.

## 🎯 Overview

- **Platform**: Google Kubernetes Engine (GKE) Autopilot
- **Image Registry**: Docker Hub
- **Cost**: Free tier with $300 credits (90 days)
- **Management**: Fully managed, minimal configuration

## 📋 Prerequisites

### 1. Google Cloud Account Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign up for a new account (get $300 free credits)
3. Create a new project (e.g., "servexa-production")

### 2. Install Required Tools

**Google Cloud SDK (gcloud CLI)**:
```powershell
# Download and install from:
# https://cloud.google.com/sdk/docs/install

# After installation, verify:
gcloud --version
```

**kubectl** (if not already installed):
```powershell
gcloud components install kubectl
```

**Docker Desktop** (for building images):
- Already installed ✓

### 3. Docker Hub Account
1. Create account at [hub.docker.com](https://hub.docker.com)
2. Create a repository for your organization (e.g., `yourusername/servexa-*`)
3. Login from command line:
```powershell
docker login
```

## 🚀 Step-by-Step Deployment

### Step 1: Initialize Google Cloud

```powershell
# Login to Google Cloud
gcloud auth login

# Set your project (replace PROJECT_ID with your actual project ID)
gcloud config set project PROJECT_ID

# Enable required APIs
gcloud services enable container.googleapis.com
gcloud services enable compute.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### Step 2: Create GKE Autopilot Cluster

```powershell
# Create an Autopilot cluster (fully managed, cost-optimized)
gcloud container clusters create-auto servexa-cluster `
  --region=us-central1 `
  --project=PROJECT_ID

# This takes about 5-10 minutes to complete
# Autopilot automatically manages:
# - Node provisioning
# - Scaling
# - Security patches
# - Resource optimization
```

### Step 3: Configure kubectl

```powershell
# Get credentials for your cluster
gcloud container clusters get-credentials servexa-cluster `
  --region=us-central1 `
  --project=PROJECT_ID

# Verify connection
kubectl cluster-info
kubectl get nodes
```

### Step 4: Build and Push Docker Images

**Option A: Use the automated script** (Recommended)
```powershell
# Edit docker-hub-config.ps1 with your Docker Hub username
# Then run:
.\build-and-push-dockerhub.ps1
```

**Option B: Manual build and push**
```powershell
# Set your Docker Hub username
$DOCKER_USERNAME = "yourusername"

# Build and push each service
cd backend

# Auth Service
docker build -t $DOCKER_USERNAME/servexa-auth:latest -f authentication-service/Dockerfile authentication-service
docker push $DOCKER_USERNAME/servexa-auth:latest

# Appointment Service
docker build -t $DOCKER_USERNAME/servexa-appointment:latest -f appointment-service/Dockerfile appointment-service
docker push $DOCKER_USERNAME/servexa-appointment:latest

# Vehicle Service
docker build -t $DOCKER_USERNAME/servexa-vehicle:latest -f vehicle-service/Dockerfile vehicle-service
docker push $DOCKER_USERNAME/servexa-vehicle:latest

# Notification Service
docker build -t $DOCKER_USERNAME/servexa-notification:latest -f notification-service/Dockerfile notification-service
docker push $DOCKER_USERNAME/servexa-notification:latest

# Chatbot Service
docker build -t $DOCKER_USERNAME/servexa-chatbot:latest -f chatbot-service/Dockerfile chatbot-service
docker push $DOCKER_USERNAME/servexa-chatbot:latest

cd ../frontend
# Frontend
docker build -t $DOCKER_USERNAME/servexa-frontend:latest .
docker push $DOCKER_USERNAME/servexa-frontend:latest
```

### Step 5: Update Kubernetes Manifests

```powershell
# Use the automated script to update all image references
.\update-k8s-images.ps1 -DockerHubUsername "yourusername"
```

Or manually edit `k8s/` files to replace image names with your Docker Hub images.

### Step 6: Deploy to GKE

```powershell
# Deploy using the deployment script
.\deploy-to-gke.ps1
```

Or manually:
```powershell
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy infrastructure
kubectl apply -f k8s-gke/postgres.yaml
kubectl apply -f k8s-gke/redis.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n servexa --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n servexa --timeout=300s

# Deploy backend services
kubectl apply -f k8s-gke/auth-service.yaml
kubectl apply -f k8s-gke/backend-services.yaml

# Wait for backend services
kubectl wait --for=condition=ready pod -l app=auth-service -n servexa --timeout=300s

# Deploy frontend
kubectl apply -f k8s-gke/frontend.yaml

# Deploy ingress
kubectl apply -f k8s-gke/ingress.yaml
```

### Step 7: Expose Application

**Option A: Load Balancer (Recommended for production)**

The ingress will automatically create a Google Cloud Load Balancer:

```powershell
# Wait for external IP to be assigned (takes 5-10 minutes)
kubectl get ingress -n servexa --watch

# Once you see an IP address, you can access your application
```

**Option B: Quick test with port-forward**
```powershell
# Forward frontend port for testing
kubectl port-forward -n servexa svc/frontend 3000:80

# Access at http://localhost:3000
```

### Step 8: Configure DNS (Optional)

Once you have the external IP from the Load Balancer:

1. Go to your domain registrar
2. Create an A record pointing to the external IP
3. Update `k8s-gke/ingress.yaml` with your domain
4. Reapply: `kubectl apply -f k8s-gke/ingress.yaml`

### Step 9: Enable HTTPS (Optional)

```powershell
# Install cert-manager for automatic SSL certificates
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Apply the TLS configuration
kubectl apply -f k8s-gke/certificate.yaml
```

## 🔍 Monitoring and Debugging

### Check Deployment Status
```powershell
# Get all resources
kubectl get all -n servexa

# Check pod status
kubectl get pods -n servexa

# Check services
kubectl get svc -n servexa

# Check ingress
kubectl get ingress -n servexa
```

### View Logs
```powershell
# View logs for a specific service
kubectl logs -n servexa -l app=auth-service --tail=100 -f

# View logs for a specific pod
kubectl logs -n servexa POD_NAME -f
```

### Describe Resources
```powershell
# Get detailed information about a pod
kubectl describe pod -n servexa POD_NAME

# Get events
kubectl get events -n servexa --sort-by='.lastTimestamp'
```

### Execute Commands in Pods
```powershell
# Get a shell in a pod
kubectl exec -it -n servexa POD_NAME -- /bin/bash

# Run a specific command
kubectl exec -n servexa POD_NAME -- curl http://localhost:8081/actuator/health
```

## 📊 Monitoring with Google Cloud

### Enable Cloud Monitoring
```powershell
# Cloud Monitoring is automatically enabled for GKE
# Access it at: https://console.cloud.google.com/monitoring
```

Key metrics to monitor:
- Pod CPU and Memory usage
- Request rates
- Error rates
- Response times

### Enable Logging
```powershell
# Logs are automatically sent to Cloud Logging
# Access at: https://console.cloud.google.com/logs
```

## 💰 Cost Management

### Monitor Costs
- View billing: https://console.cloud.google.com/billing
- Set up billing alerts to avoid surprises
- GKE Autopilot charges only for running pods

### Optimize Costs
```powershell
# Scale down non-production environments
kubectl scale deployment -n servexa --replicas=0 --all

# Delete cluster when not needed
gcloud container clusters delete servexa-cluster --region=us-central1
```

### Free Tier Limits
- $300 credits valid for 90 days
- GKE Autopilot: ~$0.10/hour per vCPU + memory
- Estimated cost for ServeXa: ~$50-100/month (well within free credits)

## 🔄 Updates and Maintenance

### Update Application
```powershell
# Build new image
docker build -t $DOCKER_USERNAME/servexa-auth:v2 authentication-service
docker push $DOCKER_USERNAME/servexa-auth:v2

# Update deployment
kubectl set image deployment/auth-service -n servexa auth-service=$DOCKER_USERNAME/servexa-auth:v2

# Or use rolling update
kubectl rollout restart deployment/auth-service -n servexa
```

### Rollback
```powershell
# Rollback to previous version
kubectl rollout undo deployment/auth-service -n servexa

# Rollback to specific revision
kubectl rollout undo deployment/auth-service -n servexa --to-revision=2

# Check rollout history
kubectl rollout history deployment/auth-service -n servexa
```

## 🛡️ Security Best Practices

### 1. Use Secrets for Sensitive Data
```powershell
# Create secrets for database credentials
kubectl create secret generic db-credentials -n servexa `
  --from-literal=username=postgres `
  --from-literal=password=YOUR_SECURE_PASSWORD
```

### 2. Enable Network Policies
```powershell
kubectl apply -f k8s-gke/network-policies.yaml
```

### 3. Regular Updates
```powershell
# GKE Autopilot automatically updates nodes
# You just need to keep your application images updated
```

## 🎓 Useful Commands Cheat Sheet

```powershell
# Cluster management
gcloud container clusters list
gcloud container clusters describe servexa-cluster --region=us-central1

# Get cluster credentials
gcloud container clusters get-credentials servexa-cluster --region=us-central1

# Scale deployments
kubectl scale deployment auth-service -n servexa --replicas=3

# Update image
kubectl set image deployment/auth-service auth-service=yourusername/servexa-auth:v2 -n servexa

# Restart deployment
kubectl rollout restart deployment/auth-service -n servexa

# Delete all resources
kubectl delete namespace servexa

# Delete cluster
gcloud container clusters delete servexa-cluster --region=us-central1
```

## 🐛 Troubleshooting

### Pods not starting
```powershell
# Check pod status
kubectl describe pod -n servexa POD_NAME

# Common issues:
# - Image pull errors: Check Docker Hub credentials
# - CrashLoopBackOff: Check application logs
# - Pending: Check resource requests vs. available resources
```

### Services not accessible
```powershell
# Check service endpoints
kubectl get endpoints -n servexa

# Test service connectivity
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n servexa -- curl http://auth-service:8081/actuator/health
```

### Database connection issues
```powershell
# Check if databases are running
kubectl get pods -n servexa -l app=postgres
kubectl get pods -n servexa -l app=redis

# Test database connection
kubectl exec -it -n servexa POD_NAME -- env | grep DB_
```

## 📚 Additional Resources

- [GKE Autopilot Documentation](https://cloud.google.com/kubernetes-engine/docs/concepts/autopilot-overview)
- [Google Cloud Free Tier](https://cloud.google.com/free)
- [Kubernetes Best Practices](https://cloud.google.com/blog/products/containers-kubernetes/your-guide-kubernetes-best-practices)
- [GKE Security Best Practices](https://cloud.google.com/kubernetes-engine/docs/how-to/hardening-your-cluster)

## ✅ Deployment Checklist

- [ ] Google Cloud account created with $300 credits
- [ ] gcloud CLI installed and configured
- [ ] Docker Hub account created
- [ ] GKE Autopilot cluster created
- [ ] Docker images built and pushed to Docker Hub
- [ ] Kubernetes manifests updated with Docker Hub image names
- [ ] Database credentials secured in Kubernetes secrets
- [ ] Application deployed to GKE
- [ ] Ingress configured with external IP
- [ ] Application accessible via browser
- [ ] Monitoring and logging enabled
- [ ] Billing alerts configured

## 🎉 Success!

Once deployed, your ServeXa application will be:
- ✅ Running on Google's infrastructure
- ✅ Automatically scaled based on demand
- ✅ Highly available with automatic failover
- ✅ Monitored with Cloud Monitoring
- ✅ Secured with Google Cloud security
- ✅ Cost-optimized with Autopilot

Your application will be accessible at the external IP provided by the Load Balancer!
