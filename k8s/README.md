# Lumina Kubernetes Deployment Guide

This directory contains the production-ready Kubernetes manifests for deploying the Lumina LMS application stack to AWS EKS or any standard Kubernetes cluster (v1.28+).

---

## Architecture Overview

```
                        [ Internet ]
                             │
                      [ AWS ALB / Ingress ]
                     /       │          \
                    /        │           \
       path: /     /    path: /api        \  path: /socket.io
                  ▼          ▼             ▼
          [Frontend Pods]   [Backend API Pods]
          (Next.js Turbopack)  (Node.js / Express / Socket.io)
                                   │
                                   ▼
                            [PostgreSQL Pod]
                         (PersistentVolumeClaim)
```

### Components Included:

| Resource | Manifest | Description |
|---|---|---|
| **Namespace** | `namespace.yaml` | Dedicated `lumina` namespace |
| **ConfigMaps** | `configmap.yaml` | Application configuration for backend and frontend |
| **Secrets** | `secret.yaml` | Sensitive credentials (DB, JWT, Resend, Paystack) |
| **PostgreSQL** | `postgres/` | StatefulSet (1 replica) with `volumeClaimTemplates` (10Gi), ClusterIP Service (`postgres:5432`) |
| **Backend API** | `backend/` | Deployment (2 replicas), ClusterIP Service (`lumina-backend:8000`), `/health` probes, DB readiness wait |
| **Frontend** | `frontend/` | Deployment (2 replicas), ClusterIP Service (`lumina-frontend:3000`), `/` probes |
| **Ingress** | `ingress.yaml` | NGINX Ingress routing `/api`, `/socket.io`, and `/` with WebSocket support |
| **Cert-Manager** | `cert-manager-issuers.yaml` | ClusterIssuers for Let's Encrypt (Prod/Staging) and local Self-Signed |
| **Autoscaling** | `hpa.yaml` | Horizontal Pod Autoscalers (2-6 replicas based on CPU & Memory) |

---

## Quick Start Deployment

### 1. Provision Infrastructure with Terraform
Navigate to the `Terraform/` directory:
```bash
cd Terraform
terraform init
terraform plan
terraform apply
```

After Terraform completes, update your local `kubeconfig`:
```bash
aws eks update-kubeconfig --region us-east-1 --name lumina-eks-cluster
```

Verify your cluster connection:
```bash
kubectl get nodes
```

---

### 2. Configure Secrets
Create `k8s/secret.yaml` from the example template and fill in your secure production credentials:
```bash
cp k8s/secret.yaml.example k8s/secret.yaml
```
Review and edit `k8s/secret.yaml`:
```yaml
stringData:
  DB_PASSWORD: "your_secure_password"
  POSTGRES_PASSWORD: "your_secure_password"
  JWT_SECRET: "your_strong_jwt_secret"
  RESEND_API_KEY: "re_..."
  PAYSTACK_SECRET_KEY: "sk_live_..."
```

---

### 3. Deploy All Manifests
Deploy the namespace first, then all Kubernetes manifests:
```bash
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Deploy configurations and secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# 3. Deploy database, backend, and frontend
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/

# 4. Deploy ingress and autoscaling
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

Or deploy all manifests recursively in one command:
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -R -f k8s/
```

---

### 4. Verify Deployment Status
Check all running workloads:
```bash
kubectl get pods,svc,pvc,ingress -n lumina
```

Stream logs:
```bash
# Backend logs
kubectl logs -f deployment/lumina-backend -n lumina

# Frontend logs
kubectl logs -f deployment/lumina-frontend -n lumina

# Database logs
kubectl logs -f statefulset/postgres -n lumina
```

---

### 5. Local Port Forwarding (Testing without Ingress)
You can test the services locally via `kubectl port-forward`:

```bash
# Port-forward Frontend (access at http://localhost:3000)
kubectl port-forward svc/lumina-frontend 3000:3000 -n lumina

# Port-forward Backend (access at http://localhost:8000)
kubectl port-forward svc/lumina-backend 8000:8000 -n lumina
```

---

### 6. Updating Container Images
When CI/CD builds a new image tag:
```bash
kubectl set image deployment/lumina-backend backend=developerpraise/lumina-backend:<new-tag> -n lumina
kubectl set image deployment/lumina-frontend frontend=developerpraise/lumina-frontend:<new-tag> -n lumina
```
Or trigger a rollout restart:
```bash
kubectl rollout restart deployment/lumina-backend -n lumina
kubectl rollout restart deployment/lumina-frontend -n lumina
```

---

### 7. Deploying NGINX Ingress Controller

#### A. On AWS EKS:
Deploy the official NGINX Ingress Controller manifest for AWS EKS. This automatically provisions an AWS Network Load Balancer (NLB):
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/aws/deploy.yaml
```
Verify the ingress controller pod and get your public AWS Load Balancer address:
```bash
kubectl get pods -n ingress-nginx
kubectl get svc ingress-nginx-controller -n ingress-nginx
```
*(Point your domain's DNS CNAME record to the `EXTERNAL-IP` address).*

#### B. On Minikube (Local):
Enable the built-in NGINX Ingress addon:
```bash
minikube addons enable ingress
```
Verify it is running:
```bash
kubectl get pods -n ingress-nginx
```

---

### 8. Deploying cert-manager for Automated SSL/TLS (HTTPS)

#### Step 1: Install cert-manager CRDs & Controller
Run on either AWS EKS or Minikube:
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.17.0/cert-manager.yaml
```
Verify all three pods are running:
```bash
kubectl get pods -n cert-manager
```

#### Step 2: Apply ClusterIssuers
```bash
kubectl apply -f k8s/cert-manager-issuers.yaml
```

#### Step 3: Enable TLS in `k8s/ingress.yaml`
Uncomment the `tls` and `host` blocks in `k8s/ingress.yaml`, then apply:
```bash
kubectl apply -f k8s/ingress.yaml
```
cert-manager will automatically communicate with Let's Encrypt via HTTP-01 challenge, issue the SSL certificate, and save it in the `lumina-tls-cert` Secret!

Check certificate issuance status:
```bash
kubectl get certificate -n lumina
kubectl describe certificate lumina-tls-cert -n lumina
```
