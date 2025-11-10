#!/bin/bash

# ServeXa Kubernetes Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="servexa"
REGISTRY="${REGISTRY:-}"
VERSION="${VERSION:-latest}"

# Functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check helm
    if ! command -v helm &> /dev/null; then
        print_warning "helm is not installed. Raw YAML deployment will be used."
        USE_HELM=false
    else
        USE_HELM=true
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    print_success "Prerequisites check completed"
}

build_and_push_images() {
    print_info "Building and pushing Docker images..."
    
    if [ -z "$REGISTRY" ]; then
        print_warning "No registry specified. Assuming images are available locally."
        return 0
    fi
    
    # Build images
    docker-compose build
    
    # Tag and push images
    services=("frontend" "auth-service" "appointment-service" "vehicle-service")
    
    for service in "${services[@]}"; do
        print_info "Pushing ${service}..."
        docker tag "servexa/${service}:latest" "${REGISTRY}/servexa-${service}:${VERSION}"
        docker push "${REGISTRY}/servexa-${service}:${VERSION}"
    done
    
    print_success "Images built and pushed successfully"
}

deploy_with_helm() {
    print_info "Deploying with Helm..."
    
    # Update image tags in values if registry is specified
    if [ -n "$REGISTRY" ]; then
        print_info "Updating image references for registry: $REGISTRY"
        # This would need to be implemented based on your values.yaml structure
    fi
    
    helm upgrade --install servexa ./helm/servexa \
        --namespace "$NAMESPACE" \
        --create-namespace \
        --values ./helm/servexa/values.yaml \
        --wait \
        --timeout 10m
    
    print_success "Helm deployment completed"
}

deploy_with_kubectl() {
    print_info "Deploying with kubectl..."
    
    # Apply manifests in order
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/postgres.yaml
    kubectl apply -f k8s/redis.yaml
    
    # Wait for database to be ready
    print_info "Waiting for database to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/postgres -n "$NAMESPACE"
    
    kubectl apply -f k8s/auth-service.yaml
    kubectl apply -f k8s/backend-services.yaml
    kubectl apply -f k8s/frontend.yaml
    kubectl apply -f k8s/ingress-and-scaling.yaml
    
    print_success "kubectl deployment completed"
}

wait_for_deployment() {
    print_info "Waiting for all deployments to be ready..."
    
    deployments=$(kubectl get deployments -n "$NAMESPACE" -o name)
    
    for deployment in $deployments; do
        kubectl wait --for=condition=available --timeout=300s "$deployment" -n "$NAMESPACE"
    done
    
    print_success "All deployments are ready"
}

show_access_info() {
    print_info "Deployment completed! Access information:"
    echo
    
    # Show services
    kubectl get svc -n "$NAMESPACE"
    echo
    
    # Show ingress if available
    if kubectl get ingress -n "$NAMESPACE" &> /dev/null; then
        print_info "Ingress configuration:"
        kubectl get ingress -n "$NAMESPACE"
        echo
        print_info "Add this to your /etc/hosts file:"
        echo "$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}') servexa.local"
        echo
    fi
    
    # Port forwarding instructions
    print_info "To access via port-forwarding:"
    echo "kubectl port-forward -n $NAMESPACE svc/frontend 3000:80"
    echo "Then visit: http://localhost:3000"
}

# Main execution
main() {
    echo "ServeXa Kubernetes Deployment Script"
    echo "===================================="
    
    check_prerequisites
    
    # Parse command line arguments
    case "${1:-deploy}" in
        "build")
            build_and_push_images
            ;;
        "deploy")
            if [ "$USE_HELM" = true ]; then
                deploy_with_helm
            else
                deploy_with_kubectl
            fi
            wait_for_deployment
            show_access_info
            ;;
        "build-deploy")
            build_and_push_images
            if [ "$USE_HELM" = true ]; then
                deploy_with_helm
            else
                deploy_with_kubectl
            fi
            wait_for_deployment
            show_access_info
            ;;
        "status")
            kubectl get all -n "$NAMESPACE"
            ;;
        "logs")
            service="${2:-frontend}"
            kubectl logs -n "$NAMESPACE" -f "deployment/$service"
            ;;
        "clean")
            print_warning "This will delete the entire ServeXa deployment!"
            read -p "Are you sure? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                if [ "$USE_HELM" = true ] && helm list -n "$NAMESPACE" | grep -q servexa; then
                    helm uninstall servexa -n "$NAMESPACE"
                else
                    kubectl delete -f k8s/ || true
                fi
                kubectl delete namespace "$NAMESPACE" || true
                print_success "Cleanup completed"
            fi
            ;;
        "help"|*)
            echo "Usage: $0 [command]"
            echo
            echo "Commands:"
            echo "  deploy       - Deploy ServeXa to Kubernetes (default)"
            echo "  build        - Build and push Docker images"
            echo "  build-deploy - Build images and deploy"
            echo "  status       - Show deployment status"
            echo "  logs [svc]   - Show logs for service (default: frontend)"
            echo "  clean        - Remove ServeXa deployment"
            echo "  help         - Show this help message"
            echo
            echo "Environment variables:"
            echo "  REGISTRY     - Docker registry (optional)"
            echo "  VERSION      - Image version tag (default: latest)"
            ;;
    esac
}

main "$@"