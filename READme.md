# SecureStack – Secure Question Paper Management & Leak Prevention System

> **"Secure Every Paper. Trace Every Action."**

SecureStack is a modern, secure, and college-grade web application to govern question paper creation, sharing, auditing, and leak tracing for educational institutions.

---
## 🚀 Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Axios, Lucide React, Socket.IO Client.
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Multer, Socket.IO.
- **Database**: SQL Relational Database (PostgreSQL databased used/SQLite).

---

## 🛠️ Project Structure
```text
SecureStack/
project/
|
├── frontend/
| |__Dockerfile
|
├── backend/
| |__Dockerfile       #push the Docker image
|
├──docker-compose.yml
|   │
|   └──────────┬─────────────┐
│                ↓             ↓
│           Frontend        Backend Container
│           Container       (port 7000)
│             ↓
│           Frontend
│           Container
│           (port 3000)
|
└── README.md

```
```
                 docker-compose.yml
                       │
             ┌─────────┴─────────┐
             ↓                   ↓
     frontend/Dockerfile   backend/Dockerfile
             ↓                   ↓
     Frontend Image        Backend Image
             ↓                   ↓
     Frontend Container    Backend Container
          :3000                 :7000
             └─────────┬─────────┘
                       ↓
                 Docker Network
```

```
## 💻 Setup and Installation

### Option 1: Running with Docker (Recommended)
Make sure you have Docker installed, then run:
```bash
docker-compose up --build
```
Or directly using Docker CLI:
```bash
docker build -t securestack-app .
docker run -p 5000:3000 securestack-app
```
- **Web App**: Open `http://localhost:3000/` in your browser to access the complete application.

---

### Option 2: Running Locally Without Docker

#### 1. Setup Backend
Open a terminal in the `/backend` folder:
```bash
cd backend
npm install
npm start server.js
```
*The database file `secure_paper_db` will be created automatically, and the server will listen on port `7000`.*

#### 2. Setup Frontend
Open a second terminal in the `/frontend` folder:
```bash
cd frontend
npm install         --legacy-peer-deps
npm run dev
```
*Open `http://localhost:3000/` in your web browser to access the portal.*

---

## 🔑 Demo Login Profiles

1. **Teacher**:
   - Email: `teacher@securestack.com [rutuja@university.edu]`
   - Password: `password123 [Rutu#13]`
   - Role: `Teacher` (uploads and shares papers)

2. **HOD (Head of Department)**:
   - Email: `hod@securestack.com [pandit@university.edu]`
   - Password: `password123 [Pandit#1]`
   - Role: `HOD [IT]` (monitors teachers, view shared papers)

3. **Principal**:
   - Email: `principal@securestack.com [madhavi@university.edu]`
   - Password: `password123 [Madhavi!1]`
   - Role: `Principal` (global audit and timeline traceability)

4. **Exam Controller**
    - Email: `examcont@securestack.com [abc@university.edu]`
    -Password: `password123 [Abc123!!]`
    -Role: `Exam Head` (global viewer and data handling) 