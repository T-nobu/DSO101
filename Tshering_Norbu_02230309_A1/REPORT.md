# Assignment 1 Report 

---
## What I did

I built a full-stack To-Do app (React frontend + Node.js/Express backend) and deployed it using Docker and Render.

**Part 0 — Application**
- Backend: REST API for tasks (GET, POST, PUT, DELETE) with SQLite
- Frontend: React UI that talks to the API through `REACT_APP_API_URL`
- Each part has its own `Dockerfile` and `.dockerignore`

**Part A — Docker Hub**
- Logged into Docker Hub and built images for backend and frontend
- Tagged images as `tnobu/be-todo:02230309` and `tnobu/fe-todo:02230309`
- Pushed both images to my public Docker Hub account
- Confirmed both repositories appear on hub.docker.com

**Part B — Render deployment**
- Created a PostgreSQL database on Render for production data
- Deployed backend from the Docker image (port 5000, DB env vars set in Render)
- Deployed frontend from its image (port 80, API URL pointing to backend)
- Used `render.yaml` so future pushes can redeploy from GitHub

  

---

## Challenges

- **CORS errors:** Frontend could not call the API until I added the Render URLs to the backend CORS list.  
- **Environment variables:** `.env` files must stay out of Git; I configured secrets only on Render.  
- **Image tags:** I had to use the exact tag Render expects (`02230309`), not only `latest`.

---

## What I learned

- How Docker packages an app so it runs the same everywhere  
- Difference between building locally vs pulling a pre-built image on Render  
- How frontend and backend connect in production using env vars  

---

## Links

| Item | URL |
|------|-----|
| Repository | https://github.com/T-nobu/DSO101 |
| Backend (Render) | https://be-todo.onrender.com |
| Frontend (Render) | https://fe-todo.onrender.com |
| Docker Hub | https://hub.docker.com/u/tnobu |
