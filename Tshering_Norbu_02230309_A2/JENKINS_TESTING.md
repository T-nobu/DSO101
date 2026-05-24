# Jenkins Pipeline - Test Results & Challenges

## Expected Test Results

### Backend Tests (server.test.js)

When running `npm test` in the backend:

```
PASS  __tests__/server.test.js
  Backend API Tests
    GET /api/tasks
      ✓ should return an empty array initially (15ms)
    POST /api/tasks
      ✓ should create a new task (8ms)
      ✓ should fail when description is empty (5ms)
      ✓ should fail when description is missing (4ms)
    GET /api/tasks/:id
      ✓ should return a specific task (10ms)
      ✓ should return 404 for non-existent task (3ms)
    PUT /api/tasks/:id
      ✓ should update task description (12ms)
      ✓ should update task completion status (8ms)
      ✓ should return 404 for non-existent task (2ms)
    DELETE /api/tasks/:id
      ✓ should delete a task (11ms)
      ✓ should return 404 for non-existent task (2ms)

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        2.145s
```

### Frontend Tests (App.test.js)

When running `npm test` in the frontend:

```
PASS  src/App.test.js
  App Component
    ✓ renders without crashing (24ms)
    ✓ renders todo application (8ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        3.421s
```

### Code Coverage

Expected coverage report:

**Backend Coverage**:
```
-----------|---------|---------|---------|---------|------|
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
-----------|---------|---------|---------|---------|------|
All files  |   75.00 |   60.00 |   80.00 |   75.00 |
 server.js |   75.00 |   60.00 |   80.00 |   75.00 | 5,10,15
-----------|---------|---------|---------|---------|------|
```

**Frontend Coverage**:
```
-----------|---------|---------|---------|---------|------|
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
-----------|---------|---------|---------|---------|------|
All files  |   50.00 |   45.00 |   60.00 |   50.00 |
 App.js    |   50.00 |   45.00 |   60.00 |   50.00 | 12,25
-----------|---------|---------|---------|---------|------|
```

---

## Jenkins Pipeline Output

### Successful Pipeline Execution

```
Started by user admin
Building in workspace /var/jenkins_home/workspace/todo-app-pipeline

Stage: Checkout
  Cloning repository...
  ✓ Repository checked out successfully

Stage: Backend - Install Dependencies
  Node version: v20.11.0
  npm version: 9.8.1
  npm install
  added 150 packages in 12.5s
  ✓ Backend dependencies installed successfully

Stage: Backend - Run Tests
  npm test -- --ci --coverage
  ✓ Backend tests completed
  12 passed, 0 failed

Stage: Frontend - Install Dependencies
  Node version: v20.11.0
  npm version: 9.8.1
  npm install
  added 280 packages in 18.2s
  ✓ Frontend dependencies installed successfully

Stage: Frontend - Run Tests
  npm test
  ✓ Frontend tests completed
  2 passed, 0 failed

Stage: Backend - Build
  ✓ Backend build completed

Stage: Frontend - Build
  npm run build
  Creating optimized production build...
  ✓ Frontend build completed

Stage: Deploy - Build Docker Images
  Logging into Docker Hub...
  Building backend image...
  ✓ Docker image built: yourusername/node-app-backend:latest
  Building frontend image...
  ✓ Docker image built: yourusername/node-app-frontend:latest

Stage: Deploy - Push to Docker Hub
  Pushing backend image to Docker Hub...
  ✓ Backend image pushed successfully
  Pushing frontend image to Docker Hub...
  ✓ Frontend image pushed successfully

Pipeline Cleanup
  ✓ Cleanup completed

✓ Pipeline executed successfully!
```

---

## Common Challenges & Solutions

### Challenge 1: Jest Configuration Issues

**Problem**: Jest not found or tests don't run
```
npm ERR! code ENOENT
npm ERR! sh: jest: not found
```

**Solution**:
1. Ensure jest and jest-junit are installed:
   ```bash
   npm install --save-dev jest jest-junit
   ```
2. Verify jest.config.js exists in root directory
3. Run locally first: `npm test`
4. Check package.json test script:
   ```json
   "test": "jest --ci --coverage --reporters=default --reporters=jest-junit"
   ```

---

### Challenge 2: Node Version Mismatch

**Problem**: Tests pass locally but fail in Jenkins
```
Error: Cannot find module 'better-sqlite3'
```

**Cause**: Node version difference between local and Jenkins

**Solution**:
1. In Jenkins, go to **Manage Jenkins** → **Tools**
2. Ensure NodeJS version matches your local version
3. Use same npm version:
   ```bash
   npm install -g npm@latest
   ```
4. Add to Jenkinsfile:
   ```groovy
   sh 'echo "Node: $(node --version), npm: $(npm --version)"'
   ```

---

### Challenge 3: Database Connection Errors

**Problem**: Backend tests fail with database errors
```
Error: unable to open database file
```

**Cause**: Database path issues in different environments

**Solution**:
1. Update server.js to use different paths for Docker vs local:
   ```javascript
   const dbDir = process.env.DOCKER_ENV ? '/app/data' : __dirname;
   const dbPath = path.join(dbDir, 'database.sqlite');
   ```
2. Set environment variable in Jenkins:
   ```groovy
   sh 'DOCKER_ENV=false npm test'
   ```

---

### Challenge 4: Docker Build Fails

**Problem**: Docker image build fails in pipeline
```
docker: command not found
```

**Cause**: Docker not installed or not in PATH

**Solution**:
1. Install Docker Pipeline plugin in Jenkins
2. Ensure Docker daemon is running:
   ```bash
   docker ps
   ```
3. If using Docker in Docker (Jenkins container):
   ```bash
   docker run -v /var/run/docker.sock:/var/run/docker.sock jenkins/jenkins
   ```

---

### Challenge 5: GitHub Authentication Fails

**Problem**: Cannot clone repository
```
fatal: Authentication failed for 'https://github.com/...'
```

**Cause**: Invalid credentials or expired PAT

**Solution**:
1. Verify GitHub PAT is valid:
   ```bash
   curl -H "Authorization: token YOUR_PAT" https://api.github.com/user
   ```
2. Update Jenkins credentials:
   - Go to **Manage Credentials**
   - Select `github-credentials`
   - Update with new PAT
3. In Jenkinsfile, ensure credentialsId matches:
   ```groovy
   credentialsId: 'github-credentials'
   ```

---

### Challenge 6: npm install Takes Forever

**Problem**: npm install timeout (>5 minutes)
```
npm ERR! code ETIMEDOUT
```

**Cause**: Slow network or large dependencies

**Solution**:
1. Use npm ci instead of npm install:
   ```groovy
   sh 'npm ci --prefer-offline'
   ```
2. Increase timeout:
   ```groovy
   timeout(time: 15, unit: 'MINUTES') {
       sh 'npm install'
   }
   ```
3. Use npm cache:
   ```bash
   npm cache clean --force
   npm cache verify
   ```

---

### Challenge 7: Test Results Not Published

**Problem**: Jenkins doesn't show test results
```
junit: No test results found
```

**Cause**: JUnit XML file not generated

**Solution**:
1. Verify junit.xml is generated:
   ```bash
   npm test
   ls -la junit.xml
   ```
2. Ensure jest-junit reporter is configured:
   ```json
   "devDependencies": {
     "jest-junit": "^16.0.0"
   }
   ```
3. Update jest.config.js:
   ```javascript
   reporters: [
     'default',
     ['jest-junit', {
       outputDirectory: './',
       outputName: 'junit.xml'
     }]
   ]
   ```
4. Update Jenkinsfile post action:
   ```groovy
   junit 'backend/junit.xml'
   ```

---

### Challenge 8: Docker Hub Push Fails

**Problem**: Cannot push to Docker Hub
```
denied: requested access to the resource is denied
```

**Cause**: Invalid credentials or repository doesn't exist

**Solution**:
1. Create repository on Docker Hub:
   - Log in to https://hub.docker.com
   - Click **Create Repository**
   - Name: `node-app-backend`, `node-app-frontend`
2. Test locally:
   ```bash
   docker login -u yourusername
   docker push yourusername/node-app-backend:latest
   ```
3. Verify Jenkins credentials:
   - ID must match Jenkinsfile: `docker-hub-creds`
   - Username: Docker Hub username
   - Password: Docker Hub access token (not password!)

---

### Challenge 9: React Build Fails

**Problem**: Frontend build step fails
```
npm ERR! The build failed because the process exited too early
```

**Cause**: JavaScript error in source code or dependencies

**Solution**:
1. Build locally to check:
   ```bash
   cd frontend
   npm run build
   ```
2. Check for console errors in browser
3. Verify all imports are correct
4. Update Jenkinsfile to show full output:
   ```groovy
   sh '''
       npm run build 2>&1 | tee build.log
       if [ ${PIPESTATUS[0]} -ne 0 ]; then
           echo "Build failed!"
           exit 1
       fi
   '''
   ```

---

### Challenge 10: Supertest Module Not Found

**Problem**: Backend tests fail with supertest error
```
Cannot find module 'supertest'
```

**Solution**:
1. Install supertest:
   ```bash
   npm install --save-dev supertest@6.3.3
   ```
2. Verify it's in package.json devDependencies
3. Clear npm cache:
   ```bash
   npm cache clean --force
   npm install
   ```

---

## Debugging Tips

### 1. Enable Verbose Logging

**In Jenkinsfile**:
```groovy
sh 'set -x'  // Bash verbose
npm install  // Shows every command
```

### 2. Check Environment Variables

```groovy
sh '''
    echo "Node: $(node --version)"
    echo "npm: $(npm --version)"
    echo "Docker: $(docker --version)"
    echo "PWD: $(pwd)"
    echo "PATH: $PATH"
'''
```

### 3. Debug Database Issues

```bash
sqlite3 database.sqlite ".tables"
sqlite3 database.sqlite "SELECT COUNT(*) FROM tasks;"
```

### 4. Test Docker Locally

```bash
# Build
docker build -t test-backend ./backend

# Run
docker run -p 5000:5000 test-backend

# Verify
curl http://localhost:5000/api/tasks
```

### 5. Check Jenkins Logs

**Jenkins Master Logs**:
```bash
# Linux
sudo tail -f /var/log/jenkins/jenkins.log

# macOS
tail -f /var/log/jenkins/jenkins.log

# Windows
Get-Content "C:\Program Files\Jenkins\jenkins.log" -Tail 50 -Wait
```

---

## Performance Metrics

### Expected Pipeline Duration

| Stage | Duration | Notes |
|-------|----------|-------|
| Checkout | 5-10s | Depends on repo size |
| Backend Install | 30-45s | First run slower due to npm cache |
| Backend Tests | 10-15s | 12 tests |
| Frontend Install | 45-60s | React dependencies are large |
| Frontend Tests | 15-25s | Includes build step |
| Frontend Build | 20-30s | Production build optimization |
| Docker Build | 2-5m | First build slower, uses cache after |
| Docker Push | 1-3m | Depends on image size and network |
| **Total** | **6-10 minutes** | Subsequent runs faster |

---

## Success Indicators

✅ **Pipeline Completed Successfully**
- All stages green
- No error messages
- Build time consistent

✅ **All Tests Passing**
- Backend: 12/12 passed
- Frontend: 2/2 passed
- Code coverage >50%

✅ **Artifacts Generated**
- junit.xml files created
- Coverage reports generated
- Docker images built

✅ **Deployment Ready**
- Docker images pushed to Docker Hub
- No warnings or errors
- Ready for production deployment

---

## Next Steps After Success

1. ✅ Verify Docker images on Docker Hub
2. ✅ Run Docker container locally to test:
   ```bash
   docker run -p 5000:5000 yourusername/node-app-backend:latest
   docker run -p 3000:3000 yourusername/node-app-frontend:latest
   ```
3. ✅ Set up GitHub webhook for automatic builds
4. ✅ Configure Slack notifications (optional)
5. ✅ Document any additional challenges
6. ✅ Submit assignment with screenshots

---

**Last Updated**: May 2026  
**For detailed setup, see [JENKINS_SETUP.md](JENKINS_SETUP.md)**
