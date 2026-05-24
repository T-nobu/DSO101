# Docker Image Management - Backend & Frontend

This project uses separate Docker images for backend and frontend services, pushed to Docker Hub under the username `tnobu`.

## Image Tags

- **Backend**: `tnobu/app-backend:latest`, `tnobu/app-backend:v1.0`
- **Frontend**: `tnobu/app-frontend:latest`, `tnobu/app-frontend:v1.0`

## Prerequisites

1. Install Docker on your machine
2. Log in to Docker Hub: `docker login`
3. Ensure you have push permissions to `tnobu` on Docker Hub

## Build & Push Scripts

### Backend

Navigate to the `backend/` directory:

```bash
# Build the backend image
cd backend
npm run docker:build

# Push to Docker Hub
npm run docker:push

# Build and push in one command
npm run docker:buildpush
```

### Frontend

Navigate to the `frontend/` directory:

```bash
# Build the frontend image
cd frontend
npm run docker:build

# Push to Docker Hub
npm run docker:push

# Build and push in one command
npm run docker:buildpush
```

### Build Both (from root directory)

```bash
# Backend
cd backend && npm run docker:buildpush && cd ..

# Frontend
cd frontend && npm run docker:buildpush && cd ..
```

## Verify Images

```bash
# List local Docker images
docker images | grep tnobu/app-

# Check Docker Hub
# Visit: https://hub.docker.com/u/tnobu
```

## Pulling Images from Docker Hub

```bash
# Pull backend image
docker pull tnobu/app-backend:latest

# Pull frontend image
docker pull tnobu/app-frontend:latest
```

## Troubleshooting

- **Authentication Error**: Run `docker logout` and then `docker login` again
- **Permission Denied**: Ensure your Docker Hub user has push rights to the `tnobu` namespace
- **Build Fails**: Check that you're in the correct directory (backend/ or frontend/) before running npm scripts
