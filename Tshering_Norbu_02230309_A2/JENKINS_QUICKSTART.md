# Jenkins Pipeline - Quick Start Guide

## 5-Minute Setup

### Step 1: Install Jenkins (5 minutes)
```bash
# Windows: Download from jenkins.io/download → run .msi installer
# Mac: brew install jenkins
# Linux: sudo apt-get install jenkins

# Then access: http://localhost:8080
```

### Step 2: Install Plugins (3 minutes)
1. **Manage Jenkins** → **Manage Plugins**
2. Search and install:
   - NodeJS Plugin
   - Pipeline
   - GitHub Integration
   - Docker Pipeline
   - HTML Publisher
3. Restart Jenkins

### Step 3: Configure Node.js (2 minutes)
1. **Manage Jenkins** → **Tools** → **NodeJS**
2. Add NodeJS: Name = "NodeJS", Version = "20.x LTS"
3. Save

### Step 4: Add GitHub Credentials (2 minutes)
1. Go to GitHub → **Settings** → **Developer Settings** → **Personal Access Tokens**
2. Generate token with `repo` and `admin:repo_hook` scopes
3. In Jenkins: **Manage Credentials** → **Add Credentials**
4. Enter:
   - Username: Your GitHub username
   - Password: GitHub PAT token
   - ID: `github-credentials`

### Step 5: Create Pipeline Job (3 minutes)
1. Jenkins Dashboard → **New Item**
2. Name: `todo-app-pipeline`
3. Select: **Pipeline**
4. Under Pipeline section:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/yourusername/assignment1-node-app.git`
   - Credentials: Select `github-credentials`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
5. Save

### Step 6: Run Pipeline (1 minute)
1. Select job → **Build Now**
2. View progress in **Console Output**
3. Check **Test Results** when complete

## Expected Results

✅ **Backend Tests**: 12 passing  
✅ **Frontend Tests**: 2 passing  
✅ **Build Status**: SUCCESS  
✅ **Docker Images**: Built and ready  

## Troubleshooting

| Issue | Solution |
|-------|----------|
| NodeJS not found | Restart Jenkins, verify Tools configuration |
| GitHub connection fails | Check PAT token, verify repository URL |
| Tests fail | Run `npm test` locally to verify |
| Docker issues | Ensure Docker daemon is running |

## Next Steps

1. **Push code to GitHub** with Jenkinsfile
2. **Trigger build** manually or via webhook
3. **Monitor console** for logs
4. **Review test results** in Jenkins
5. **Push Docker images** to Docker Hub

## Useful Links

- Jenkins Dashboard: http://localhost:8080
- Pipeline Documentation: https://jenkins.io/doc/book/pipeline/
- Jest Tests: https://jestjs.io/

---

**For detailed setup instructions, see [JENKINS_SETUP.md](JENKINS_SETUP.md)**
