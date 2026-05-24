# Jenkins Pipeline Setup for Node.js To-Do Application

## Overview

This document provides a complete guide to setting up a Jenkins CI/CD pipeline for automating the build, test, and deployment of the Node.js To-Do application (Assignment 2). The pipeline includes code checkout, dependency installation, unit testing, Docker containerization, and deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Jenkins Installation](#jenkins-installation)
3. [Plugin Installation](#plugin-installation)
4. [Node.js Configuration](#nodejs-configuration)
5. [GitHub Setup](#github-setup)
6. [Jenkins Credentials Setup](#jenkins-credentials-setup)
7. [Pipeline Configuration](#pipeline-configuration)
8. [Running the Pipeline](#running-the-pipeline)
9. [Troubleshooting](#troubleshooting)
10. [Project Structure](#project-structure)

---

## Prerequisites

Before setting up the Jenkins pipeline, ensure you have:

- **Java JDK 11 or higher** installed
- **Docker** installed and running (optional, for containerization)
- **Git** installed
- **GitHub account** with your project repository
- **Docker Hub account** (optional, for image hosting)
- **Node.js LTS** (v20.x or later)

---

## Jenkins Installation

### Windows/Mac/Linux

1. **Download Jenkins** from [jenkins.io](https://jenkins.io/download)
   - Choose the appropriate installer for your OS
   - Windows: Download `.msi` installer
   - Mac: Use Homebrew: `brew install jenkins`
   - Linux: Follow distro-specific instructions

2. **Install Jenkins**
   ```bash
   # Windows - run the .msi installer
   
   # Mac
   brew install jenkins
   
   # Linux (Ubuntu/Debian)
   sudo apt-get install jenkins
   ```

3. **Start Jenkins**
   - Jenkins will run on `http://localhost:8080` by default
   - Access it through your web browser

4. **Initial Setup**
   - Jenkins will prompt you to unlock and configure during first startup
   - Retrieve the initial admin password from:
     - **Windows/Mac**: Check console output or `~/.jenkins/secrets/initialAdminPassword`
     - **Linux**: `/var/lib/jenkins/secrets/initialAdminPassword`

---

## Plugin Installation

### Install Required Plugins

1. Go to **Manage Jenkins** > **Manage Plugins** (or **Plugin Manager**)
2. Click the **Available plugins** tab
3. Search for and install the following plugins:

#### Essential Plugins

| Plugin | Version | Purpose |
|--------|---------|---------|
| **NodeJS Plugin** | Latest | Enables Node.js tool configuration |
| **Pipeline** | Latest | Supports declarative and scripted pipelines |
| **GitHub Integration** | Latest | GitHub webhook integration |
| **Docker Pipeline** | Latest | Docker support in pipelines |
| **JUnit Plugin** | Latest | Test result reporting |
| **HTML Publisher** | Latest | Publishes HTML reports (coverage) |

#### Installation Steps

- Search for "NodeJS" → Install
- Search for "Pipeline" → Install
- Search for "GitHub Integration" → Install
- Search for "Docker Pipeline" → Install
- Search for "HTML Publisher" → Install
- Click **Install without restart** or **Download now and install after restart**

---

## Node.js Configuration

### Configure Node.js in Jenkins

1. Go to **Manage Jenkins** > **Tools** (or **Global Tool Configuration**)
2. Scroll down to **NodeJS** section
3. Click **Add NodeJS**
4. Configure as follows:
   ```
   Name: NodeJS
   Version: 20.x LTS (or latest)
   Install automatically: ✓ (checked)
   ```
5. Click **Save**

---

## GitHub Setup

### 1. Prepare Your Repository

Ensure your repository structure matches this layout:

```
repository-root/
├── Jenkinsfile
├── backend/
│   ├── package.json
│   ├── jest.config.js
│   ├── __tests__/
│   │   └── server.test.js
│   ├── server.js
│   └── Dockerfile
├── frontend/
│   ├── package.json
│   ├── jest.config.js
│   ├── src/
│   │   ├── App.test.js
│   │   └── ...
│   └── Dockerfile
└── README.md
```

### 2. Push Jenkinsfile to Repository

The `Jenkinsfile` is included in this repository at the root level. Ensure it's committed to your GitHub repository's main branch.

### 3. Generate GitHub Personal Access Token (PAT)

1. Log in to GitHub
2. Go to **Settings** > **Developer Settings** > **Personal Access Tokens** > **Tokens (classic)**
3. Click **Generate new token (classic)**
4. Configure token:
   - **Token name**: `jenkins-token`
   - **Expiration**: 90 days or No expiration
   - **Scopes**: Select:
     - ✓ `repo` (Full control of private repositories)
     - ✓ `admin:repo_hook` (Access to hooks)
     - ✓ `admin:org_hook` (Organization hooks)
5. Click **Generate token**
6. **Copy and save** the token (you won't see it again!)

---

## Jenkins Credentials Setup

### Add GitHub Credentials

1. Go to **Manage Jenkins** > **Manage Credentials**
2. Click **Jenkins** (under Stores scoped to Jenkins)
3. Click **Global credentials (unrestricted)**
4. Click **Add Credentials**
5. Configure:
   ```
   Kind: Username with password
   Username: <your-github-username>
   Password: <your-github-PAT>
   ID: github-credentials
   Description: GitHub Personal Access Token
   ```
6. Click **Create**

### Add Docker Hub Credentials (Optional)

If deploying to Docker Hub:

1. Go to **Manage Jenkins** > **Manage Credentials**
2. Click **Add Credentials**
3. Configure:
   ```
   Kind: Username with password
   Username: <your-docker-hub-username>
   Password: <your-docker-hub-access-token>
   ID: docker-hub-creds
   Description: Docker Hub Credentials
   ```
4. Click **Create**

---

## Pipeline Configuration

### Create a New Pipeline Job

1. Go to Jenkins Dashboard
2. Click **+ New Item** (or **Create a job**)
3. Enter **Job name**: `todo-app-pipeline`
4. Select **Pipeline** and click **OK**

### Configure Pipeline Settings

1. Under **Pipeline** section, select:
   ```
   Definition: Pipeline script from SCM
   SCM: Git
   ```

2. Configure Git settings:
   ```
   Repository URL: https://github.com/yourusername/assignment1-node-app.git
   Credentials: Select "github-credentials" (created above)
   Branch Specifier: */main
   Script Path: Jenkinsfile
   ```

3. Click **Save**

### Pipeline Stages Explained

The Jenkinsfile includes the following stages:

#### **Stage 1: Checkout**
- Clones the GitHub repository
- Checks out the main branch

#### **Stage 2: Backend - Install Dependencies**
- Runs `npm install` in the backend directory
- Installs all required Node.js packages

#### **Stage 3: Backend - Run Tests**
- Executes `npm test` with Jest
- Generates code coverage reports
- Publishes JUnit test results

#### **Stage 4: Frontend - Install Dependencies**
- Runs `npm install` in the frontend directory
- Installs all React dependencies

#### **Stage 5: Frontend - Run Tests**
- Runs React tests with Jest
- Generates code coverage reports
- Publishes test results

#### **Stage 6: Backend - Build**
- Prepares backend for deployment

#### **Stage 7: Frontend - Build**
- Builds React application with `npm run build`
- Creates optimized production build

#### **Stage 8: Deploy - Build Docker Images** (main branch only)
- Builds Docker images for backend and frontend
- Tags with latest and build number

#### **Stage 9: Deploy - Push to Docker Hub** (main branch only)
- Pushes Docker images to Docker Hub
- Requires Docker Hub credentials

---

## Running the Pipeline

### Method 1: Manual Trigger

1. Go to Jenkins Dashboard
2. Select your pipeline job: `todo-app-pipeline`
3. Click **Build Now**
4. Monitor progress in **Build History** > **Console Output**

### Method 2: GitHub Webhook (Automatic)

Set up automatic builds on code push:

1. In Jenkins, go to your pipeline job
2. Enable **GitHub hook trigger for GITScm polling**
3. In GitHub repository:
   - Go to **Settings** > **Webhooks**
   - Click **Add webhook**
   - **Payload URL**: `http://your-jenkins-url:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Select "Push events"
   - Click **Add webhook**

Now every push to main branch will trigger the pipeline automatically.

### Monitor Pipeline Execution

1. View **Console Output**: Real-time build logs
2. Check **Test Results**: View failed/passed tests
3. Review **Coverage Reports**: HTML coverage reports for frontend/backend

---

## Jenkinsfile Configuration Details

### Environment Variables

Update in the Jenkinsfile:

```groovy
environment {
    DOCKER_HUB_USERNAME = credentials('docker-hub-username')
    DOCKER_HUB_TOKEN = credentials('docker-hub-token')
    GITHUB_TOKEN = credentials('github-pat')
}
```

### Docker Build & Push

Replace `yourusername` with your Docker Hub username in the Jenkinsfile:

```groovy
docker.build('yourusername/node-app-backend:latest')
docker.build('yourusername/node-app-frontend:latest')
```

---

## Package.json Configuration

### Backend (`backend/package.json`)

The backend includes Jest and jest-junit:

```json
{
  "scripts": {
    "start": "node server.js",
    "test": "jest --ci --coverage --reporters=default --reporters=jest-junit"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "jest-junit": "^16.0.0",
    "supertest": "^6.3.3"
  }
}
```

### Frontend (`frontend/package.json`)

The frontend also includes Jest configuration:

```json
{
  "scripts": {
    "build": "react-scripts build",
    "test": "react-scripts test --ci --coverage --reporters=default --reporters=jest-junit --watchAll=false"
  }
}
```

---

## Testing Locally

Before pushing to Jenkins, test locally:

### Backend Tests

```bash
cd backend
npm install
npm test
```

### Frontend Tests

```bash
cd frontend
npm install
npm test
```

---

## Expected Pipeline Output

### Successful Build

```
✓ Checkout successful
✓ Backend dependencies installed
✓ Backend tests passed (12/12)
✓ Frontend dependencies installed
✓ Frontend tests passed (2/2)
✓ Backend build completed
✓ Frontend build completed
✓ Docker images built
✓ Docker images pushed to Docker Hub
```

### Test Results

- Backend: 12 tests passing
- Frontend: 2 tests passing
- Code coverage: Both >50%

---

## Troubleshooting

### Common Issues and Solutions

#### 1. **NodeJS Plugin Not Detected**

**Problem**: Jenkins doesn't find Node.js tools
**Solution**:
- Go to **Manage Jenkins** > **Tools**
- Verify NodeJS is configured
- Restart Jenkins: `sudo systemctl restart jenkins`

#### 2. **Test Fails Locally but Passes in Jenkins**

**Problem**: Environment differences
**Solution**:
- Ensure `.env` files are properly configured
- Check Node version matches Jenkins configuration
- Verify database exists for backend tests

#### 3. **Docker Build Fails**

**Problem**: Docker daemon not running
**Solution**:
```bash
# Start Docker
docker daemon    # Linux/Mac
# or restart Docker Desktop

# Verify Docker is running
docker ps
```

#### 4. **GitHub Webhook Not Triggering**

**Problem**: Webhook not firing on push
**Solution**:
- Verify webhook URL is correct: `http://jenkins-url:8080/github-webhook/`
- Check GitHub webhook delivery in **Settings** > **Webhooks** > **Recent Deliveries**
- Ensure Jenkins is accessible from GitHub (public URL, not localhost)

#### 5. **Tests Timeout**

**Problem**: Tests taking too long
**Solution**:
- Increase timeout in jest.config.js: `testTimeout: 10000`
- Check for hanging processes or infinite loops
- Run tests locally to verify timing

#### 6. **Docker Hub Push Fails**

**Problem**: Authentication or network issues
**Solution**:
- Verify Docker credentials in Jenkins
- Ensure Docker Hub is accessible
- Check docker command: `docker login -u username`

---

## Docker Hub Deployment

### Push Images to Docker Hub

Once pipeline completes successfully:

```bash
# View local images
docker images | grep node-app

# Tag image (if not done by pipeline)
docker tag local-image:latest yourusername/node-app:latest

# Push to Docker Hub
docker push yourusername/node-app:latest
```

### Docker Hub Links

- Backend Image: `https://hub.docker.com/r/yourusername/node-app-backend`
- Frontend Image: `https://hub.docker.com/r/yourusername/node-app-frontend`

---

## Deliverables Checklist

- [x] Jenkinsfile created in repository root
- [x] Jest configuration in backend and frontend
- [x] Test files created with unit tests
- [x] Package.json updated with test scripts
- [x] GitHub credentials configured in Jenkins
- [x] Pipeline job created and configured
- [x] Docker credentials configured (optional)
- [ ] Pipeline executed successfully (Screenshot needed)
- [ ] Test results captured (Screenshot needed)
- [ ] Docker Hub images pushed (Link needed)
- [ ] README.md updated with pipeline documentation
- [ ] GitHub repository link provided

---

## Quick Reference Commands

```bash
# Build backend
cd backend && npm install && npm test

# Build frontend
cd frontend && npm install && npm test

# Build Docker images locally
docker build -t yourusername/node-app-backend:latest ./backend
docker build -t yourusername/node-app-frontend:latest ./frontend

# Push to Docker Hub
docker push yourusername/node-app-backend:latest
docker push yourusername/node-app-frontend:latest

# View Jenkins logs
tail -f /var/log/jenkins/jenkins.log    # Linux/Mac
type C:\Jenkins\jenkins.log             # Windows
```

---

## Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Jest Testing Framework](https://jestjs.io/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Alternative](https://github.com/features/actions)

---

**Last Updated**: May 2026  
**Assignment**: DSO101 - Jenkins Pipeline Setup  
**Author**: Tshering Norbu
