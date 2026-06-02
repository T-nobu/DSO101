# Assignment 4 Report
---

## What I did

I built a complete DevOps pipeline: **build → test → deploy** on every push to `main`.

**Backend (`A4/`)**
- `app.js` — Express Todo API with SQLite (CRUD on `/api/tasks`)
- `__tests__/test_app.js` — Jest unit test (`1+1`) plus API tests with Supertest (5 tests total)
- `package.json` with `start`, `test`, `build`, and Docker scripts

**CI/CD (`.github/workflows/ci.yml`)**
1. **Build** — `npm ci` and `npm run build` in `A4/`  
2. **Test** — `npm test` (Jest with coverage)  
3. **Deploy** — Docker build → push `a4-todo-app:latest` to Docker Hub → POST to Render deploy webhook  

Secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `RENDER_A4_DEPLOY_WEBHOOK_URL`.

**Render**
- Service from image `tnobu/a4-todo-app:latest`, port 3000, env `DOCKER_ENV=true`


---

## Challenges

- Same SQLite-on-Alpine fix as A3 (build tools in Dockerfile).  
- Had to run tests in Docker (`RUN npm test`) so broken code never gets pushed.  
- Separate Render service and webhook for A4 so it does not clash with A3’s `todo-app` image.

---

## What I learned

- A real pipeline is more than deployment — tests must run before production  
- Separating stages (build / test / deploy) matches how teams work in industry  
- One `git push` can test, containerize, and update a live URL if secrets and webhooks are set up once  


