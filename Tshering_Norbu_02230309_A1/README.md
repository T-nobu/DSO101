# DSO101 Assignment 1 — Continuous Integration and Continuous Deployment

---

## Table of Contents

1. [Step 0 — Prerequisite: Building the To-Do Application](#step-0--prerequisite-building-the-to-do-application)
2. [Part A — Deploying a Pre-Built Docker Image to Docker Hub Registry](#part-a--deploying-a-pre-built-docker-image-to-docker-hub-registry)
3. [Part B — Automated Image Build and Deployment](#part-b--automated-image-build-and-deployment)

---

## Step 0 — Prerequisite: Building the To-Do Application

### Overview

A full-stack To-Do List web application was built using the following tech stack:

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js + Express |
| Database | PostgreSQL |

### Project Structure

```
Tshering_Norbu_02230309_DSO101_A1/
└── todo-app/
    ├── frontend/
    │   ├── src/
    │   │   └── App.js
    │   ├── Dockerfile
    │   ├── .env
    │   ├── .env.production
    │   └── .dockerignore
    ├── backend/
    │   ├── server.js
    │   ├── package.json
    │   ├── Dockerfile
    │   ├── .env
    │   └── .env.production
    ├── render.yaml
    ├── .gitignore
    └── README.md
```

---

### Backend Setup

The backend was built using **Node.js** with **Express** and **pg** (PostgreSQL client).

**Key dependencies installed:**
```bash
npm install express pg dotenv cors
```

**`backend/server.js`** implements the following CRUD API endpoints:

| Method | Route | Description |
|---|---|---|
| GET | `/tasks` | Fetch all tasks |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

**`backend/.env`** (not committed to Git):
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=todos
DB_PORT=5432
PORT=5000
```

**`backend/Dockerfile`:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

#### Screenshot — Backend server running locally

> 📸 **[SCREENSHOT: Terminal showing "Server running on port 5000" with no errors]**

---

### Frontend Setup

The frontend was created using **Create React App** and connects to the backend via the `REACT_APP_API_URL` environment variable.

**`frontend/.env`** (not committed to Git):
```
REACT_APP_API_URL=http://localhost:5000
```

**`frontend/.env.production`:**
```
REACT_APP_API_URL=https://be-todo.onrender.com
```

**`frontend/Dockerfile`:**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Screenshot — Frontend running locally

> 📸 **[SCREENSHOT: Browser showing the To-Do app at http://localhost:3000 with tasks visible]**

---

### Database Setup

PostgreSQL was used for task persistence. The backend automatically creates the `tasks` table on startup:

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false
);
```

#### Screenshot — App working end-to-end locally

> 📸 **[SCREENSHOT: Browser showing tasks being added, edited, and deleted in the To-Do app]**

---

### Environment Variables and .gitignore

Sensitive credentials were kept out of version control using `.gitignore`:

```
.env
backend/.env
frontend/.env
node_modules/
```

#### Screenshot — .gitignore file

> 📸 **[SCREENSHOT: .gitignore file open in editor showing .env entries]**

---

## Part A — Deploying a Pre-Built Docker Image to Docker Hub Registry

### Step 1 — Build and Push Docker Images

Docker images were built for both the backend and frontend services, tagged with the student ID `02230309`.

**Commands used:**

```bash
# Login to Docker Hub
docker login

# Build and push backend image
cd backend
docker build -t tnobu/be-todo:02230309 .
docker push tnobu/be-todo:02230309

# Build and push frontend image
cd ../frontend
docker build -t tnobu/fe-todo:02230309 .
docker push tnobu/fe-todo:02230309
```

#### Screenshot — Docker build success (backend)

> 📸 **[SCREENSHOT: Terminal showing successful "docker build" output for backend with "FINISHED" status]**

#### Screenshot — Docker build success (frontend)

> 📸 **[SCREENSHOT: Terminal showing successful "docker build" output for frontend with "FINISHED" status]**

#### Screenshot — Docker push success

> 📸 **[SCREENSHOT: Terminal showing "docker push" output with all layers pushed for both images]**

#### Screenshot — Docker Hub repository

> 📸 **[SCREENSHOT: Docker Hub dashboard at hub.docker.com showing both images: tnobu/be-todo:02230309 and tnobu/fe-todo:02230309]**

---

### Step 2 — Set Up Managed PostgreSQL on Render

A managed PostgreSQL database was created on Render.com to provide cloud-hosted data persistence.

**Steps taken:**
1. Logged in to [render.com](https://render.com)
2. Clicked **New → PostgreSQL**
3. Named the database `todo-db`
4. Selected the **Free tier**
5. Copied the internal database credentials for use in environment variables

#### Screenshot — Render PostgreSQL dashboard

> 📸 **[SCREENSHOT: Render.com PostgreSQL service dashboard showing the database name, host, and connection details]**

---

### Step 3 — Deploy Backend Service on Render

**Steps taken:**
1. Render → **New → Web Service**
2. Selected **"Existing image from a registry"**
3. Set image URL to: `docker.io/tnobu/be-todo:02230309`
4. Set service name to `be-todo`
5. Added the following environment variables:

| Key | Value |
|---|---|
| `DB_HOST` | *(from Render PostgreSQL dashboard)* |
| `DB_USER` | *(from Render PostgreSQL dashboard)* |
| `DB_PASSWORD` | *(from Render PostgreSQL dashboard)* |
| `DB_NAME` | *(from Render PostgreSQL dashboard)* |
| `DB_PORT` | `5432` |
| `PORT` | `5000` |

6. Clicked **Deploy**

**Live backend URL:** `https://be-todo.onrender.com`

#### Screenshot — Render backend environment variables

> 📸 **[SCREENSHOT: Render.com environment variables panel for the be-todo service showing all DB keys configured]**

#### Screenshot — Render backend deploy log

> 📸 **[SCREENSHOT: Render.com deploy log showing successful deployment of the backend service with "Your service is live" message]**

#### Screenshot — Render backend service live

> 📸 **[SCREENSHOT: Render.com be-todo service dashboard showing status as "Live" with the service URL visible]**

---

### Step 4 — Deploy Frontend Service on Render

**Steps taken:**
1. Render → **New → Web Service**
2. Selected **"Existing image from a registry"**
3. Set image URL to: `docker.io/tnobu/fe-todo:02230309`
4. Set service name to `fe-todo`
5. Added the following environment variable:

| Key | Value |
|---|---|
| `REACT_APP_API_URL` | `https://be-todo.onrender.com` |

6. Clicked **Deploy**

#### Screenshot — Render frontend deploy log

> 📸 **[SCREENSHOT: Render.com deploy log showing successful deployment of the frontend service]**

#### Screenshot — Render frontend service live

> 📸 **[SCREENSHOT: Render.com fe-todo service dashboard showing status as "Live" with the service URL visible]**

---

### Step 5 — Verify Full App Works on Render

After both services were deployed, the live frontend URL was opened in the browser and the full application was tested end-to-end.

#### Screenshot — Live app on Render (add task)

> 📸 **[SCREENSHOT: Browser showing the live To-Do app URL (fe-todo.onrender.com) with a new task being added]**

#### Screenshot — Live app on Render (edit and delete)

> 📸 **[SCREENSHOT: Browser showing the live To-Do app with a task being edited or deleted successfully]**

---

## Part B — Automated Image Build and Deployment

### Overview

In Part B, the deployment was configured to build and deploy automatically from the GitHub repository every time a new commit is pushed. This was achieved using Render's **Blueprint** feature with a `render.yaml` configuration file.

---

### Step 1 — Push Code to GitHub

The complete project was pushed to a GitHub repository with the correct folder name.

```bash
git init
git add .
git commit -m "Initial commit: full-stack to-do app with Dockerfiles"
git branch -M main
git remote add origin https://github.com/tnobu/Tshering_Norbu_02230309_DSO101_A1.git
git push -u origin main
```

#### Screenshot — GitHub repository

> 📸 **[SCREENSHOT: GitHub repository page showing the folder structure with frontend/, backend/, render.yaml, and README.md]**

---

### Step 2 — Configure render.yaml

A `render.yaml` blueprint file was created at the root of the repository to define both services for automated deployment.

**`render.yaml`:**
```yaml
services:
  - type: web
    name: be-todo
    env: docker
    dockerfilePath: ./backend/Dockerfile
    envVars:
      - key: DB_HOST
        value: your-render-db-host
      - key: DB_USER
        value: your-render-db-user
      - key: DB_PASSWORD
        sync: false
      - key: DB_NAME
        value: todos
      - key: DB_PORT
        value: 5432
      - key: PORT
        value: 5000

  - type: web
    name: fe-todo
    env: docker
    dockerfilePath: ./frontend/Dockerfile
    envVars:
      - key: REACT_APP_API_URL
        value: https://be-todo.onrender.com
```

> Note: `sync: false` is used for `DB_PASSWORD` so it is entered securely through the Render dashboard and never stored in the repository.

#### Screenshot — render.yaml in repository

> 📸 **[SCREENSHOT: GitHub showing the render.yaml file contents in the repository]**

---

### Step 3 — Connect Repository via Render Blueprint

**Steps taken:**
1. Render → **New → Blueprint**
2. Connected GitHub account and selected the repository `Tshering_Norbu_02230309_DSO101_A1`
3. Render automatically detected `render.yaml` and listed both services (`be-todo` and `fe-todo`)
4. Clicked **Apply** to deploy both services from the Dockerfiles

#### Screenshot — Render Blueprint detecting render.yaml

> 📸 **[SCREENSHOT: Render Blueprint setup screen showing both services (be-todo and fe-todo) detected from render.yaml]**

#### Screenshot — Render Blueprint deploy in progress

> 📸 **[SCREENSHOT: Render dashboard showing both services building simultaneously after Blueprint was applied]**

#### Screenshot — Both services live via Blueprint

> 📸 **[SCREENSHOT: Render dashboard showing both be-todo and fe-todo services with status "Live" after Blueprint deployment]**

---

### Step 4 — Test Automated Redeployment on Git Push

To verify the CI/CD pipeline, a small change was made to the code and pushed to GitHub. Render automatically detected the new commit and triggered a redeploy.

**Change made:**
```bash
# Made a small visible change (e.g. updated the app title in App.js)
git add .
git commit -m "Test CI/CD: update app title to verify auto-redeploy"
git push
```

#### Screenshot — GitHub commit triggering redeploy

> 📸 **[SCREENSHOT: GitHub showing the new commit in the repository]**

#### Screenshot — Render auto-redeploy triggered

> 📸 **[SCREENSHOT: Render.com deploy log showing a new build was automatically triggered by the GitHub push, with the commit message visible]**

#### Screenshot — Updated app live after auto-redeploy

> 📸 **[SCREENSHOT: Browser showing the updated live To-Do app reflecting the change made in the commit]**

---

## Summary

| Task | Status |
|---|---|
| To-Do app built with React, Node.js, PostgreSQL | ✅ Complete |
| Environment variables configured with `.env` | ✅ Complete |
| `.env` excluded from Git via `.gitignore` | ✅ Complete |
| Backend Docker image built and pushed to Docker Hub | ✅ Complete |
| Frontend Docker image built and pushed to Docker Hub | ✅ Complete |
| Images tagged with student ID `02230309` | ✅ Complete |
| Backend deployed on Render via Docker Hub image | ✅ Complete |
| Frontend deployed on Render via Docker Hub image | ✅ Complete |
| Managed PostgreSQL configured on Render | ✅ Complete |
| `render.yaml` blueprint configured | ✅ Complete |
| GitHub repo connected to Render Blueprint | ✅ Complete |
| Auto-redeploy triggered on `git push` | ✅ Complete |

---

## References

- Docker Documentation: https://docs.docker.com/
- Render Documentation: https://render.com/docs
- Render Blueprint Spec: https://render.com/docs/blueprint-spec
- Render Environment Variables: https://render.com/docs/configure-environment-variables
- Docker Build and Push: https://docs.docker.com/get-started/introduction/build-and-push-first-image/