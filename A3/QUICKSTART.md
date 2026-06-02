# A3 Quick Start (5 minutes)

## 1. GitHub Secrets

**Repository → Settings → Secrets and variables → Actions → New repository secret**

```
DOCKERHUB_USERNAME     = your-dockerhub-username
DOCKERHUB_TOKEN        = dckr_pat_... (from hub.docker.com/settings/security)
RENDER_DEPLOY_WEBHOOK_URL = https://api.render.com/deploy/srv-...?key=...
```

## 2. Render.com

1. **New +** → **Web Service** → **Deploy an existing image**
2. Image URL: `YOUR_USERNAME/todo-app:latest`
3. Port: `3000`
4. Env: `DOCKER_ENV=true`, `PORT=3000`
5. Copy **Deploy Hook** → paste into `RENDER_DEPLOY_WEBHOOK_URL`

## 3. Push to trigger CI/CD

```bash
git add A3 .github/workflows/deploy.yml
git commit -m "Add Assignment 3 CI/CD pipeline"
git push origin main
```

Watch: **GitHub → Actions → CI/CD - Build, Push to Docker Hub, and Deploy to Render**

## 4. Verify

- Docker Hub: new `todo-app:latest` tag
- Render: new deploy in service logs
- Live API: `https://YOUR-SERVICE.onrender.com/health`
