# SangayWangchuk_02250367_DSO101_A1

# DSO101 – Assignment I: CI/CD Lab Report
  
**Student Name:** Sangay Wangchuk  
**Student ID:** 02250367  

## 1. Introduction

This lab report documents the steps taken to complete Assignment I for DSO101 -Continuous Integration and Continuous Deployment. The assignment is split into three parts:

- **Step 0 (Prerequisite):** Build a full-stack To-Do List web application with a React frontend, Node.js/Express backend, and PostgreSQL database.
- **Part A:** Manually build Docker images, push them to Docker Hub, and deploy them as services on Render.com using pre-built images.
- **Part B:** Set up automated image builds and deployments triggered by every new Git commit using a `render.yaml` Blueprint file.

## 2. Step 0 – Prerequisites & Application Setup

### 2.1 Tech Stack

| Layer    | Technology        | Purpose                        |
|----------|-------------------|--------------------------------|
| Frontend | React.js          | Browser UI for task management |
| Backend  | Node.js + Express | RESTful CRUD API               |
| Database | PostgreSQL        | Persistent task storage        |

### 2.2 Application Features

- Add, edit, mark complete, and delete tasks via the UI.
- Backend exposes REST endpoints: `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`.
- Full environment variable configuration for both frontend and backend.

### 2.3 Environment Variable Configuration

Two separate `.env` files were created locally and **never committed to Git**.

**`backend/.env`**
```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=tododb
PORT=5000
```

**`frontend/.env`**
```env
REACT_APP_API_URL=http://localhost:5000
```

Both files were added to `.gitignore` before the first commit:

```gitignore
.env
.env.local
.env.production
node_modules/
```

### 2.4 GitHub Repository Setup & Personal Access Token

To push the project to GitHub, a Personal Access Token (PAT) was generated under **GitHub → Settings → Developer Settings → Personal Access Tokens (Classic)**. The `repo` scope was selected to allow full repository access.

![GitHub Personal Access Token setup](screenshots/1.png)

The repository was then initialised and pushed:

```bash
git init
git add .
git commit -m "initial commit: todo-app"
git remote add origin https://github.com/SWangchuk676/SangayWangchuk_02250367_DSO101_A1.git
git push -u origin main
```

### 2.5 Final GitHub Repository Structure

After completing the setup, the repository on GitHub contained the following files:

![GitHub repository showing todo-app, .gitignore, README.md and render.yaml](screenshots/2.png)

---

## 3. Part A – Docker Image Build, Push & Render Deployment

### 3.1 Writing Dockerfiles

#### Backend Dockerfile (`backend/Dockerfile`)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

**Key decisions:**
- `node:18-alpine` keeps the image size minimal.
- Copying `package*.json` before source code enables Docker layer caching — `npm install` only re-runs when dependencies change.

#### Frontend Dockerfile (`frontend/Dockerfile`)

```dockerfile
# Stage 1 – Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2 – Serve
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Key decisions:**
- Multi-stage build: the first stage compiles the React app; the second serves the static output via Nginx, producing a much smaller final image.

---

### 3.2 Building and Tagging Images

Images were tagged using the student ID `02250367` as specified in the assignment.

```bash
# Build backend image
docker build -t swangchuk/be-todo:02250367 ./backend

# Build frontend image
docker build -t swangchuk/fe-todo:02250367 ./frontend
```

---

### 3.3 Pushing Images to Docker Hub

```bash
docker login
docker push swangchuk/be-todo:02250367
docker push swangchuk/fe-todo:02250367
```

---

### 3.4 Deploying to Render.com

#### 3.4.1 Creating a New Web Service

On the Render dashboard, clicked **New** to access the service creation menu, which shows all available service types including **Web Service**, **Postgres**, and **Blueprint**.

![Render new service menu showing Web Service, Postgres, Blueprint options](screenshots/3.png)

---

#### 3.4.2 Selecting Existing Image from Docker Hub

For both the backend and frontend services, selected **New → Web Service** then clicked the **Existing Image** tab and entered the Docker Hub image URL.

![Render New Web Service screen with Existing Image tab selected](screenshots/4.png)

---

#### 3.4.3 Configuring Backend Environment Variables

After connecting the backend image (`swangchuk/be-todo:02250367`), the following environment variables were added in the Render dashboard. Sensitive values (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT) were masked for security.

![Render environment variables panel showing DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT and PORT=5000](screenshots/5.png)

---

#### 3.4.4 Backend Service – Live

The backend service `be-todo:02250367` was successfully deployed and is showing **Live** status. The service is reachable at `https://be-todo-02250367.onrender.com`. Startup logs confirm the service initialised correctly and environment variables were injected from `.env`.

![Render backend service be-todo live with startup logs](screenshots/6.png)

---

#### 3.4.5 Frontend Service – Live

The frontend service `fe-todo:02250367` was also deployed and is showing **Live** status at `https://fe-todo-02250367.onrender.com`. Nginx worker processes started successfully as shown in the logs.

![Render frontend service fe-todo live with Nginx worker logs](screenshots/7.png)

---

#### 3.4.6 Database – PostgreSQL Setup

A managed PostgreSQL database was provisioned via **New → Postgres**. The **Free** tier was selected (256 MB RAM, 0.1 CPU, 1 GB Storage, $0/month).

![Render PostgreSQL plan options with Free tier selected](screenshots/8.png)

Clicked **Create Database** to confirm the free-tier instance.

![Render Create Database confirmation with Monthly Total showing Free instance](screenshots/9.png)

The database credentials were then copied from the Render PostgreSQL dashboard and pasted as environment variables into the backend service.

![Render PostgreSQL dashboard showing hostname, port, database name, username and masked credentials](screenshots/10.png)

---

### 3.5 Part A Outcome

Both services (`be-todo` and `fe-todo`) were successfully deployed on Render.com using pre-built Docker Hub images. The backend was confirmed live at `https://be-todo-02250367. on render.com` and the frontend at `https://fe-todo-02250367.onrender.com`. All CRUD operations were verified to work correctly against the live PostgreSQL database.

---

## 4. Part B – Automated CI/CD with render.yaml

### 4.1 Repository Structure

The repository was organised as follows to support multi-service Blueprint deployment:

```
SangayWangchuk_02250367_DSO101_A1/
├── todo-app/
│   ├── backend/
│   │   ├── node_modules/
│   │   ├── .env
│   │   ├── .gitignore
│   │   ├── db.js
│   │   ├── Dockerfile
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   └── server.js
│   └── frontend/
│       ├── node_modules/
│       ├── public/
│       ├── src/
│       ├── .env
│       ├── .env.production
│       ├── .gitignore
│       ├── Dockerfile
│       ├── package-lock.json
│       └── package.json
├── screenshots/
├── render.yaml
└── README.md
```

---

### 4.2 render.yaml Configuration

The `render.yaml` file acts as an Infrastructure-as-Code manifest, telling Render how to build and deploy all services automatically on every Git push.

```yaml
services:
  - type: web
    name: be-todo
    env: docker
    plan: free
    dockerfilePath: ./backend/Dockerfile
    envVars:
      - key: DB_HOST
        value: dpg-d81o3mt0lvsc739pa6ig-a
      - key: DB_USER
        value: todo_db_f8y6_user
      - key: DB_PASSWORD
        value: LSf0JcvGDZ3ugW8koNzRHs5rYEyFRraK
      - key: DB_NAME
        value: todo_db_f8y6
      - key: DB_PORT
        value: 5432
      - key: PORT
        value: 5000

  - type: web
    name: fe-todo
    env: docker
    plan: free
    dockerfilePath: ./frontend/Dockerfile
    envVars:
      - key: REACT_APP_API_URL
        value: https://be-todo.onrender.com
```

> **Note:** `render.yaml` is conceptually similar to `docker-compose.yml` but targets cloud deployment on Render. Unlike `docker-compose.yml` which orchestrates containers locally, `render.yaml` instructs Render to build images from source on every git push and deploy them automatically.

---

### 4.3 Connecting the Repository to Render via Blueprint

**Steps taken:**

1. On the Render dashboard, selected **New → Blueprint**.
2. Connected the GitHub account (`SWangchuk676`) and selected the repository `SangayWangchuk_02250367_DSO101_A1`.
3. Render automatically detected `render.yaml` and listed both services to be created.
4. Confirmed the Blueprint deployment.

The Blueprint synced successfully from the `main` branch. The dashboard shows **"Resources already up to date"** confirming the services match the `render.yaml` specification.

![Render Blueprint dashboard showing todo-app blueprint synced successfully from SWangchuk676/SangayWangchuk_02250367_DSO101_A1 on main branch](screenshots/11.png)

---

### 4.4 Testing Automated Deploys

To verify the automated deployment pipeline, a small code change was committed and pushed:

```bash
git add .
git commit -m "Add .gitignore to exclude node_modules"
git push origin main
```

Render detected the new commit via the GitHub webhook, automatically rebuilt the Docker images from the updated source, and redeployed both services.

---

### 4.5 render.yaml vs docker-compose.yml

| Aspect       | docker-compose.yml                 | render.yaml                          |
|--------------|------------------------------------|--------------------------------------|
| Environment  | Local / on-premise                 | Cloud (Render.com)                   |
| Purpose      | Orchestrate containers locally     | Define cloud services for auto-deploy|
| Image builds | `docker build` runs locally        | Render builds on each git push       |
| Networking   | Internal Docker bridge network     | Render-managed networking            |
| Secrets      | Local `.env` files                 | Render dashboard / `envVars` block   |
| Trigger      | Manual (`docker-compose up`)       | Automatic on every `git push`        |

---

## 5. Challenges & Troubleshooting

### 5.1 Render Blueprint Requires Payment Information

**Problem:** When setting up the Blueprint (Part B), Render displayed a **"Payment Information Required"** screen even though the Free tier was selected. This was unexpected as all services used the free plan.  
**Solution:** Added a valid card for the $1 temporary verification as required by Render. No actual charge was made. This is a Render policy for Blueprint deployments regardless of the instance type chosen.

---

### 5.2 Risk of Committing .env Files

**Problem:** There was a risk of accidentally pushing `.env` files containing database credentials to GitHub.  
**Solution:** Added `.env`, `.env.local`, `.env.production`, and `node_modules/` to `.gitignore` before the first commit. Audited the staging area with `git status` to confirm no sensitive files were tracked.

---

### 5.3 Free Tier Spin-Down Delay

**Problem:** Render's free tier suspends inactive services, causing a ~50-second cold start delay on the first request after inactivity (as warned in the Render dashboard banner).  
**Solution:** Accepted as a known free-tier limitation for this assignment. In a production scenario, a paid plan or an external uptime monitor would keep the service warm.

---

### 5.4 Docker Layer Caching

**Problem:** Initial builds were slow because every source file change caused `npm install` to re-run.  
**Solution:** Restructured the Dockerfile to copy `package*.json` and run `npm install` before copying the rest of the source. This caches the dependency layer and only invalidates it when `package.json` actually changes.

---

## 6. Conclusion

This assignment provided end-to-end experience with a modern CI/CD workflow. The key skills practised were:

- Writing optimised, multi-stage Dockerfiles for both frontend and backend services.
- Publishing versioned Docker images to Docker Hub using a student ID (`02250367`) as the image tag.
- Deploying pre-built container images to Render.com manually (Part A).
- Implementing fully automated deployments using `render.yaml` Blueprint that rebuild and redeploy on every `git push` (Part B).
- Managing environment-specific configuration securely using `.env` files and Render's cloud environment variable store.

The automated pipeline in Part B represents a significant improvement over the manual workflow in Part A — it eliminates human error from the release process and ensures the live environment always reflects the latest state of the `main` branch. This is the foundation of modern Continuous Deployment.

---

## 7. References

- Docker Documentation – Build and push your first image: https://docs.docker.com/get-started/introduction/build-and-push-first-image/
- Render Documentation – Deploying an Image: https://render.com/docs/deploying-an-image
- Render Documentation – Blueprint Specification: https://render.com/docs/blueprint-spec
- Render Documentation – Configure Environment Variables: https://render.com/docs/configure-environment-variables
- GitHub Documentation – Publishing Docker Images: https://docs.github.com/en/actions/publishing-packages/publishing-docker-images
- The Twelve-Factor App – Config: https://12factor.net/config