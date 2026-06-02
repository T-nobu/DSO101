# Assignment 3 Implementation Checklist

## Task 1 — GitHub repository

- [x] `package.json` includes `start`, `test`, and Docker helper scripts
- [ ] Repository visibility set to **public** (verify on GitHub)

## Task 2 — Docker

- [x] `A3/Dockerfile` (Node 20 Alpine, `npm test`, port 3000)
- [x] `A3/.dockerignore`
- [x] `A3/docker-compose.yml` for local runs
- [ ] Local test: `docker compose up --build` in `A3/`

## Task 3 — GitHub Actions

- [x] `.github/workflows/deploy.yml` at repository root
- [x] Docker Hub login via secrets
- [x] Build/push `todo-app:latest` from `./A3`
- [x] Render webhook step (no hardcoded credentials)
- [ ] Add secrets on GitHub
- [ ] Push to `main` and confirm green workflow

## Task 4 — Render.com

- [ ] Create web service from existing Docker image
- [ ] Configure port 3000 and env vars
- [ ] Save deploy hook as `RENDER_DEPLOY_WEBHOOK_URL`

## Submission

- [ ] GitHub repo link
- [ ] Screenshots (Actions, Docker Hub, Render)
- [ ] `README.md` updated with your Render URL and screenshots
- [ ] Short report sections completed in README
