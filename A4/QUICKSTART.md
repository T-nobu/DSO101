# A4 Quick Start

## 1. Secrets (GitHub → Settings → Secrets)

```
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
RENDER_A4_DEPLOY_WEBHOOK_URL
```

## 2. Render

- Image: `YOUR_USERNAME/a4-todo-app:latest`
- Port: `3000`
- Env: `DOCKER_ENV=true`, `PORT=3000`

## 3. Push

```bash
git add A4 .github/workflows/ci.yml
git commit -m "Add Assignment 4 CI/CD pipeline"
git push origin main
```

Watch: **Actions → CI/CD Pipeline**

## 4. Verify

- `curl https://YOUR-SERVICE.onrender.com/health`
- Docker Hub shows `a4-todo-app:latest`
