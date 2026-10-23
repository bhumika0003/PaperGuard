# SecureStack - Single Docker Container Deployment

## ✅ Setup Complete

Your application is now configured to run **both frontend and backend services in a single Docker image container**.

### 📋 What Was Done

1. **Created a Unified Dockerfile** (`/Dockerfile`)
   - Uses `node:22-slim` base image
   - Installs PM2 (process manager) to run multiple services
   - Copies both frontend and backend code
   - Installs dependencies for both services
   - Configures ecosystem.config.js to manage both services

2. **Updated docker-compose.yml**
   - Single app service using the new unified Dockerfile
   - PostgreSQL database service for data storage
   - Proper networking between services
   - Environment variables configured for PostgreSQL connection
   - Port mappings:
     - **Frontend**: `8000:3000` (localhost:8000)
     - **Backend**: `8001:7000` (localhost:8001)
     - **Database**: `5432:5432` (localhost:5432)

3. **Fixed Issues**
   - Resolved Vite permission issues
   - Fixed sqlite3 native module conflicts by removing it (using PostgreSQL instead)
   - Added 10-second delay for backend startup to ensure PostgreSQL is ready
   - Used PM2 for reliable process management

### 🚀 Quick Start

#### Run the Application
```bash
cd /Users/snehankitjanardanchikhalekar/Documents/DevOps_vap
docker-compose up -d
```

#### Stop the Application
```bash
docker-compose down
```

#### Stop with Volume Cleanup
```bash
docker-compose down --volumes
```

#### View Logs
```bash
docker-compose logs -f
```

#### View Process Status
```bash
docker exec securestack-app pm2 list
```

### 🌐 Access the Application

**Frontend (React + Vite):**
- URL: http://localhost:8000
- The complete user interface for SecureStack

**Backend API:**
- URL: http://localhost:8001
- Express.js REST API server
- Port: 7000 (inside container), 8001 (host)

**Database:**
- PostgreSQL running in separate container
- Host: localhost
- Port: 5432
- Username: postgres
- Password: bhumi0309
- Database: securestack

### 🔐 Demo Login Credentials

**Teacher:**
- Email: `rutuja@university.edu`
- Password: `Rutu#13`

**HOD (Head of Department):**
- Email: `pandit@university.edu`
- Password: `Pandit#1`

**Principal:**
- Email: `madhavi@university.edu`
- Password: `Madhavi!1`

**Exam Controller:**
- Email: `abc@university.edu`
- Password: `Abc123!!`

### 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     securestack-app                         │
│                    (Single Docker Image)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐              ┌──────────────┐             │
│  │  Frontend    │              │   Backend    │             │
│  │  (Vite Dev)  │              │  (Express)   │             │
│  │  Port: 3000  │              │  Port: 7000  │             │
│  └──────────────┘              └──────────────┘             │
│        │                               │                    │
│        └───────────────────────────────┘                    │
│                      │                                      │
│               ┌──────▼──────┐                               │
│               │  PostgreSQL  │                              │
│               │  Port: 5432  │                              │
│               └──────────────┘                              │
│                                                             │
│  Managed by: PM2 (Process Manager)                          │
│  - backend-wait (delayed start, 10s)                        │
│  - frontend                                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ▼
            Host Machine Ports
            ├─ 8000 (Frontend)
            ├─ 8001 (Backend)
            └─ 5432 (Database)
```

### ✨ Key Features

- **Single Container Deployment**: Both frontend and backend run in one Docker image
- **Process Management**: PM2 automatically manages and restarts services if they crash
- **Database Integration**: PostgreSQL runs in a separate container with persistent volumes
- **Hot Reload Ready**: Frontend uses Vite dev server for fast development
- **Auto-initialization**: Database and tables are created automatically on startup
- **Network Isolation**: Services communicate via Docker network bridge

### 🔧 Configuration Files

**Dockerfile** - Builds the unified image with both services
**docker-compose.yml** - Orchestrates containers and services
**ecosystem.config.js** - PM2 configuration inside the container

### 📝 Environment Variables

Set in `docker-compose.yml` for the app service:

```yaml
DB_DIALECT: postgres
DB_HOST: postgres
DB_PORT: 5432
DB_USER: postgres
DB_PASS: bhumi0309
DB_NAME: securestack
NODE_ENV: development
PORT: 7000
```

### 🐛 Troubleshooting

**Backend not connecting to PostgreSQL:**
- Check that PostgreSQL container is running: `docker ps`
- Wait 15-20 seconds after starting for full initialization
- Check logs: `docker-compose logs securestack-app`

**Frontend not loading:**
- Check if port 8000 is available
- View frontend logs: `docker-compose logs securestack-app | grep frontend`
- Access http://localhost:8000 in browser

**Port already in use:**
```bash
# Kill process on port 8000 (frontend)
lsof -ti:8000 | xargs kill -9

# Kill process on port 8001 (backend)
lsof -ti:8001 | xargs kill -9

# Then restart containers
docker-compose up -d
```

**Database not initializing:**
- Remove volumes and restart: `docker-compose down --volumes && docker-compose up -d`
- Wait 30-40 seconds for full initialization
- Check database logs: `docker-compose logs securestack-db`

### 📦 Docker Commands Reference

```bash
# Build image
docker-compose build

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs (real-time)
docker-compose logs -f

# Rebuild and restart
docker-compose up --build -d

# Clean up volumes
docker-compose down --volumes

# Check container status
docker ps

# Access container shell
docker exec -it securestack-app sh

# View PM2 process list
docker exec securestack-app pm2 list

# Restart a service
docker exec securestack-app pm2 restart backend-wait
docker exec securestack-app pm2 restart frontend
```

### ✅ Verification Checklist

After running `docker-compose up -d`, verify:

- [ ] Two containers running: `docker ps` shows `securestack-app` and `securestack-db`
- [ ] Both PM2 services online: `docker exec securestack-app pm2 list`
- [ ] Frontend loads: Open http://localhost:8000
- [ ] Backend responds: `curl http://localhost:8001`
- [ ] Database connected: Check logs for "Connected successfully to POSTGRESQL"

---

**Created**: 2026-10-04
**System**: Docker Compose with PM2 Process Manager
