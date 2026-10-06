# Lumina LMS 🌟

Lumina is a modern, community-driven Learning Management System (LMS) with non-linear, order-free learning paths and a real-time communication layer (course rooms, DMs, presence, typing indicators).

This repository is a **monorepo** containing:

| Package | Path | Stack | Default Port |
|---|---|---|---|
| **API / Realtime server** | [`lumina-backend/`](lumina-backend) | Node.js (ESM), Express 4, Sequelize 6, PostgreSQL, Socket.IO 4 | `3000` (via `PORT`) |
| **Web client** | [`lumina-frontend/`](lumina-frontend) | Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4 | `3000` (Next default) |

> [!IMPORTANT]
> Both apps default to port **3000**. When running locally, set the backend `PORT` to something else (e.g. `8000`) so it matches the frontend's `NEXT_PUBLIC_API_URL`. See [Environment Variables](#-environment-variables).

---

## 📑 Table of Contents

- [Architecture](#-architecture)
- [Repository Structure](#-repository-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start (Local Development)](#-quick-start-local-development)
- [Environment Variables](#-environment-variables)
- [Database & Migrations](#-database--migrations)
- [Available Scripts](#-available-scripts)
- [API & Realtime Reference](#-api--realtime-reference)
- [DevOps: Build & Deployment](#-devops-build--deployment)
- [Production Checklist](#-production-checklist)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Further Documentation](#-further-documentation)

---

## 🏗 Architecture

```mermaid
flowchart LR
    U[Browser] -->|HTTPS| FE["lumina-frontend (Next.js)"]
    FE -->|REST /api| BE["lumina-backend (Express)"]
    FE <-->|WebSocket| WS["Socket.IO (same process as API)"]
    BE --> DB[(PostgreSQL)]
    WS --> DB
    BE -->|Transactional email| RS[Resend]
    BE -->|Payments + webhook| PS[Paystack]
```

- **REST API** is mounted at `/api`.
- **Socket.IO** runs on the same HTTP server/port as the API and authenticates via a JWT during handshake.
- **Health check**: `GET /health`
- **Swagger docs**: `GET /api/docs` (UI) and `GET /api/docs.json` (OpenAPI spec)

---

## 📁 Repository Structure

```text
Lumina_app/
├── lumina-backend/
│   ├── src/
│   │   ├── config/database.cjs     # Sequelize DB config (development / test / production)
│   │   ├── controllers/            # Route handlers (auth, courses, lessons, chat, payments, admin…)
│   │   ├── middlewares/            # JWT auth, rate limiter
│   │   ├── migrations/             # Sequelize migrations (*.cjs)
│   │   ├── models/                 # Sequelize models
│   │   ├── routes/                 # Express routers, mounted under /api
│   │   ├── sockets/chatHandler.js  # Socket.IO auth + chat events
│   │   ├── utils/                  # Auth helpers, email service (Resend)
│   │   ├── app.js                  # Express app (middleware, routes, swagger, /health)
│   │   ├── server.js               # HTTP + Socket.IO bootstrap (entry point)
│   │   └── swagger.js              # OpenAPI spec
│   ├── .env.production.example     # Template for production env vars
│   ├── .sequelizerc                # Points sequelize-cli at src/
│   ├── dockerfile
│   └── package.json
│
├── lumina-frontend/
│   ├── src/
│   │   ├── app/                    # App Router pages
│   │   ├── components/             # UI, layout, courses, chat, learning, route guards
│   │   ├── hooks/                  # TanStack Query hooks
│   │   ├── lib/                    # Axios client & utilities
│   │   ├── providers/              # Auth, Query, Socket, Toast providers
│   │   ├── services/               # API service layer
│   │   └── types/                  # Shared TS types / DTOs
│   ├── dockerfile
│   └── package.json
│
├── docker-compose.yaml
├── package.json                    # Root convenience scripts
├── lumina_lms_full_api_documentation.md
├── Lumina_LMS_Frontend_Specification.md
├── CHAT_TESTING_GUIDE.MD
├── PROJECT.MD
└── flutter_mobile_prd.md
```

---

## ✅ Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | **20 LTS or newer** | Required by Next.js 16 / React 19 |
| npm | 10+ | Ships with Node 20 |
| PostgreSQL | 14+ | Local install or Docker |
| Git | any recent | |
| Docker + Compose | optional | For containerised dev / deployment |

Optional third-party accounts:
- **[Resend](https://resend.com)** – email verification & transactional email
- **[Paystack](https://paystack.com)** – course payments

---

## 🚀 Quick Start (Local Development)

### 1. Clone & install

```bash
git clone <repo-url> Lumina_app
cd Lumina_app
npm run install:all
```

### 2. Start PostgreSQL

Use a local install, or spin one up with Docker:

```bash
docker run -d --name lumina-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lumina_db \
  -p 5432:5432 postgres:16-alpine
```

### 3. Configure environment

Create `lumina-backend/.env` (see [full reference](#backend-lumina-backendenv)):

```env
PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lumina_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_DIALECT=postgres
JWT_SECRET=change-me-to-a-long-random-string
APP_URL=http://localhost:3000
```

Create `lumina-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

### 4. Run database migrations

```bash
cd lumina-backend
npx sequelize-cli db:migrate
cd ..
```

### 5. Run both apps (two terminals)

```bash
# Terminal 1 – API + Socket.IO  → http://localhost:8000
npm run dev:backend

# Terminal 2 – Web client       → http://localhost:3000
npm run dev:frontend
```

### 6. Verify

| Check | URL |
|---|---|
| API health | http://localhost:8000/health |
| Swagger UI | http://localhost:8000/api/docs |
| Frontend | http://localhost:3000 |

---

## 🔐 Environment Variables

> [!CAUTION]
> Never commit real `.env` / `.env.local` files. Keep secrets in your secret manager (GitHub Actions secrets, Vault, AWS SSM, Doppler, etc.).

### Backend (`lumina-backend/.env`)

| Variable | Required | Example | Description |
|---|---|---|---|
| `NODE_ENV` | prod | `production` | Selects the Sequelize config block and production behaviour |
| `PORT` | ✅ | `8000` | HTTP + Socket.IO port (defaults to `3000`) |
| `DB_HOST` | dev | `localhost` | Postgres host (development config) |
| `DB_PORT` | dev | `5432` | Postgres port |
| `DB_NAME` | dev | `lumina_db` | Database name |
| `DB_USER` | dev | `postgres` | Database user |
| `DB_PASSWORD` | dev | `postgres` | Database password |
| `DB_DIALECT` | dev | `postgres` | Always `postgres` |
| `DATABASE_URL` | prod | `postgresql://user:pass@host:5432/lumina_db` | Used **only** when `NODE_ENV=production` |
| `DB_SSL` | prod | `true` | Enables SSL for managed Postgres (RDS, Supabase, Neon, Render…) |
| `JWT_SECRET` | ✅ | random 64+ chars | Signs auth tokens (REST + Socket.IO handshake) |
| `ADMIN_SECRET_KEY` | ✅ | random string | Required to create/elevate admin accounts |
| `APP_URL` | ✅ | `https://yourdomain.com` | Frontend URL used in email links (e.g. verification) |
| `MOBILE_REDIRECT_SCHEME` | optional | `lumina://` | Deep-link scheme for the mobile app |
| `RESEND_API_KEY` | for email | `re_xxx` | Resend API key |
| `RESEND_FROM_EMAIL` | for email | `Lumina <noreply@yourdomain.com>` | Sender address (domain must be verified in Resend) |
| `PAYSTACK_SECRET_KEY` | for payments | `sk_live_xxx` | Paystack secret key (also verifies webhooks) |
| `RATE_LIMIT_WINDOW_MS` | optional | `900000` | Rate-limit window in ms |
| `RATE_LIMIT_MAX` | optional | `100` | Max requests per window per IP |
| `TRUST_PROXY` | behind LB | `1` | Set when behind a reverse proxy / load balancer so client IPs (rate limiting) are correct |

A production template is provided at [`lumina-backend/.env.production.example`](lumina-backend/.env.production.example).

### Frontend (`lumina-frontend/.env.local`)

| Variable | Required | Example | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | `https://api.yourdomain.com/api` | Base URL for REST calls (must include `/api`) |
| `NEXT_PUBLIC_SOCKET_URL` | ✅ | `https://api.yourdomain.com` | Socket.IO server origin (no `/api`) |

> [!WARNING]
> `NEXT_PUBLIC_*` variables are **inlined at build time**. Changing them requires rebuilding the frontend (`npm run build`) or Docker image.

---

## 🗄 Database & Migrations

Migrations live in `lumina-backend/src/migrations` and are run with `sequelize-cli` (configured via `.sequelizerc`). Run all commands from `lumina-backend/`.

```bash
# Apply all pending migrations
npx sequelize-cli db:migrate

# Undo the most recent migration
npx sequelize-cli db:migrate:undo

# Undo all migrations (⚠️ destroys data)
npx sequelize-cli db:migrate:undo:all

# Check migration status
npx sequelize-cli db:migrate:status

# Create a new migration (rename the generated .js → .cjs, since the package is ESM)
npx sequelize-cli migration:generate --name add-something
```

In production, set `NODE_ENV=production` and `DATABASE_URL` before running migrations:

```bash
NODE_ENV=production DATABASE_URL=postgresql://... npx sequelize-cli db:migrate
```

> [!TIP]
> Run migrations as a separate **release/pre-deploy step** (or init container), not on every app start, to avoid race conditions with multiple replicas.

---

## 📜 Available Scripts

### Root (`/package.json`)

| Command | Description |
|---|---|
| `npm run install:all` | Install backend + frontend dependencies |
| `npm run install:backend` / `install:frontend` | Install one package |
| `npm run dev` / `dev:backend` | Start backend with nodemon (hot reload) |
| `npm run dev:frontend` | Start Next.js dev server |
| `npm run build:frontend` | Production build of the frontend |
| `npm run start:backend` | Start backend with Node (production mode) |
| `npm run start:frontend` | Serve the built frontend |

### Backend (`lumina-backend/`)

| Command | Description |
|---|---|
| `npm run dev` | `nodemon src/server.js` |
| `npm start` | `node src/server.js` |

### Frontend (`lumina-frontend/`)

| Command | Description |
|---|---|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |

---

## 📡 API & Realtime Reference

- **Interactive docs:** `/api/docs` (Swagger UI)
- **OpenAPI JSON:** `/api/docs.json` (import into Postman/Insomnia)
- **Full written reference:** [lumina_lms_full_api_documentation.md](lumina_lms_full_api_documentation.md)
- **Realtime chat testing:** [CHAT_TESTING_GUIDE.MD](CHAT_TESTING_GUIDE.MD)

Main route groups (all under `/api`): `auth`, `courses`, `lessons`, `enrollments`, `chat`, `instructor`, `payments`, `admin`.

**Payments webhook:** `POST /api/payments/webhook` receives the **raw** request body (required for signature verification). Make sure any proxy/CDN in front of the API does not modify the body.

**Socket.IO:** connect to `NEXT_PUBLIC_SOCKET_URL` and pass the JWT in the handshake `auth` payload. Your load balancer must support **WebSocket upgrades** (see below).

---

## 🐳 DevOps: Build & Deployment

> [!NOTE]
> `docker-compose.yaml`, `lumina-backend/dockerfile` and `lumina-frontend/dockerfile` exist as placeholders but are currently **empty**. The reference configurations below are recommended starting points.

### Backend Dockerfile (reference)

```dockerfile
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 8000
HEALTHCHECK CMD wget -qO- http://localhost:${PORT:-8000}/health || exit 1
CMD ["node", "src/server.js"]
```

> `bcrypt` is a native module — build the image on the same OS/arch as you run it (or use `--platform`).

### Frontend Dockerfile (reference)

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "start"]
```

### docker-compose (reference)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: lumina_db
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 10

  backend:
    build: ./lumina-backend
    env_file: ./lumina-backend/.env
    environment:
      PORT: 8000
      DB_HOST: postgres
    ports: ["8000:8000"]
    depends_on:
      postgres: { condition: service_healthy }

  frontend:
    build:
      context: ./lumina-frontend
      args:
        NEXT_PUBLIC_API_URL: http://localhost:8000/api
        NEXT_PUBLIC_SOCKET_URL: http://localhost:8000
    ports: ["3000:3000"]
    depends_on: [backend]

volumes:
  pgdata:
```

```bash
docker compose up -d --build
docker compose exec backend npx sequelize-cli db:migrate
```

### Reverse proxy / load balancer notes

- Forward `Upgrade` and `Connection` headers so Socket.IO WebSockets work.
- When running **multiple backend replicas**, enable **sticky sessions** or add a Socket.IO adapter (e.g. Redis) — otherwise realtime events won't reach all clients.
- Set `TRUST_PROXY=1` so rate limiting sees the real client IP.

Example Nginx block:

```nginx
location / {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Suggested CI pipeline

1. `npm ci` in each package
2. `npm run lint` + `npx tsc --noEmit` (frontend)
3. `npm run build` (frontend)
4. Build & push Docker images
5. Run `sequelize-cli db:migrate` against the target DB
6. Deploy; gate on `GET /health` returning `200`

---

## 🧾 Production Checklist

- [ ] `NODE_ENV=production`, `DATABASE_URL` set, `DB_SSL=true` for managed Postgres
- [ ] Strong, unique `JWT_SECRET` and `ADMIN_SECRET_KEY`
- [ ] CORS restricted (currently `cors()` and Socket.IO `origin: '*'` allow all origins — lock down to your frontend domain)
- [ ] `TRUST_PROXY` set when behind a load balancer
- [ ] Resend sending domain verified; `RESEND_FROM_EMAIL` uses it
- [ ] Paystack live keys + webhook URL configured to `https://<api-host>/api/payments/webhook`
- [ ] Frontend rebuilt with production `NEXT_PUBLIC_*` values
- [ ] Migrations run before the new version takes traffic
- [ ] DB backups and log aggregation configured
- [ ] WebSocket upgrades + sticky sessions enabled on the load balancer

---

## 🛠 Troubleshooting

| Symptom | Likely Cause / Fix |
|---|---|
| `EADDRINUSE :3000` | Backend and frontend both on 3000 — set `PORT=8000` in `lumina-backend/.env` |
| Frontend shows network errors | `NEXT_PUBLIC_API_URL` doesn't match backend port, or is missing `/api` |
| `SequelizeConnectionRefusedError` | Postgres not running or wrong `DB_HOST`/`DB_PORT` |
| `password authentication failed` | Wrong `DB_USER`/`DB_PASSWORD` |
| `relation "Users" does not exist` | Migrations not run — `npx sequelize-cli db:migrate` |
| SSL errors on managed Postgres | Set `DB_SSL=true` (production) |
| Socket connects then drops / 400 on `/socket.io` | Proxy not forwarding WebSocket upgrade headers, or missing sticky sessions |
| Socket `unauthorized` error | Missing/expired JWT in handshake `auth` |
| Verification emails not sent | Missing `RESEND_API_KEY` or unverified sender domain |
| Env change has no effect on frontend | `NEXT_PUBLIC_*` is build-time — rebuild |
| `bcrypt` "invalid ELF header" in Docker | `node_modules` copied from host — add it to `.dockerignore` and `npm ci` inside the image |

---

## 🤝 Contributing

1. Create a branch from `main`: `git checkout -b feat/short-description`
2. Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
3. Keep commits small and focused (large diffs also break AI commit-message tools)
4. Add a migration for any schema change — never edit an already-applied migration
5. Update Swagger (`src/swagger.js`) and the API docs when changing endpoints
6. Run `npm run lint` in the frontend before opening a PR

---

## 📚 Further Documentation

| Document | Purpose |
|---|---|
| [PROJECT.MD](PROJECT.MD) | Project overview & goals |
| [lumina_lms_full_api_documentation.md](lumina_lms_full_api_documentation.md) | Full REST API reference |
| [Lumina_LMS_Frontend_Specification.md](Lumina_LMS_Frontend_Specification.md) | Frontend spec & page breakdown |
| [CHAT_TESTING_GUIDE.MD](CHAT_TESTING_GUIDE.MD) | Testing realtime chat |
| [flutter_mobile_prd.md](flutter_mobile_prd.md) | Mobile app PRD |
