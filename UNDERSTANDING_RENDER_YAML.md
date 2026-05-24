# Understanding render.yaml - Blueprint Specification

## What is render.yaml?

`render.yaml` is a **Blueprint specification file** for Render that works similarly to `docker-compose.yml`:
- Defines all services your app needs
- Specifies how to build each service (Dockerfiles)
- Sets environment variables
- Configures health checks
- Orchestrates multi-service deployment

---

## Your render.yaml File Structure

### Location
```
/render.yaml  ← Must be in repository ROOT
```

### Full Content
```yaml
# render.yaml - COMPLETE FILE FOR RENDER.COM DEPLOYMENT

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

---

## Field Explanations

### Service Type
```yaml
type: web
```
**Meaning**: This is a web service (can receive HTTP requests)
**Other options**: `worker` (background job), `private_service` (internal only)

---

### Service Name
```yaml
name: be-todo
```
**Meaning**: The identifier for this service
**Generated URL**: `https://be-todo.onrender.com`
**Important**: Must be unique across all your Render services

---

### Runtime
```yaml
runtime: docker
```
**Meaning**: Build and run using Docker (from specified Dockerfile)
**Other options**: `node`, `python`, `ruby` (for native deployments)

---

### Docker File Path
```yaml
dockerfilePath: ./backend/Dockerfile
```
**Meaning**: Location of the Dockerfile relative to repository root
**Example**: `./backend/Dockerfile` means the file is at `/backend/Dockerfile`

---

### Health Check Path
```yaml
healthCheckPath: /health
```
**Meaning**: HTTP endpoint Render pings to verify service is healthy
**How it works**: 
- Render sends `GET /health` request
- Expects status 200-399
- If fails, service is considered unhealthy
- Example response:
```json
{"status":"OK","database":"SQLite"}
```

**Your endpoint** (in `server.js`):
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'OK', database: 'SQLite' });
});
```

---

### Environment Variables
```yaml
envVars:
  - key: PORT
    value: 5000
  - key: NODE_ENV
    value: production
```

**Meaning**: Variables available inside the running container
**How it works**:
1. These are set when container starts
2. Your code can access via `process.env.PORT`
3. Override local `.env` files
4. Used at runtime, NOT at build time

**Example in code**:
```javascript
const port = process.env.PORT || 5000;  // Uses 5000 from render.yaml
```

---

## Comparison: render.yaml vs docker-compose.yml

| Feature | docker-compose.yml | render.yaml |
|---------|-------------------|-----------|
| **Purpose** | Local multi-container orchestration | Cloud deployment blueprint |
| **Used for** | Development & testing | Production on Render |
| **Networking** | Local network between services | Web services accessible via URLs |
| **Build trigger** | Manual (docker-compose up) | Automatic on git push |
| **Environment** | Local machine | Render cloud platform |
| **Services** | Can be any type | Limited to web/worker/private |

---

## Example render.yaml for Different Scenarios

### Scenario 1: Simple Web App
```yaml
services:
  - type: web
    name: my-app
    runtime: docker
    dockerfilePath: ./Dockerfile
```

### Scenario 2: Frontend + Backend
```yaml
services:
  - type: web
    name: backend
    runtime: docker
    dockerfilePath: ./backend/Dockerfile
    
  - type: web
    name: frontend
    runtime: docker
    dockerfilePath: ./frontend/Dockerfile
```

### Scenario 3: Frontend + Backend + Database
```yaml
services:
  - type: web
    name: backend
    runtime: docker
    dockerfilePath: ./backend/Dockerfile
    envVars:
      - key: DATABASE_URL
        value: postgresql://user:pass@db:5432/mydb
    
  - type: web
    name: frontend
    runtime: docker
    dockerfilePath: ./frontend/Dockerfile
    
  - type: private_service
    name: db
    runtime: docker
    dockerfilePath: ./database/Dockerfile
```

---

## Build & Deployment Flow with render.yaml

```
1. You push to GitHub
        ↓
2. Render webhook receives notification
        ↓
3. Render clones your repository
        ↓
4. Render reads render.yaml
        ↓
5. For each service:
   a) Find the Dockerfile (dockerfilePath)
   b) Build Docker image
   c) Push to Render registry
   d) Start container from image
   e) Set environment variables (envVars)
   f) Monitor health check (healthCheckPath)
        ↓
6. All services running and accessible
        ↓
7. Each service gets a URL:
   - backend: https://be-todo.onrender.com
   - frontend: https://fe-todo.onrender.com
```

---

## How Services Communicate

### From Frontend to Backend
**Frontend code** (React):
```javascript
const API_URL = process.env.REACT_APP_API_URL;  // Set during build
axios.get(`${API_URL}/api/tasks`);  // Makes request to backend
```

**Process**:
1. Frontend makes HTTP request to backend URL
2. Request goes over internet (not local network)
3. Backend receives and processes request
4. Sends response back

**Important**: Services communicate via **public URLs**, not internal networking

---

## Environment Variables: Build-time vs Runtime

### Build-time Variables (React Frontend)
These must be available **during the Docker build**:
```dockerfile
ENV REACT_APP_API_URL=https://backend-url.com
RUN npm run build  # This uses REACT_APP_API_URL
```

Set in: `.env.production` or Dockerfile ENV

### Runtime Variables (Node Backend)
These are used **when container is running**:
```yaml
envVars:
  - key: PORT
    value: 5000
```

Accessed in code:
```javascript
const port = process.env.PORT;  // 5000
```

---

## Security Considerations

### ⚠️ NEVER put these in render.yaml:
- Database passwords
- API keys
- Secret tokens
- Private credentials

### ✅ DO set via Render Dashboard instead:
1. Go to service settings
2. "Environment" tab
3. Add sensitive variables there (encrypted)

### Example - Wrong:
```yaml
envVars:
  - key: DATABASE_PASSWORD
    value: super_secret_password123  # ❌ EXPOSED IN GIT
```

### Example - Right:
```yaml
# In render.yaml (public, in Git)
# (no secrets)

# In Render Dashboard (private, encrypted)
DATABASE_PASSWORD = super_secret_password123
```

---

## Common Issues & Solutions

### Issue: Service won't start
**Check**: Is `healthCheckPath` correct and returns 200-399?
```bash
curl https://be-todo.onrender.com/health
```

### Issue: Frontend can't reach backend
**Check**: Is `REACT_APP_API_URL` set in frontend environment?
**Check**: Are both services actually running?

### Issue: Invalid yaml error
**Check**: YAML is strict with indentation (use spaces, not tabs)
```yaml
services:
  - type: web    # 2 spaces indentation
    name: myapp  # 4 spaces indentation
```

### Issue: Dockerfile not found
**Check**: `dockerfilePath` is correct relative to repo root
```yaml
dockerfilePath: ./backend/Dockerfile  # ✅ Correct
dockerfilePath: ./Dockerfile          # ❌ Wrong (for this example)
```

---

## Best Practices

1. **Use descriptive service names**
   ```yaml
   name: be-todo  # ✅ Clear
   name: service1 # ❌ Vague
   ```

2. **Always include health checks**
   ```yaml
   healthCheckPath: /health  # ✅ Good
   # Missing health check    # ❌ Render can't verify service
   ```

3. **Keep environment variables minimal in YAML**
   ```yaml
   # ✅ Only non-sensitive config
   PORT: 5000
   NODE_ENV: production
   
   # ❌ Avoid secrets in render.yaml
   DATABASE_PASSWORD: secret
   ```

4. **Use meaningful Dockerfile paths**
   ```yaml
   dockerfilePath: ./backend/Dockerfile      # ✅ Clear
   dockerfilePath: ./docker/backend.dockerfile # ❌ Unclear
   ```

---

## Resources

- **Render Blueprint Spec**: https://render.com/docs/blueprint-spec
- **Render Dashboard**: https://dashboard.render.com
- **YAML Tutorial**: https://yaml.org
- **Docker Documentation**: https://docs.docker.com

---

## Summary

✅ `render.yaml` defines your multi-service architecture  
✅ Similar to `docker-compose.yml` but for cloud deployment  
✅ Goes in repository root  
✅ Triggers automatic builds on Git push  
✅ Each service gets a public URL  
✅ Never commit secrets in render.yaml  
✅ Use Render Dashboard for sensitive variables  

You now understand the blueprint specification! 🚀
