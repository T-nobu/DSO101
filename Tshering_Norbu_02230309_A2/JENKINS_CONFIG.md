# Jenkins Pipeline Configuration Examples

## Jenkinsfile Parameters

### Update These Values

Replace the following placeholders in the `Jenkinsfile`:

#### 1. GitHub Repository URL
```groovy
userRemoteConfigs: [[
    url: 'https://github.com/yourusername/assignment1-node-app.git',
    credentialsId: 'github-credentials'
]]
```
**Change**: `yourusername` to your actual GitHub username

#### 2. Docker Hub Username
```groovy
docker.build('yourusername/node-app-backend:latest')
docker.build('yourusername/node-app-frontend:latest')
```
**Change**: `yourusername` to your Docker Hub username

#### 3. Credentials IDs
```groovy
environment {
    DOCKER_HUB_USERNAME = credentials('docker-hub-username')
    DOCKER_HUB_TOKEN = credentials('docker-hub-token')
    GITHUB_TOKEN = credentials('github-pat')
}
```

These must match credentials created in Jenkins:
- `docker-hub-username`
- `docker-hub-token`
- `github-pat`

---

## Docker Hub Setup

### 1. Create Docker Hub Account
- Visit https://hub.docker.com
- Sign up or sign in
- Create repositories:
  - `node-app-backend`
  - `node-app-frontend`

### 2. Generate Access Token
1. Docker Hub → **Account Settings** → **Security** → **Access Tokens**
2. Click **Generate new token**
3. Token name: `jenkins-token`
4. Copy token (you won't see it again!)

### 3. Jenkins Configuration
1. **Manage Jenkins** → **Manage Credentials**
2. **Add Credentials** for Docker Hub:
   ```
   Kind: Username with password
   Username: <docker-hub-username>
   Password: <access-token>
   ID: docker-hub-token
   ```

---

## Environment File Configuration

### Backend `.env` File

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DOCKER_ENV=false
```

Create `backend/.env.production`:
```env
PORT=5000
NODE_ENV=production
DOCKER_ENV=true
```

### Frontend `.env` File

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

Create `frontend/.env.production`:
```env
REACT_APP_API_URL=https://your-production-api.com
REACT_APP_ENV=production
```

---

## Jenkins System Configuration

### Java Memory Settings

If pipeline runs slow, increase Jenkins memory:

**Linux/Mac**:
```bash
export JAVA_OPTS="-Xmx2g -Xms1g"
```

**Windows** (system environment variable):
```
JAVA_OPTS = -Xmx2g -Xms1g
```

### Executor Settings

1. **Manage Jenkins** → **Configure System**
2. Set **# of executors**: 2-4 (based on CPU cores)
3. Save

---

## Example Docker Build Commands

### Manual Docker Build

If you need to build images outside Jenkins:

```bash
# Backend
cd backend
docker build -t yourusername/node-app-backend:latest -t yourusername/node-app-backend:v1.0 .
docker push yourusername/node-app-backend:latest
docker push yourusername/node-app-backend:v1.0

# Frontend
cd frontend
docker build -t yourusername/node-app-frontend:latest -t yourusername/node-app-frontend:v1.0 .
docker push yourusername/node-app-frontend:latest
docker push yourusername/node-app-frontend:v1.0
```

---

## Slack Integration (Optional)

### Configure Slack Notifications

1. Install **Slack Notification Plugin** in Jenkins
2. Create Slack webhook at https://api.slack.com/apps
3. In Jenkinsfile, add post action:

```groovy
post {
    success {
        slackSend(
            color: 'good',
            message: 'Pipeline SUCCESS'
        )
    }
    failure {
        slackSend(
            color: 'danger',
            message: 'Pipeline FAILED'
        )
    }
}
```

---

## Email Notifications (Optional)

### Configure Email

1. **Manage Jenkins** → **Configure System** → **Email Notification**
2. Configure SMTP server
3. Test email configuration
4. Add to Jenkinsfile:

```groovy
post {
    always {
        emailext(
            subject: 'Pipeline ${BUILD_STATUS}',
            body: 'Build log: ${BUILD_LOG}',
            to: 'your-email@example.com'
        )
    }
}
```

---

## Performance Tuning

### Optimize Jenkins Pipeline

1. **Parallel Execution**: Run independent stages in parallel
   ```groovy
   parallel {
       stage('Backend Tests') { steps { sh 'npm test' } }
       stage('Frontend Tests') { steps { sh 'npm test' } }
   }
   ```

2. **Cache Dependencies**: Use workspace to avoid re-downloading
   ```groovy
   sh 'npm ci --prefer-offline'  # Faster than npm install
   ```

3. **Limit Build History**: Prevent disk space issues
   - Job → **Configure** → **Build Discarder**
   - Keep last 30 days or 50 builds

---

## Security Best Practices

1. **Never hardcode credentials** in Jenkinsfile
2. **Use Jenkins credentials** for all secrets
3. **Restrict pipeline job permissions** to relevant users
4. **Enable SSL/HTTPS** for Jenkins access
5. **Use API tokens** instead of passwords where possible
6. **Rotate credentials** regularly

---

## Monitoring & Logs

### View Jenkins Logs

**Linux/Mac**:
```bash
sudo journalctl -u jenkins -f
# or
tail -f /var/log/jenkins/jenkins.log
```

**Windows**:
```powershell
Get-Content "C:\Program Files\Jenkins\jenkins.log" -Tail 50 -Wait
```

### Monitor Pipeline Execution

1. Jenkins Dashboard → Select job
2. Click build number
3. **Console Output** → Real-time logs
4. **Artifacts** → Generated files
5. **Test Results** → Detailed test info

---

## Advanced Features

### Using Parameters

```groovy
pipeline {
    parameters {
        string(name: 'ENVIRONMENT', defaultValue: 'dev', description: 'Environment to deploy')
        choice(name: 'ACTION', choices: ['build', 'deploy'], description: 'Action to perform')
    }
    stages {
        stage('Deploy') {
            steps {
                echo "Deploying to ${params.ENVIRONMENT}"
            }
        }
    }
}
```

### Conditional Stages

```groovy
stage('Deploy') {
    when {
        branch 'main'
        expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
    }
    steps { echo "Deploying..." }
}
```

### Retry Logic

```groovy
stage('Deploy') {
    steps {
        retry(3) {
            sh 'npm deploy'
        }
    }
}
```

---

## Common Jenkins Plugins

| Plugin | Purpose | Install? |
|--------|---------|----------|
| NodeJS | Node.js tool support | ✅ Required |
| Pipeline | Declarative pipelines | ✅ Required |
| GitHub Integration | GitHub integration | ✅ Required |
| Docker Pipeline | Docker support | ✅ Required |
| HTML Publisher | HTML reports | ✅ Required |
| Email Extension | Email notifications | ❌ Optional |
| Slack Notification | Slack integration | ❌ Optional |
| SonarQube Scanner | Code quality | ❌ Optional |
| Performance | Performance testing | ❌ Optional |

---

## Useful Jenkins URLs

- Main: http://localhost:8080
- Configure System: http://localhost:8080/configure
- Manage Plugins: http://localhost:8080/pluginManager
- Credentials: http://localhost:8080/credentials
- Script Console: http://localhost:8080/script

---

**Last Updated**: May 2026  
**For troubleshooting, see [JENKINS_SETUP.md](JENKINS_SETUP.md#troubleshooting)**
