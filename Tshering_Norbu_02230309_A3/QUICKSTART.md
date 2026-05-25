# GitHub Actions CI/CD Setup - Quick Start Guide

## 5-Minute Setup

### Step 1: Add GitHub Secrets (2 min)

Go to **GitHub Repo > Settings > Secrets and variables > Actions**

Add these 4 secrets:

```
DOCKERHUB_USERNAME = your-dockerhub-username
DOCKERHUB_TOKEN = (from https://hub.docker.com/settings/security)
RENDER_BACKEND_WEBHOOK_URL = (from Render > Backend service > Deploy > Webhook)
RENDER_FRONTEND_WEBHOOK_URL = (from Render > Frontend service > Deploy > Webhook)
```

### Step 2: Deploy on Render (2 min)

For **Backend** service:
- Go to https://render.com
- Create Web Service > Deploy existing image
- Image: `your-username/todo-app-backend:latest`
- Port: 5000
- Environment: `NODE_ENV=production`

For **Frontend** service:
- Create Web Service > Deploy existing image
- Image: `your-username/todo-app-frontend:latest`
- Port: 80
- Environment: `REACT_APP_API_URL=https://your-backend-url.onrender.com`

### Step 3: Test Workflow (1 min)

```bash
# Make a small change and push
git add .
git commit -m "Test CI/CD"
git push origin main

# Watch it run: GitHub > Actions
```

---

## How It Works

```
PUSH TO MAIN
     ↓
GITHUB ACTIONS STARTS
     ↓
BUILD BACKEND & FRONTEND IMAGES
     ↓
PUSH TO DOCKER HUB
     ↓
TRIGGER RENDER WEBHOOKS
     ↓
RENDER PULLS NEW IMAGES & DEPLOYS
     ↓
APP LIVE AT YOUR RENDER URLS!
```

---

## Troubleshooting

### "Secrets not found"
→ Make sure secret names match exactly (check for typos)

### "Docker push failed"
→ Verify DOCKERHUB_TOKEN is valid (generate new one if needed)

### "Render not deploying"
→ Check webhook URL includes full URL with ?key= parameter

### "Frontend API errors"
→ Update REACT_APP_API_URL in Render to match backend URL

---

## Files Created

```
.github/workflows/deploy.yml ← Workflow automation
Tshering_Norbu_02230309_A3/README.md ← Full documentation
Tshering_Norbu_02230309_A3/QUICKSTART.md ← This file
```

---

## Next Steps

1. ✅ Follow 5-minute setup above
2. ✅ Test by pushing code to main
3. ✅ Monitor workflow in GitHub Actions
4. ✅ Verify deployment on Render
5. ✅ Take screenshots for assignment submission

**Your CI/CD pipeline is now live!** 🚀
