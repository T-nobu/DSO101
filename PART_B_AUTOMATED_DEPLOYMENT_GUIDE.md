# Part B: Automated Image Build and Deployment
## Step-by-Step Guide for GitHub + Render Blueprint Deployment

---

## Overview
This guide will help you set up **Render Blueprint deployment** which automatically:
- ✅ Builds new Docker images when you push to GitHub
- ✅ Deploys both frontend and backend services
- ✅ Uses the multi-service orchestration via `render.yaml`

---

## Prerequisites
- [ ] GitHub account with your code repository
- [ ] Render account (https://render.com)
- [ ] Your code pushed to GitHub
- [ ] Correct `render.yaml` file in your repository root
- [ ] Both frontend and backend Dockerfiles configured
- [ ] `.env.production` files set up (NOT in Git, but needed in Render)

---

## Step 1: Prepare Your GitHub Repository

### 1.1 Ensure Your Code is on GitHub
```bash
# Navigate to your project root
cd d:\DSO101\Tshering_Norbu_02230309_A1

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit with Docker setup and render.yaml"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 1.2 Verify Your Repository Structure
Your GitHub repo should have:
```
/your-repo/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── .dockerignore
│   └── .env.production (add to .gitignore)
├── frontend/
│   ├── Dockerfile
│   ├── .env.production
│   ├── package.json
│   ├── public/
│   └── src/
├── render.yaml
├── README.md
└── .gitignore
```

### 1.3 Create/Update `.gitignore`
Make sure your `.gitignore` file excludes sensitive files:
```bash
# In your repo root, create or update .gitignore
node_modules/
.env
.env.local
.DS_Store
build/
dist/
*.sqlite
*.db
```

---

## Step 2: Verify Your `render.yaml` File

Your `render.yaml` should look like this. Check if it exists in your repo root:

**Location**: `/render.yaml` (at repository root)

**Content**:
```yaml
services:
  # Backend API Service
  - type: web
    name: be-todo
    runtime: docker
    dockerfilePath: ./backend/Dockerfile
    healthCheckPath: /health
    envVars:
      - key: PORT
        value: 5000
      - key: NODE_ENV
        value: production
      - key: DATABASE_PATH
        value: /app/data/database.sqlite
      - key: DOCKER_ENV
        value: true

  # Frontend Web Service  
  - type: web
    runtime: docker
    name: fe-todo
    dockerfilePath: ./frontend/Dockerfile
```

**If file doesn't exist**, create it now.

---

## Step 3: Update Backend `.env.production`

**Location**: `/backend/.env.production`

Add these variables (will be used in Render):
```
PORT=5000
NODE_ENV=production
DATABASE_PATH=/app/data/database.sqlite
DOCKER_ENV=true
```

---

## Step 4: Update Frontend `.env.production`

**Location**: `/frontend/.env.production`

```
REACT_APP_API_URL=https://be-todo.onrender.com
```

**Note**: This URL will be automatically replaced by Render with the actual backend service URL.

---

## Step 5: Connect GitHub to Render Dashboard

### 5.1 Go to Render Dashboard
- Visit https://dashboard.render.com
- Log in to your Render account

### 5.2 Create New Blueprint
1. Click **"New +"** button (top-left)
2. Select **"Blueprint"**

### 5.3 Connect GitHub Repository
1. Choose **"GitHub"** as the repository source
2. Click **"Connect GitHub"** (if not already connected)
3. Authorize Render to access your GitHub account
4. Select your repository from the list
5. Choose **main** branch (or your deployment branch)
6. Click **"Next"**

---

## Step 6: Configure Blueprint Settings

### 6.1 Review Services
Render will automatically read your `render.yaml` and display:
- [ ] Backend service (be-todo)
- [ ] Frontend service (fe-todo)

Both should be listed with Docker runtime.

### 6.2 Set Environment Variables in Render Dashboard

**For Backend Service (be-todo)**:
```
PORT=5000
NODE_ENV=production
DATABASE_PATH=/app/data/database.sqlite
DOCKER_ENV=true
```

**For Frontend Service (fe-todo)**:
```
REACT_APP_API_URL=https://be-todo.onrender.com
```

### 6.3 Review Configuration
- [ ] Both services are set to Docker runtime
- [ ] Correct Dockerfile paths
- [ ] Environment variables are set
- [ ] Region is selected

### 6.4 Deploy
Click **"Deploy Blueprint"** to start the deployment.

---

## Step 7: Monitor Deployment

### 7.1 Watch the Build Progress
1. Both services will start building
2. Backend builds first (usually 2-5 minutes)
3. Frontend builds next (usually 2-5 minutes)
4. Check logs for errors

### 7.2 Build Logs
- Backend: Look for "Server running on port 5000"
- Frontend: Look for "nginx started"

### 7.3 Verify Services Are Running
- Backend URL: `https://be-todo.onrender.com/health`
- Frontend URL: `https://fe-todo.onrender.com`

---

## Step 8: Test Automated Deployment

### 8.1 Make a Change Locally
```bash
# Edit a file (e.g., backend/server.js)
# Add a comment or change something

# Stage and commit
git add .
git commit -m "Test automatic deployment"

# Push to GitHub
git push origin main
```

### 8.2 Render Webhook Trigger
- Render automatically detects the new commit
- Checks out your latest code
- Rebuilds Docker images
- Redeploys services

### 8.3 Monitor the New Deployment
1. Go to Render Dashboard
2. Click on your **Blueprint**
3. Watch the deployment progress
4. Services should update automatically

---

## Step 9: Verify Everything Works

### 9.1 Test Backend
```bash
# Open browser or use curl
curl https://be-todo.onrender.com/health

# Expected response:
# {"status":"OK","database":"SQLite"}
```

### 9.2 Test Frontend
- Open: `https://fe-todo.onrender.com`
- Verify the React app loads
- Try adding a task
- Verify it saves to the backend

### 9.3 Check Logs
In Render Dashboard:
- Click each service
- Check **Logs** tab for any errors
- Backend logs should show successful task operations

---

## Step 10: CI/CD Pipeline Summary

Your automated deployment workflow:

```
1. You edit code locally
        ↓
2. git commit + git push to GitHub
        ↓
3. GitHub webhook sends notification to Render
        ↓
4. Render clones your latest code
        ↓
5. Docker builds backend image (from ./backend/Dockerfile)
        ↓
6. Docker builds frontend image (from ./frontend/Dockerfile)
        ↓
7. Services deploy automatically
        ↓
8. Your app is live with new changes
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Services not deploying | Check render.yaml syntax (YAML is strict with indentation) |
| Backend not starting | Check environment variables in Render dashboard |
| Frontend can't reach backend | Verify REACT_APP_API_URL matches actual backend service name |
| GitHub not triggering builds | Verify webhook is set (usually automatic, check Render settings) |
| Build fails | Check Docker build logs in Render dashboard |

---

## Important Notes

- **Automatic Deployments**: Every `git push` to your main branch triggers a rebuild
- **Environment Variables**: Set these in Render dashboard, NOT in .env files in Git
- **Docker Build Time**: First build takes 3-5 minutes, subsequent builds are faster (cached layers)
- **Costs**: Monitor your Render usage (free tier has limitations)
- **Database Persistence**: SQLite data is stored in `/app/data/database.sqlite` inside the container

---

## Optional: Set Up Automatic Redeploys

If you want Render to rebuild on a schedule:

1. Go to your Backend service
2. **Settings** → **Auto-Deploy**
3. Choose **"Redeploy at regular intervals"**
4. Select frequency (optional)

---

## Success Checklist

- [ ] GitHub repo created with all code
- [ ] `render.yaml` in repository root
- [ ] Backend Dockerfile with build-base dependencies
- [ ] Frontend Dockerfile with REACT_APP_API_URL set
- [ ] `.dockerignore` in both frontend and backend
- [ ] GitHub connected to Render
- [ ] Blueprint deployed successfully
- [ ] Both services running and healthy
- [ ] Frontend can communicate with backend
- [ ] Test commit triggers automatic rebuild

---

## Next Steps

1. **Monitor Performance**: Watch Render dashboard for errors
2. **Set Up Alerts**: Configure email notifications for deployment failures
3. **Scale if Needed**: Upgrade to paid tier if free tier limitations apply
4. **Document Changes**: Keep commit messages clear for deployment tracking

