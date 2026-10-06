# Lumina LMS 🌟

Lumina is a modern, community-driven Learning Management System (LMS) built with non-linear order-free learning paths and a real-time communication layer.

---

## 📁 Repository Structure

```text
Lumina_app/
├── lumina-backend/               # Node.js + Express + Sequelize + PostgreSQL + Socket.io
│   ├── src/                      # Backend controllers, models, routes, middlewares, sockets
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── migrations/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── sockets/
│   │   ├── utils/
│   │   ├── app.js
│   │   ├── server.js
│   │   └── swagger.js
│   ├── .env
│   ├── .sequelizerc
│   ├── Dockerfile
│   └── package.json
│
├── lumina-frontend/              # Next.js 16 (Turbopack) + TypeScript + React 19 + Tailwind CSS
│   ├── src/
│   │   ├── app/                  # App Router pages (19 full routes)
│   │   ├── components/           # UI, layout, courses, chat, learning components
│   │   ├── hooks/                # TanStack React Query hooks
│   │   ├── lib/                  # Axios & Socket.io client configuration
│   │   ├── providers/            # AuthProvider & QueryProvider
│   │   ├── services/             # Centralized API service layer
│   │   └── types/                # TypeScript interfaces & DTOs
│   ├── .env.local
│   └── package.json
│
├── Lumina_LMS_Frontend_Specification.md
├── lumina_lms_full_api_documentation.md
├── CHAT_TESTING_GUIDE.MD
└── package.json                  # Root Monorepo Scripts
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### 2. Run Backend (Port 3000 / 5000)
```bash
# From root directory:
npm run dev:backend

# Or directly in lumina-backend:
cd lumina-backend
npm run dev
```

### 3. Run Frontend (Port 3000 / 3001)
```bash
# From root directory:
npm run dev:frontend

# Or directly in lumina-frontend:
cd lumina-frontend
npm run dev
```

---

## 🛠️ Tech Stack

### Frontend (`lumina-frontend`)
- **Framework:** Next.js 16 + React 19 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Lucide Icons
- **State & Data:** TanStack Query v5 + Axios
- **Real-Time:** Socket.io Client
- **Forms & Validation:** React Hook Form + Zod

### Backend (`lumina-backend`)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Real-time:** Socket.io (Handshake authentication, room chat, DMs, presence, live typing)
- **Database:** PostgreSQL with Sequelize ORM
- **Security:** JWT, Helmet, Rate limiting, CORS, Bcrypt
- **API Documentation:** Swagger UI (`/api-docs`)
