# Quick Kubernetes Setup Guide

## Option 1: Docker Desktop Kubernetes (Recommended)

1. Open Docker Desktop
2. Go to Settings → Kubernetes
3. Enable Kubernetes
4. Apply & Restart
5. Verify: `kubectl cluster-info`

## Option 2: Minikube Setup

### Install Minikube (if not installed):

```powershell
# Using Chocolatey
choco install minikube

# Or download from: https://minikube.sigs.k8s.io/docs/start/
```

### Start Minikube:

```powershell
# Start with sufficient resources
minikube start --memory=4096 --cpus=4 --disk-size=20g

# Enable ingress addon
minikube addons enable ingress

# Verify
kubectl cluster-info
```

## Option 3: Cloud Kubernetes (Advanced)

- **Azure AKS**: `az aks create`
- **AWS EKS**: `eksctl create cluster`
- **Google GKE**: `gcloud container clusters create`

## Next Steps After Kubernetes is Ready:

1. Verify cluster: `kubectl cluster-info`
2. Deploy ServeXa: `.\deploy-k8s.bat deploy`
3. Access application via port forwarding or ingress
