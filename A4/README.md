# Assignment 4: Complete CI/CD Pipeline with Testing & Deployment

**Student:** Tshering Norbu (02230309)  
**Course:** DSO101 — Continuous Integration and Continuous Deployment

## Objective

Implement a DevOps pipeline that automates **build**, **test**, and **deploy** for a Node.js backend application, with automatic deployment to Render on every push to `main`.

## Project structure

```
A4/
├── app.js                 # Express + SQLite todo API
├── __tests__/test_app.js  # Jest unit & API tests
├── package.json
├── Dockerfile
├── docker-compose.yml
├── jest.config.js
└── README.md

.github/workflows/ci.yml   # Active CI/CD workflow (repository root)
```

## Tools used

| Tool | Purpose |
|------|---------|
| GitHub | Source control |
| GitHub Actions | CI/CD automation |
| Jest | Unit & API testing |
| Docker / Docker Hub | Container build & registry |
| Render.com | Cloud deployment |

## Pipeline stages

1. **Build** — install dependencies (`npm ci`)
2. **Test** — run Jest (`npm test`)
3. **Deploy** — build & push Docker image, trigger Render deploy webhook

## Local development

```bash
cd A4
npm install
npm test
npm start
# API: http://localhost:3000
```

```bash
docker compose up --build
```

## GitHub Secrets

Configure under **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `RENDER_A4_DEPLOY_WEBHOOK_URL` | Render deploy hook for the A4 service |

> Do not hardcode credentials in source code.

## Render setup

1. **New +** → **Web Service** → **Deploy an existing image**
2. Image: `YOUR_USERNAME/a4-todo-app:latest`
3. Port: **3000**
4. Environment: `DOCKER_ENV=true`, `PORT=3000`
5. Copy **Deploy Hook** → add as `RENDER_A4_DEPLOY_WEBHOOK_URL`

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

## Steps taken

1. Created Node.js todo backend (`app.js`) with SQLite storage
2. Added Jest tests in `__tests__/test_app.js` (sample + API tests)
3. Created `.github/workflows/ci.yml` with build, test, Docker push, and Render deploy
4. Containerized the app with `Dockerfile` for Render deployment from Docker Hub

## Challenges faced

1. **Native SQLite on Alpine** — required `python3`, `make`, and `g++` in the Dockerfile for `better-sqlite3`
2. **Render auto-deploy** — new Docker Hub tags do not redeploy automatically; solved with a deploy webhook in the workflow
3. **Workflow location** — GitHub Actions only runs workflows from the repository root `.github/workflows/`

## Learning outcomes

- End-to-end CI/CD: commit → test → container → cloud deploy
- Separating build, test, and deploy stages in a pipeline
- Managing secrets securely in GitHub Actions
- Connecting Docker Hub and Render for automated deployments

## Submission checklist

- [ ] Public GitHub repository link
- [ ] Workflow file: `.github/workflows/ci.yml`
- [ ] Screenshot: successful test run in GitHub Actions
- [ ] Screenshot: workflow run (build + test + deploy steps)
- [ ] Live app URL on Render

### Screenshot placeholders

| # | Description | File |
|---|-------------|------|
| 1 | Jest / test output in Actions | `screenshots/test-output.png` |
| 2 | Full pipeline success | `screenshots/ci-pipeline.png` |
| 3 | Live Render app | `screenshots/render-live.png` |

## Links

| Resource | URL |
|----------|-----|
| GitHub repo | https://github.com/T-nobu/DSO101 |
| Docker Hub image | https://hub.docker.com/r/YOUR_USERNAME/a4-todo-app |
| Live app (Render) | https://YOUR-A4-SERVICE.onrender.com |

> Update URLs after deployment with your account details.
