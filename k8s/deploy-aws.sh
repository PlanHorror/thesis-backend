#!/bin/bash

# ===========================================
# Thesis Backend - AWS EKS Deployment Script
# ===========================================

set -e

# Configuration - UPDATE THESE VALUES
AWS_REGION="${AWS_REGION:-ap-southeast-2}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-}"
ECR_REPO_NAME="thesis-backend"
EKS_CLUSTER_NAME="${EKS_CLUSTER_NAME:-thesis-cluster}"
NAMESPACE="thesis"
IMAGE_TAG="${IMAGE_TAG:-latest}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "======================================"
echo "  Thesis Backend AWS EKS Deployment"
echo "======================================"

# Check required tools
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI required. Install: https://aws.amazon.com/cli/"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "❌ kubectl required."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker required."; exit 1; }

# Check AWS Account ID
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "🔍 Getting AWS Account ID..."
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
fi

ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
IMAGE_URI="$ECR_URI/$ECR_REPO_NAME:$IMAGE_TAG"

echo "📋 Configuration:"
echo "   AWS Region: $AWS_REGION"
echo "   AWS Account: $AWS_ACCOUNT_ID"
echo "   ECR Image: $IMAGE_URI"
echo "   EKS Cluster: $EKS_CLUSTER_NAME"
echo ""

# Update kubeconfig for EKS
echo "🔧 Configuring kubectl for EKS..."
aws eks update-kubeconfig --region "$AWS_REGION" --name "$EKS_CLUSTER_NAME"

# Create ECR repository if it doesn't exist
echo "📦 Ensuring ECR repository exists..."
aws ecr describe-repositories --repository-names "$ECR_REPO_NAME" --region "$AWS_REGION" 2>/dev/null || \
    aws ecr create-repository --repository-name "$ECR_REPO_NAME" --region "$AWS_REGION"

# Login to ECR
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_URI"

# Build and push Docker image
echo "🔨 Building Docker image..."
docker build -t "$ECR_REPO_NAME:$IMAGE_TAG" "$SCRIPT_DIR/.."

echo "🏷️  Tagging image for ECR..."
docker tag "$ECR_REPO_NAME:$IMAGE_TAG" "$IMAGE_URI"

echo "⬆️  Pushing image to ECR..."
docker push "$IMAGE_URI"

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

# Update backend deployment with ECR image
echo "🔄 Updating deployment with ECR image..."
DEPLOY_FILE="$SCRIPT_DIR/backend/deployment.yaml"
TEMP_DEPLOY="/tmp/backend-deployment-aws.yaml"
sed "s|image: thesis-backend:latest|image: $IMAGE_URI|g; s|imagePullPolicy: Never|imagePullPolicy: Always|g" "$DEPLOY_FILE" > "$TEMP_DEPLOY"

# Apply Kubernetes resources
echo "📦 Creating namespace..."
kubectl apply -f "$SCRIPT_DIR/namespace.yaml"

# Note: Using AWS ALB Ingress Controller (must be installed separately)
# See: helm install aws-load-balancer-controller eks/aws-load-balancer-controller
echo "🌐 Checking AWS Load Balancer Controller..."
if kubectl get deployment aws-load-balancer-controller -n kube-system >/dev/null 2>&1; then
    echo "✅ AWS Load Balancer Controller already installed"
else
    echo "⚠️  AWS Load Balancer Controller not found in kube-system."
    echo "   Install it first: https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html"
    exit 1
fi

echo "🔐 Applying secrets..."
kubectl apply -f "$SCRIPT_DIR/postgres/secret.yaml"
kubectl apply -f "$SCRIPT_DIR/backend/secret.yaml"

echo "⚙️  Applying configs..."
kubectl apply -f "$SCRIPT_DIR/backend/configmap.yaml"

echo "💾 Creating persistent volume claims..."
kubectl apply -f "$SCRIPT_DIR/postgres/pvc-aws.yaml"
kubectl apply -f "$SCRIPT_DIR/backend/attachments-pvc-aws.yaml"

echo "🐘 Deploying PostgreSQL..."
kubectl apply -f "$SCRIPT_DIR/postgres/deployment.yaml"
kubectl apply -f "$SCRIPT_DIR/postgres/service.yaml"

echo "⏳ Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=180s

echo "🚀 Deploying Backend..."
kubectl apply -f "$TEMP_DEPLOY"
kubectl apply -f "$SCRIPT_DIR/backend/service.yaml"
kubectl apply -f "$SCRIPT_DIR/backend/ingress-aws.yaml"

# Force pods to pull the latest image (needed when tag is "latest")
echo "🔄 Rolling out new version..."
kubectl rollout restart deployment/backend -n $NAMESPACE

echo "⏳ Waiting for Backend to be ready..."
kubectl rollout status deployment/backend -n $NAMESPACE --timeout=180s

# Clean up temp file
rm -f "$TEMP_DEPLOY"

# Get ALB URL
echo "⏳ Waiting for ALB to be ready..."
sleep 10
for i in $(seq 1 12); do
    ALB_HOSTNAME=$(kubectl get ingress app-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    if [ -n "$ALB_HOSTNAME" ] && [ "$ALB_HOSTNAME" != "" ]; then
        break
    fi
    echo "   Waiting for ALB... ($i/12)"
    sleep 10
done

if [ -z "$ALB_HOSTNAME" ]; then
    ALB_HOSTNAME="(pending - check: kubectl get ingress app-ingress -n $NAMESPACE)"
fi

echo ""
echo "======================================"
echo "  ✅ AWS Deployment Complete!"
echo "======================================"
echo ""
echo "🖼️  Image pushed to:"
echo "   $IMAGE_URI"
echo ""
echo "🌐 Access your app at:"
echo "   API:      http://$ALB_HOSTNAME/api"
echo "   Frontend: http://$ALB_HOSTNAME/"
echo ""
echo "📝 If using custom domain, create CNAME record:"
echo "   yourdomain.com → $ALB_HOSTNAME"
echo ""
echo "📊 Check status:"
echo "   kubectl get pods -n $NAMESPACE"
echo "   kubectl get svc -n $NAMESPACE"
echo "   kubectl get ingress -n $NAMESPACE"
echo ""
echo "📜 View logs:"
echo "   kubectl logs -f -l app=backend -n $NAMESPACE"
echo ""
