# Assignment 3: CI/CD with GitHub Actions, Docker Hub, and Render

**Student:** Tshering Norbu (02230309)  
**Course:** DSO101 — Continuous Integration and Continuous Deployment  
**Repository:** [T-nobu/DSO101](https://github.com/T-nobu/DSO101)

## Overview

This folder contains a Node.js **Todo List API** (from Assignment 1) with:

- Docker containerization (`Dockerfile`, `docker-compose.yml`)
- Automated CI/CD via GitHub Actions (`.github/workflows/deploy.yml` at repository root)
- Deployment to Render.com using a Docker image from Docker Hub

## Project structure

```
A3/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── server.js
├── jest.config.js
├── __tests__/server.test.js
├── .dockerignore
├── .gitignore
└── README.md

.github/workflows/deploy.yml   ← active workflow (repository root)
```

## Steps taken

1. **Repository setup (Task 1)**
   - Added `package.json` scripts: `start`, `test`, `docker:build`, `docker:run`
   - Ensured the GitHub repository is **public**

2. **Docker (Task 2)**
   - Created `Dockerfile` using `node:20-alpine`, `npm install`, `npm test`, port `3000`
   - Added `.dockerignore` to keep images small
   - Tested locally with `docker compose up --build`

3. **GitHub Actions (Task 3)**
   - Created `.github/workflows/deploy.yml` at the repo root
   - On push to `main`: build image → push to Docker Hub → call Render deploy webhook
   - Secrets used (never hardcoded):
     - `DOCKERHUB_USERNAME`
     - `DOCKERHUB_TOKEN`
     - `RENDER_DEPLOY_WEBHOOK_URL`

4. **Render.com (Task 4)**
   - Created a **Web Service** → **Deploy an existing image**
   - Image: `<DOCKERHUB_USERNAME>/todo-app:latest`
   - Port: `3000`
   - Environment: `DOCKER_ENV=true`, `PORT=3000`

## GitHub Secrets setup

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Access token from [Docker Hub Security](https://hub.docker.com/settings/security) |
| `RENDER_DEPLOY_WEBHOOK_URL` | Deploy hook from Render → Service → **Settings** → **Deploy** → **Deploy Hook** |

## Local testing

```bash
cd A3
npm install
npm test
npm start
# API: http://localhost:3000/api/tasks

# Docker
docker compose up --build
# or
npm run docker:build
npm run docker:run
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task (`{ "description": "..." }`) |
| GET | `/api/tasks/:id` | Get one task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

## Challenges faced

1. **Native SQLite in Alpine** — `better-sqlite3` needs build tools on Alpine; added `python3`, `make`, and `g++` to the Dockerfile.
2. **Render image updates** — Pushing a new tag to Docker Hub does not redeploy Render automatically; solved with a **deploy webhook** in the GitHub Actions workflow.
3. **Workflow location** — GitHub only runs workflows from `.github/workflows` at the **repository root**, so the active file is `DSO101/.github/workflows/deploy.yml` with build context `./A3`.

## Learning outcomes

- Automated build, test, and deploy pipelines with GitHub Actions
- Publishing versioned container images to Docker Hub
- Connecting CI/CD to cloud hosting (Render) via webhooks and secrets
- Keeping credentials out of source code using GitHub Secrets

## Deliverables (screenshots)

Add your screenshots under `A3/screenshots/` (create the folder when you capture them):

1. **GitHub Actions** — successful workflow run  
2. **Docker Hub** — `todo-app:latest` image pushed  
3. **Render** — live deployment dashboard  

### Screenshot placeholders

<!-- Replace these with your actual images -->

| # | Description | File |
|---|-------------|------|
| 1 | GitHub Actions success | `screenshots/github-actions.png` |
| 2 | Docker Hub image | `screenshots/dockerhub.png` |
| 3 | Render deployment | `screenshots/render.png` |

## Links

| Resource | URL |
|----------|-----|
| GitHub repository | https://github.com/T-nobu/DSO101 |
| Docker Hub image | https://hub.docker.com/r/YOUR_USERNAME/todo-app |
| Render deployment | https://YOUR-SERVICE.onrender.com |
| Render deploy hooks | https://render.com/docs/deploy-hooks |

> **Note:** Update the Docker Hub and Render URLs after you deploy with your account.

## Render configuration checklist

- [ ] Docker Hub repository `todo-app` is **public**
- [ ] GitHub Secrets configured
- [ ] Render service: **Existing Image** → `username/todo-app:latest`
- [ ] Port **3000**, health check path `/health`
- [ ] Deploy hook URL saved as `RENDER_DEPLOY_WEBHOOK_URL`
