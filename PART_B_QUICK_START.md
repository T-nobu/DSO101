# Part B: Quick Start Checklist

## Before Starting
- [ ] You have a GitHub account
- [ ] You have a Render account (https://render.com)
- [ ] Your code is ready to push to GitHub

## Step-by-Step Quick Start

### 1. Push Code to GitHub
```powershell
# Navigate to your project
cd d:\DSO101\Tshering_Norbu_02230309_A1

# Initialize Git
git init
git add .
git commit -m "Initial commit with Dockerfiles and render.yaml"

# Add GitHub remote (replace with YOUR repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2. Go to Render Dashboard
- Visit: https://dashboard.render.com
- Log in with your Render account

### 3. Create Blueprint
1. Click **"New +"** button
2. Select **"Blueprint"**

### 4. Connect GitHub
1. Click **"Connect GitHub"**
2. Authorize Render to access your GitHub
3. Select your repository
4. Select **main** branch
5. Click **"Next"**

### 5. Review Configuration
Render should automatically detect:
- **Backend service**: `be-todo` (Docker)
- **Frontend service**: `fe-todo` (Docker)

Verify both services appear in the Blueprint.

### 6. Deploy
Click **"Deploy Blueprint"**

### 7. Wait for Build
- Backend builds first (2-5 minutes)
- Frontend builds next (2-5 minutes)
- Check logs for "Build successful" message

### 8. Verify Deployment
- Backend health check: `https://be-todo.onrender.com/health`
- Frontend app: `https://fe-todo.onrender.com`

### 9. Test Automated Updates
```powershell
# Make a small change to your code
# For example, edit backend/server.js or frontend/src/App.js

# Commit and push
git add .
git commit -m "Test automatic deployment"
git push origin main

# Watch the Render Dashboard - it should automatically rebuild!
```

---

## Your Service URLs After Deployment

- **Frontend**: https://fe-todo.onrender.com
- **Backend API**: https://be-todo.onrender.com
- **Backend Health**: https://be-todo.onrender.com/health
- **Get All Tasks**: https://be-todo.onrender.com/api/tasks

---

## Environment Variables Set in Render

**Backend (be-todo)**:
```
PORT=5000
NODE_ENV=production
DATABASE_PATH=/app/data/database.sqlite
DOCKER_ENV=true
```

**Frontend (fe-todo)**:
```
REACT_APP_API_URL=https://be-todo.onrender.com
```

---

## File Structure Your Repo Should Have

```
repository-root/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── server.js
│   ├── .env (NOT committed)
│   └── .env.production (NOT committed)
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── .env.production (NOT committed)
│   └── node_modules/ (NOT committed)
├── render.yaml (IMPORTANT!)
├── .gitignore
├── README.md
└── DOCKER_PUSHES.md
```

---

## Troubleshooting Commands

### If Build Fails
1. Check Render Dashboard logs
2. Verify render.yaml syntax (YAML spacing matters!)
3. Check Dockerfile paths are correct
4. Verify .dockerignore exists

### If Services Won't Start
1. Check health endpoint: `https://be-todo.onrender.com/health`
2. View logs in Render Dashboard
3. Check environment variables are set correctly

### If Frontend Can't Reach Backend
1. Verify `REACT_APP_API_URL` is set in frontend environment
2. Check backend service is running
3. Test backend directly: `curl https://be-todo.onrender.com/health`

---

## Important: Future Updates

**Every time you want to update your app:**

```powershell
# 1. Make changes locally
# 2. Test locally (optional)
# 3. Commit and push

git add .
git commit -m "Feature: Add new task functionality"
git push origin main

# 4. Render automatically detects and redeploys!
# 5. Monitor in Render Dashboard
```

That's it! No manual deployments needed after Blueprint setup.

---

## Success Indicators

✅ Both services deployed successfully  
✅ Backend returns 200 on health check  
✅ Frontend app loads without errors  
✅ Frontend can fetch tasks from backend  
✅ Git push triggers automatic rebuild  

**Congratulations! You have automated CI/CD with Render! 🎉**
