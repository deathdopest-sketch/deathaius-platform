#!/bin/bash

# DeathAIAUS Kubernetes Deployment Script
echo "💀 DeathAIAUS Kubernetes Deployment 💀"
echo "====================================="

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

# Build and push Docker image
echo "🔨 Building and pushing Docker image..."
docker build -t deathaius:latest .
docker tag deathaius:latest your-registry/deathaiaus:latest
docker push your-registry/deathaiaus:latest

# Apply Kubernetes manifests
echo "📦 Applying Kubernetes manifests..."

# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply ConfigMap and Secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Deploy MongoDB
kubectl apply -f k8s/mongodb.yaml

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
kubectl wait --for=condition=ready pod -l app=mongodb -n deathaius --timeout=300s

# Deploy DeathAIAUS application
kubectl apply -f k8s/deployment.yaml

# Wait for application to be ready
echo "⏳ Waiting for DeathAIAUS to be ready..."
kubectl wait --for=condition=ready pod -l app=deathaius -n deathaius --timeout=300s

# Apply Ingress
kubectl apply -f k8s/ingress.yaml

# Show status
echo "🔍 Deployment status:"
kubectl get pods -n deathaius
kubectl get services -n deathaius
kubectl get ingress -n deathaius

echo ""
echo "✅ DeathAIAUS deployed to Kubernetes!"
echo "🌐 Check ingress status: kubectl get ingress -n deathaius"
echo "📊 Monitor pods: kubectl get pods -n deathaius -w"
echo "📝 View logs: kubectl logs -f deployment/deathaiaus -n deathaius"
