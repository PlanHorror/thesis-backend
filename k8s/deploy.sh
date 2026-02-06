#!/bin/bash

# ===========================================
# Thesis Backend - Kubernetes Deployment Script
# ===========================================

set -e

NAMESPACE="thesis"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "======================================"
echo "  Thesis Backend K8s Deployment"
echo "======================================"

# Check if minikube is running
if ! minikube status > /dev/null 2>&1; then
    echo "❌ Minikube is not running. Starting..."
    minikube start
fi

# Enable ingress addon if not enabled
if ! minikube addons list | grep -q "ingress.*enabled"; then
    echo "📦 Enabling ingress addon..."
    minikube addons enable ingress
fi

# Point Docker to Minikube's Docker daemon
echo "🐳 Configuring Docker to use Minikube's daemon..."
eval $(minikube docker-env)

# Build the Docker image inside Minikube
echo "🔨 Building Docker image..."
docker build -t thesis-backend:latest "$SCRIPT_DIR/.."

# Check if secret files exist
if [ ! -f "$SCRIPT_DIR/postgres/secret.yaml" ]; then
    echo "❌ Error: k8s/postgres/secret.yaml not found!"
    echo "   Copy secret.example.yaml to secret.yaml and fill in your values."
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/backend/secret.yaml" ]; then
    echo "❌ Error: k8s/backend/secret.yaml not found!"
    echo "   Copy secret.example.yaml to secret.yaml and fill in your values."
    exit 1
fi

# Apply Kubernetes resources
echo "📦 Creating namespace..."
kubectl apply -f "$SCRIPT_DIR/namespace.yaml"

echo "🔐 Applying secrets..."
kubectl apply -f "$SCRIPT_DIR/postgres/secret.yaml"
kubectl apply -f "$SCRIPT_DIR/backend/secret.yaml"

echo "⚙️  Applying configs..."
kubectl apply -f "$SCRIPT_DIR/backend/configmap.yaml"

echo "💾 Creating persistent volume claims..."
kubectl apply -f "$SCRIPT_DIR/postgres/pvc.yaml"
kubectl apply -f "$SCRIPT_DIR/backend/attachments-pvc.yaml"

echo "🐘 Deploying PostgreSQL..."
kubectl apply -f "$SCRIPT_DIR/postgres/deployment.yaml"
kubectl apply -f "$SCRIPT_DIR/postgres/service.yaml"

echo "⏳ Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=120s

echo "🚀 Deploying Backend..."
kubectl apply -f "$SCRIPT_DIR/backend/deployment.yaml"
kubectl apply -f "$SCRIPT_DIR/backend/service.yaml"
kubectl apply -f "$SCRIPT_DIR/backend/ingress.yaml"

# Force pods to restart and pick up the new image
echo "🔄 Restarting backend pods to pick up new image..."
kubectl rollout restart deployment/backend -n $NAMESPACE

echo "⏳ Waiting for Backend to be ready..."
kubectl rollout status deployment/backend -n $NAMESPACE --timeout=120s

# Get Minikube IP
MINIKUBE_IP=$(minikube ip)

echo ""
echo "======================================"
echo "  ✅ Deployment Complete!"
echo "======================================"
echo ""
echo "📝 Add this to /etc/hosts:"
echo "   $MINIKUBE_IP thesis.local"
echo ""
echo "🌐 Access your API at:"
echo "   http://thesis.local/api"
echo ""
echo "🌐 Access your Frontend at:"
echo "   http://thesis.local"
echo ""
echo "📊 Check status:"
echo "   kubectl get pods -n $NAMESPACE"
echo "   kubectl get svc -n $NAMESPACE"
echo "   kubectl get ingress -n $NAMESPACE"
echo ""
echo "📜 View logs:"
echo "   kubectl logs -f -l app=backend -n $NAMESPACE"
echo ""
