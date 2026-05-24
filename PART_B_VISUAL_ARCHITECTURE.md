# Part B: Visual Architecture & Workflow Diagrams

## 1. System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         RENDER CLOUD                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              FRONTEND SERVICE (fe-todo)                   │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  - React Application                                       │ │
│  │  - Nginx Server (port 80)                                 │ │
│  │  - Built with API URL embedded                            │ │
│  │  URL: https://fe-todo.onrender.com                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ▲                                   │
│                              │ HTTP Requests                     │
│                              │ /api/tasks                        │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              BACKEND SERVICE (be-todo)                    │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  - Node.js Express Server (port 5000)                     │ │
│  │  - REST API Endpoints                                     │ │
│  │  - SQLite Database (/app/data/database.sqlite)            │ │
│  │  - Health Check: /health                                  │ │
│  │  URL: https://be-todo.onrender.com                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ◄─── Both services scale independently                          │
│  ◄─── Health checks monitor availability                         │
│  ◄─── Data persists in SQLite database                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
         │
         │ GitHub webhook triggers rebuild
         │
        ▼
┌──────────────────────────────────────────────────────────────────┐
│                       GITHUB (Your Code)                         │
├──────────────────────────────────────────────────────────────────┤
│  - backend/Dockerfile                                           │
│  - frontend/Dockerfile                                          │
│  - render.yaml (Blueprint definition)                           │
│  - All source code                                              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPER WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Edit Code Locally                                          │
│     ┌─────────────────────────────────────────────────────┐   │
│     │  nano backend/server.js                             │   │
│     │  npm run dev (local testing)                        │   │
│     └─────────────────────────────────────────────────────┘   │
│                      ↓                                          │
│  2. Commit Changes                                             │
│     ┌─────────────────────────────────────────────────────┐   │
│     │  git add .                                          │   │
│     │  git commit -m "Add new feature"                   │   │
│     └─────────────────────────────────────────────────────┘   │
│                      ↓                                          │
│  3. Push to GitHub                                             │
│     ┌─────────────────────────────────────────────────────┐   │
│     │  git push origin main                              │   │
│     └─────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                         ↓ Webhook notification
┌─────────────────────────────────────────────────────────────────┐
│                  RENDER DASHBOARD                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  4. Detect New Commit                                          │
│     ┌─────────────────────────────────────────────────────┐   │
│     │ [Build Status: Triggered]                          │   │
│     │ Cloning: github.com/your-repo.git                  │   │
│     └─────────────────────────────────────────────────────┘   │
│                      ↓                                          │
│  5. Parse render.yaml                                          │
│     ┌─────────────────────────────────────────────────────┐   │
│     │ Reading services...                                 │   │
│     │  - be-todo (./backend/Dockerfile)                  │   │
│     │  - fe-todo (./frontend/Dockerfile)                 │   │
│     └─────────────────────────────────────────────────────┘   │
│                      ↓                                          │
│  6. Build Backend Image                                        │
│     ┌─────────────────────────────────────────────────────┐   │
│     │ Step 1/15: FROM node:18-alpine AS builder          │   │
│     │ Step 2/15: RUN apk add --no-cache build-base...   │   │
│     │ Step 3/15: WORKDIR /app                            │   │
│     │ ...                                                 │   │
│     │ Built: tnobu/app-backend:12345                     │   │
│     └─────────────────────────────────────────────────────┘   │
│                      ↓                                          │
│  7. Build Frontend Image                                       │
│     ┌─────────────────────────────────────────────────────┐   │
│     │ Step 1/8: FROM node:18-alpine AS build             │   │
│     │ ENV REACT_APP_API_URL=https://be-todo...           │   │
│     │ RUN npm ci                                          │   │
│     │ RUN npm run build                                   │   │
│     │ ...                                                 │   │
│     │ Built: tnobu/app-frontend:12345                    │   │
│     └─────────────────────────────────────────────────────┘   │
│                      ↓                                          │
│  8. Deploy Backend Service                                     │
│     ┌─────────────────────────────────────────────────────┐   │
│     │ Starting be-todo service...                         │   │
│     │ Running health check: GET /health                  │   │
│     │ ✅ Health check passed                              │   │
│     │ Service running at: be-todo.onrender.com           │   │
│     └─────────────────────────────────────────────────────┘   │
│                      ↓                                          │
│  9. Deploy Frontend Service                                    │
│     ┌─────────────────────────────────────────────────────┐   │
│     │ Starting fe-todo service...                         │   │
│     │ Nginx configured and ready                          │   │
│     │ ✅ Service running                                  │   │
│     │ Service running at: fe-todo.onrender.com           │   │
│     └─────────────────────────────────────────────────────┘   │
│                                                                 │
│  🎉 All services deployed successfully!                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                         ↓ Users access
┌─────────────────────────────────────────────────────────────────┐
│                  LIVE APPLICATION                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Users open: https://fe-todo.onrender.com                      │
│              ↓                                                  │
│  React App loads → Fetches tasks from backend                 │
│              ↓                                                  │
│  https://be-todo.onrender.com/api/tasks                       │
│              ↓                                                  │
│  Backend returns task data → Displayed in UI                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. render.yaml Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     render.yaml Blueprint                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  services:                                                      │
│                                                                 │
│    ┌───────────────────────────────────────────────────────┐  │
│    │ Backend Web Service                                   │  │
│    ├───────────────────────────────────────────────────────┤  │
│    │ - type: web                                           │  │
│    │ - name: be-todo                                       │  │
│    │ - runtime: docker                                     │  │
│    │ - dockerfilePath: ./backend/Dockerfile               │  │
│    │                                                       │  │
│    │ Environment Variables:                               │  │
│    │   - PORT: 5000                                        │  │
│    │   - NODE_ENV: production                              │  │
│    │   - DATABASE_PATH: /app/data/database.sqlite          │  │
│    │                                                       │  │
│    │ Health Check: /health                                │  │
│    └───────────────────────────────────────────────────────┘  │
│                          ↓                                      │
│    ┌───────────────────────────────────────────────────────┐  │
│    │ Frontend Web Service                                  │  │
│    ├───────────────────────────────────────────────────────┤  │
│    │ - type: web                                           │  │
│    │ - name: fe-todo                                       │  │
│    │ - runtime: docker                                     │  │
│    │ - dockerfilePath: ./frontend/Dockerfile              │  │
│    │                                                       │  │
│    │ (Environment variables set at build time)            │  │
│    └───────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Service Communication

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  useEffect(() => {                                          │
│    axios.get('https://be-todo.onrender.com/api/tasks')     │
│  }, [])                                                     │
│                                                              │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   │ HTTP GET Request
                   │ (over internet)
                   ↓
┌──────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js)                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  app.get('/api/tasks', (req, res) => {                      │
│    const rows = db.prepare(                                 │
│      "SELECT * FROM tasks ORDER BY id DESC"                │
│    ).all();                                                  │
│    res.json(rows);                                          │
│  });                                                         │
│                                                              │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   │ HTTP Response (JSON)
                   │
                   ↓
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  setTasks(response.data);  // Update state                  │
│  // Re-render UI with tasks                                 │
│                                                              │
│  Display: ✓ Task 1                                          │
│           ✓ Task 2                                          │
│           ✓ Task 3                                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Data Flow for Adding a Task

```
┌────────────────────────────────────────────────────────────┐
│  User Interface                                            │
├────────────────────────────────────────────────────────────┤
│  Input: "Buy groceries"                                    │
│  Click: Add Task button                                    │
└──────────────────┬─────────────────────────────────────────┘
                   │
                   ↓
┌────────────────────────────────────────────────────────────┐
│  React Component (App.js)                                  │
├────────────────────────────────────────────────────────────┤
│  axios.post(                                               │
│    'https://be-todo.onrender.com/api/tasks',               │
│    { description: 'Buy groceries' }                        │
│  )                                                          │
└──────────────────┬─────────────────────────────────────────┘
                   │
                   │ HTTP POST (JSON data)
                   ↓
┌────────────────────────────────────────────────────────────┐
│  Backend API (server.js)                                   │
├────────────────────────────────────────────────────────────┤
│  app.post('/api/tasks', (req, res) => {                   │
│    const result = db.prepare(                              │
│      "INSERT INTO tasks (description) VALUES (?)"          │
│    ).run(description);                                      │
│    // Database updated! ✅                                  │
│  })                                                         │
└──────────────────┬─────────────────────────────────────────┘
                   │
                   │ HTTP Response (new task)
                   ↓
┌────────────────────────────────────────────────────────────┐
│  React Component Updates                                   │
├────────────────────────────────────────────────────────────┤
│  setTasks([newTask, ...tasks])                             │
│  UI re-renders                                              │
│  User sees: "Buy groceries" in the task list ✓             │
└────────────────────────────────────────────────────────────┘
```

---

## 6. Automatic Deployment Trigger

```
┌─────────────────────────────────────────────────────────────┐
│ GitHub Repository                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  git push origin main                                       │
│                                                             │
│  New commit: abc1234                                        │
│  Message: "Fix task sorting"                               │
│                                                             │
└────────────────┬──────────────────────────────────────────┘
                 │
                 │ GitHub webhook notification
                 │ (automatic, no manual trigger)
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ Render Webhook Receiver                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Received webhook:                                           │
│ - Repository: your-username/your-repo                       │
│ - Branch: main                                              │
│ - Latest commit: abc1234                                    │
│ - Timestamp: 2024-05-24 10:15:30                           │
│                                                             │
└────────────────┬──────────────────────────────────────────┘
                 │
                 │ Trigger new build pipeline
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ Render Build Pipeline                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [████████████████████] 40% Building backend image           │
│ [████████░░░░░░░░░░░░] 20% Building frontend image         │
│ [░░░░░░░░░░░░░░░░░░░░]  0% Deploying services             │
│                                                             │
│ Estimated time: ~5 minutes                                  │
│                                                             │
└────────────────┬──────────────────────────────────────────┘
                 │
                 ↓ (When complete)
┌─────────────────────────────────────────────────────────────┐
│ Services Updated                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✅ Backend redeployed: be-todo.onrender.com                │
│ ✅ Frontend redeployed: fe-todo.onrender.com               │
│                                                             │
│ Users see new version automatically!                        │
│ No manual intervention needed.                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Environment Variables at Different Stages

```
┌────────────────────────────────────────────────────────────┐
│            Build-Time Environment Variables                │
│        (Set when Docker image is being built)              │
└────────────────────────────────────────────────────────────┘

  Frontend Dockerfile:
  ENV REACT_APP_API_URL=https://be-todo.onrender.com
  RUN npm run build  ← Uses the env var above
  
  Result: Backend URL is compiled into React bundle


┌────────────────────────────────────────────────────────────┐
│           Runtime Environment Variables                    │
│          (Set when container is starting)                 │
└────────────────────────────────────────────────────────────┘

  Backend render.yaml:
  envVars:
    - key: PORT
      value: 5000
    - key: NODE_ENV
      value: production
  
  In server.js:
  const port = process.env.PORT;  // 5000
```

---

## 8. Health Check Monitoring

```
┌────────────────────────────────────────────────────────────┐
│              Render Health Check                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Every 30 seconds (approximately):                          │
│                                                            │
│ GET https://be-todo.onrender.com/health                   │
│                                                            │
│ Response:                                                  │
│ {                                                          │
│   "status": "OK",                                          │
│   "database": "SQLite"                                    │
│ }                                                          │
│                                                            │
│ Status Code: 200 ✅                                        │
│                                                            │
│ If health check fails:                                     │
│ - Render marks service as "Unhealthy"                      │
│ - Automatically restarts the service                       │
│ - Sends notification (if configured)                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 9. GitHub → Render Connection

```
┌──────────────────────────────────────────────────────────┐
│  GitHub                                                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Settings → Webhooks → https://api.render.com/webhooks  │
│                                                          │
│  Events:                                                 │
│  ✓ Push events                                          │
│  ✓ Pull request events                                  │
│  ✓ Release events                                       │
│                                                          │
└────────────────┬───────────────────────────────────────┘
                 │ Triggers on git push
                 │
                 ↓
┌──────────────────────────────────────────────────────────┐
│  Render                                                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Webhook received from GitHub                           │
│  → Clone latest repository                              │
│  → Read render.yaml                                     │
│  → Build Docker images                                  │
│  → Deploy services                                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 10. Complete Request-Response Cycle

```
Browser                 Frontend              Backend
  │                       │                      │
  │──────────────────────>│                      │
  │  GET /                │                      │
  │                       │                      │
  │<──────────────────────│                      │
  │  React App (HTML)     │                      │
  │                       │                      │
  │  (React loads)        │                      │
  │       └─ app.js       │                      │
  │            │          │                      │
  │            └──> useEffect: fetch tasks      │
  │                       │                      │
  │                       │──────────────────────>│
  │                       │  GET /api/tasks      │
  │                       │                      │
  │                       │<──────────────────────│
  │                       │  [{id:1, desc:...}]  │
  │                       │                      │
  │<──────────────────────│                      │
  │  Task list rendered   │                      │
  │  with data           │                      │
  │                       │                      │
  │  User clicks:        │                      │
  │  "Add Task"          │                      │
  │       │               │                      │
  │       └──────────────>│                      │
  │                       │                      │
  │                       │──────────────────────>│
  │                       │  POST /api/tasks     │
  │                       │  {description: ...}  │
  │                       │                      │
  │                       │<──────────────────────│
  │                       │  {id:2, desc:...}    │
  │                       │                      │
  │<──────────────────────│                      │
  │  New task added to UI │                      │
  │                       │                      │
```

---

## Summary

This visual guide shows:
1. **Architecture** - How services are organized
2. **Deployment** - Step-by-step build pipeline
3. **Communication** - Frontend-to-backend interaction
4. **Automation** - GitHub webhook triggers Render
5. **Health Monitoring** - How Render checks service health
6. **Request Flow** - Complete cycle of user interaction

All of this happens **automatically** after you push to Git! 🎉
