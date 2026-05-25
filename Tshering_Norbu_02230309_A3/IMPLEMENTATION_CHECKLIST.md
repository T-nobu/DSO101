# A3 Implementation Checklist

## Phase 1: GitHub Repository Setup ✅

- [ ] Repository is public (Settings > Visibility > Public)
- [ ] Repository has all required files committed
- [ ] `backend/package.json` has `start` and `test` scripts
- [ ] `frontend/package.json` has `start`, `build`, and `test` scripts
- [ ] `.git` initialized and remote added
- [ ] Can push to main branch successfully

**Verification**:
```bash
cd d:\DSO101
git remote -v
# Should show: origin https://github.com/T-nobu/DSO101.git
```

---

## Phase 2: Docker Configuration ✅

- [ ] `Tshering_Norbu_02230309_A2/backend/Dockerfile` exists
  - Uses `node:18-alpine` base image
  - Has multi-stage build
  - Exposes port 5000
  - Runs `npm start`

- [ ] `Tshering_Norbu_02230309_A2/frontend/Dockerfile` exists
  - Uses `node:18-alpine` for build
  - Uses `nginx:stable-alpine` for serving
  - Sets `REACT_APP_API_URL` environment variable
  - Exposes port 80

- [ ] `backend/.dockerignore` exists with proper exclusions

- [ ] `frontend/.dockerignore` exists with proper exclusions

**Verification**:
```bash
# Test backend build locally
cd Tshering_Norbu_02230309_A2/backend
docker build -t test-backend .

# Test frontend build locally
cd ../frontend
docker build -t test-frontend .
```

---

## Phase 3: GitHub Actions Workflow ✅

- [ ] `.github/workflows/deploy.yml` exists in root
- [ ] Workflow triggers on `push` to `main` branch
- [ ] Workflow has all 8 steps:
  - [ ] Checkout Repository
  - [ ] Set up Docker Buildx
  - [ ] Login to Docker Hub
  - [ ] Build and Push Backend Image
  - [ ] Build and Push Frontend Image
  - [ ] Trigger Render Backend Webhook
  - [ ] Trigger Render Frontend Webhook
  - [ ] Workflow Summary

**Verification**:
```bash
# Syntax check (GitHub will do this automatically)
cd d:\DSO101
cat .github/workflows/deploy.yml
```

---

## Phase 4: GitHub Secrets Configuration ⚠️ MANUAL STEP

**DO NOT SKIP THIS STEP**

Navigate to: **GitHub Repo > Settings > Secrets and variables > Actions**

- [ ] Add `DOCKERHUB_USERNAME`
  - Value: Your Docker Hub username (e.g., `tnobu`)

- [ ] Add `DOCKERHUB_TOKEN`
  - Generate at: https://hub.docker.com/settings/security
  - Create new Access Token with Read & Write permissions
  - Copy immediately (won't show again!)

- [ ] Add `RENDER_BACKEND_WEBHOOK_URL`
  - Get from: Render > Backend Service > Deploy > Copy Webhook URL
  - Format: `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`

- [ ] Add `RENDER_FRONTEND_WEBHOOK_URL`
  - Get from: Render > Frontend Service > Deploy > Copy Webhook URL
  - Format: `https://api.render.com/deploy/srv-zzzzz?key=wwww`

**Verification**:
1. Go to Settings > Secrets and variables > Actions
2. Verify all 4 secrets are listed
3. Do NOT click on values to view (they're masked for security)

---

## Phase 5: Render.com Deployment ⚠️ MANUAL STEP

### Step 5.1: Create Backend Service

- [ ] Go to https://render.com/dashboard
- [ ] Click "New +" > "Web Service"
- [ ] Select "Deploy an existing image"
- [ ] Fill in:
  - [ ] Name: `todo-app-backend`
  - [ ] Image URL: `your-username/todo-app-backend:latest`
  - [ ] Region: US East (or closest to you)
  - [ ] Plan: Free
- [ ] Add Environment Variables:
  - [ ] `NODE_ENV` = `production`
  - [ ] `PORT` = `5000`
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (usually 2-3 minutes)
- [ ] Copy the service URL (e.g., `https://todo-app-backend-xxxx.onrender.com`)
- [ ] Note the Webhook URL from Deploy section

### Step 5.2: Create Frontend Service

- [ ] Go to https://render.com/dashboard
- [ ] Click "New +" > "Web Service"
- [ ] Select "Deploy an existing image"
- [ ] Fill in:
  - [ ] Name: `todo-app-frontend`
  - [ ] Image URL: `your-username/todo-app-frontend:latest`
  - [ ] Region: Same as backend
  - [ ] Plan: Free
- [ ] Add Environment Variables:
  - [ ] `REACT_APP_API_URL` = `https://todo-app-backend-xxxx.onrender.com`
    (Replace with your backend URL from Step 5.1)
- [ ] Click "Create Web Service"
- [ ] Wait for deployment
- [ ] Copy the service URL (e.g., `https://todo-app-frontend-yyyy.onrender.com`)
- [ ] Note the Webhook URL from Deploy section

**Verification**:
1. Both services show "Live" status
2. Backend URL responds to: `curl https://todo-app-backend-xxxx.onrender.com/`
3. Frontend URL loads in browser

---

## Phase 6: Webhook Configuration ⚠️ MANUAL STEP

- [ ] Get Backend Webhook URL:
  - Go to Render > Backend service > Deploy section
  - Copy the "Deploy Hook" URL
  - Format: `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`

- [ ] Get Frontend Webhook URL:
  - Go to Render > Frontend service > Deploy section
  - Copy the "Deploy Hook" URL
  - Format: `https://api.render.com/deploy/srv-zzzzz?key=wwww`

- [ ] Add to GitHub Secrets:
  - [ ] `RENDER_BACKEND_WEBHOOK_URL` = [backend webhook]
  - [ ] `RENDER_FRONTEND_WEBHOOK_URL` = [frontend webhook]

**Verification**:
```bash
# Test webhook manually
curl -X POST "your-backend-webhook-url" \
  -H "Content-Type: application/json" \
  -d '{"clearCache": true}'

# Should get response like: {"buildId":"xxxxx","status":"queued"}
```

---

## Phase 7: Test Workflow ✅

### Option A: Automatic Trigger

```bash
cd d:\DSO101

# Make a simple change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "Test GitHub Actions workflow"
git push origin main
```

### Option B: Manual Trigger

1. Go to **GitHub Repo > Actions**
2. Select **"CI/CD - Build, Push to Docker Hub, and Deploy to Render"**
3. Click **"Run workflow"**
4. Watch the progress

### Monitor Workflow

1. Go to **GitHub Repo > Actions**
2. Click on the latest workflow run
3. Watch all steps complete:
   - [ ] Checkout Repository ✓
   - [ ] Set up Docker Buildx ✓
   - [ ] Login to Docker Hub ✓
   - [ ] Build and Push Backend Image ✓
   - [ ] Build and Push Frontend Image ✓
   - [ ] Trigger Render Backend Deployment ✓
   - [ ] Trigger Render Frontend Deployment ✓
   - [ ] Workflow Summary ✓

**Expected Time**: 3-5 minutes

---

## Phase 8: Verify Deployment ✅

### Check Docker Hub

- [ ] Go to https://hub.docker.com
- [ ] Find repository: `your-username/todo-app-backend`
  - [ ] `latest` tag exists
  - [ ] Build number tag exists (e.g., `12`, `13`)
  - [ ] Image size is reasonable (~200MB for backend)

- [ ] Find repository: `your-username/todo-app-frontend`
  - [ ] `latest` tag exists
  - [ ] Build number tag exists
  - [ ] Image size is reasonable (~50MB for frontend on nginx)

### Check Render Services

- [ ] Go to https://render.com/dashboard
- [ ] **Backend Service**:
  - [ ] Status shows "Live" (green)
  - [ ] Last deployment was recent
  - [ ] Logs show "Container started successfully"

- [ ] **Frontend Service**:
  - [ ] Status shows "Live"
  - [ ] Last deployment was recent
  - [ ] Logs show nginx started

### Test Application

- [ ] Visit frontend URL: `https://todo-app-frontend-yyyy.onrender.com`
- [ ] Application loads without errors
- [ ] Can view todo list
- [ ] Can add a new todo
- [ ] Can edit a todo
- [ ] Can delete a todo
- [ ] API communication works (check browser console for errors)

---

## Phase 9: Documentation & Screenshots 📸

Create a `SCREENSHOTS.md` file with these screenshots:

### Required Screenshots

1. **GitHub Actions - Successful Workflow Run**
   - [ ] Screenshot: Actions > workflow run > all steps green/passed
   - [ ] Show timing and summary

2. **GitHub Secrets Configuration**
   - [ ] Screenshot: Settings > Secrets > all 4 secrets listed (values masked)

3. **Docker Hub - Pushed Images**
   - [ ] Screenshot: Hub.docker.com > your images with multiple tags
   - [ ] Show backend image with `latest` and build number tags
   - [ ] Show frontend image with `latest` and build number tags

4. **Render.com - Services Live**
   - [ ] Screenshot: Dashboard > both services with "Live" status
   - [ ] Show service URLs

5. **Render.com - Deployment Logs**
   - [ ] Screenshot: Backend service > Logs > successful deployment
   - [ ] Screenshot: Frontend service > Logs > successful deployment

6. **Application Running**
   - [ ] Screenshot: Browser > Frontend URL showing todo app loaded
   - [ ] Show todo list with some items

7. **Browser Network Tab (Optional)**
   - [ ] Screenshot: DevTools > Network > API calls to backend working
   - [ ] Show successful responses from backend API

---

## Phase 10: Final Report 📋

Create `Tshering_Norbu_02230309_A3/ASSIGNMENT_REPORT.md`:

Include:

- [ ] Overview of what was implemented
- [ ] Architecture diagram
- [ ] Step-by-step implementation guide
- [ ] Challenges faced and how they were solved
- [ ] Learning outcomes
- [ ] Screenshots (embedded)
- [ ] Links to:
  - [ ] GitHub Repository
  - [ ] Docker Hub Images (backend & frontend)
  - [ ] Render Services (backend & frontend)
  - [ ] GitHub Actions Workflow

---

## Phase 11: Git Commit & Push ✅

```bash
cd d:\DSO101

# Add all A3 files
git add Tshering_Norbu_02230309_A3/
git add .github/

# Commit
git commit -m "A3: Add GitHub Actions CI/CD with Docker and Render deployment"

# Push to GitHub
git push origin main
```

**Verify**:
1. Go to GitHub repo
2. Check that `Tshering_Norbu_02230309_A3/` folder exists
3. Check that `.github/workflows/deploy.yml` exists

---

## Final Verification Checklist

- [ ] GitHub repository is public
- [ ] All source files committed and pushed
- [ ] `.github/workflows/deploy.yml` exists
- [ ] All 4 GitHub Secrets configured
- [ ] Backend service deployed on Render and Live
- [ ] Frontend service deployed on Render and Live
- [ ] GitHub Actions workflow has run successfully at least once
- [ ] Docker Hub images have been pushed with tags
- [ ] Application is accessible and working
- [ ] Documentation complete with screenshots
- [ ] Everything committed and pushed to GitHub

---

## Submission Deliverables

Submit:

1. **GitHub Repository Link**
   - Link: https://github.com/T-nobu/DSO101
   - Verify public access

2. **Files in Repository**
   - [ ] `.github/workflows/deploy.yml`
   - [ ] `Tshering_Norbu_02230309_A3/README.md`
   - [ ] `Tshering_Norbu_02230309_A3/QUICKSTART.md`
   - [ ] `Tshering_Norbu_02230309_A3/docker-compose.yml`
   - [ ] `Tshering_Norbu_02230309_A3/ASSIGNMENT_REPORT.md`

3. **Screenshots**
   - [ ] GitHub Actions workflow (successful run)
   - [ ] GitHub Secrets configured
   - [ ] Docker Hub images pushed
   - [ ] Render services live
   - [ ] Application working

4. **Report Contents**
   - [ ] Steps taken
   - [ ] Challenges faced & solutions
   - [ ] Learning outcomes
   - [ ] Links to all services
   - [ ] Screenshots embedded

---

**Estimated Completion Time**: 1-2 hours

**Difficulty Level**: Medium (requires manual configuration of secrets and Render services)

**Outcome**: Fully automated CI/CD pipeline with zero-downtime deployments!
