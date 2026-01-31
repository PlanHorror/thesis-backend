# Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the Thesis Backend.

## Prerequisites

- [Minikube](https://minikube.sigs.k8s.io/docs/start/) installed and running
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
- Docker installed

## Quick Start

### 1. Create Secret Files

Copy the example secret files and fill in your values:

```bash
# PostgreSQL secrets
cp k8s/postgres/secret.example.yaml k8s/postgres/secret.yaml

# Backend secrets
cp k8s/backend/secret.example.yaml k8s/backend/secret.yaml
```

### 2. Edit Secret Files

Encode your values in base64:

```bash
# Example: encode values
echo -n "postgres" | base64           # cG9zdGdyZXM=
echo -n "your-password" | base64      # eW91ci1wYXNzd29yZA==
echo -n "thesis_db" | base64          # dGhlc2lzX2Ri

# For DATABASE_URL (use postgres-service as host)
echo -n "postgresql://postgres:your-password@postgres-service:5432/thesis_db" | base64
```

### 3. Deploy

Option A: Use the deployment script

```bash
chmod +x k8s/deploy.sh
./k8s/deploy.sh
```

Option B: Manual deployment

```bash
# Start Minikube
minikube start

# Enable ingress
minikube addons enable ingress

# Use Minikube's Docker daemon
eval $(minikube docker-env)

# Build image
docker build -t thesis-backend:latest .

# Apply resources
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/backend/
```

### 4. Access the API

Add Minikube IP to `/etc/hosts`:

```bash
echo "$(minikube ip) api.thesis.local" | sudo tee -a /etc/hosts
```

Access at: http://api.thesis.local

## File Structure

```
k8s/
├── namespace.yaml              # Namespace definition
├── deploy.sh                   # Deployment script
├── README.md                   # This file
├── postgres/
│   ├── secret.example.yaml     # Secret template (commit)
│   ├── secret.yaml             # Actual secrets (gitignored)
│   ├── pvc.yaml                # Persistent volume claim
│   ├── deployment.yaml         # PostgreSQL deployment
│   └── service.yaml            # PostgreSQL service
└── backend/
    ├── configmap.yaml          # Non-sensitive config
    ├── secret.example.yaml     # Secret template (commit)
    ├── secret.yaml             # Actual secrets (gitignored)
    ├── deployment.yaml         # Backend deployment
    ├── service.yaml            # Backend service
    └── ingress.yaml            # Ingress for external access
```

## Useful Commands

```bash
# Check pod status
kubectl get pods -n thesis

# View logs
kubectl logs -f -l app=backend -n thesis
kubectl logs -f -l app=postgres -n thesis

# Shell into pod
kubectl exec -it -n thesis deploy/backend -- sh
kubectl exec -it -n thesis deploy/postgres -- psql -U postgres

# Run Prisma migrations
kubectl exec -it -n thesis deploy/backend -- npx prisma migrate deploy

# Port forward (alternative to ingress)
kubectl port-forward -n thesis svc/backend-service 3000:80

# Delete everything
kubectl delete namespace thesis
```

## Troubleshooting

### Image Pull Error

```bash
# Make sure to use Minikube's Docker daemon
eval $(minikube docker-env)
docker build -t thesis-backend:latest .
```

### Pod CrashLoopBackOff

```bash
# Check logs
kubectl logs -n thesis <pod-name>

# Check events
kubectl describe pod -n thesis <pod-name>
```

### Database Connection Error

```bash
# Verify PostgreSQL is running
kubectl get pods -n thesis -l app=postgres

# Check DATABASE_URL format
# Should be: postgresql://USER:PASS@postgres-service:5432/DB
```
