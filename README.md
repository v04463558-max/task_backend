# Task Tracker — Backend (Express + Prisma)

Backend API for the Task Tracker application.

## Overview

- Express 5 API using Prisma ORM and MySQL.
- Responsible for user auth (JWT), categories, and tasks.
- Soft-delete is used for categories and tasks (`deletedAt`).

## Tech stack

- Node.js, Express, Prisma, MySQL, dotenv, JWT

## Local setup

1. Install dependencies:

```powershell
cd my_backend
npm install
```

2. Copy and edit environment variables:

```powershell
copy .env.example .env
# Edit DATABASE_URL, JWT_SECRET, PORT (optional)
```

3. Prisma setup (generate client, run migrations):

```powershell
npm run prisma:generate
npm run prisma:migrate
```

4. Start server (default PORT 3000):

PowerShell (Windows):

```powershell
cd my_backend
$env:PORT=3000
npm run dev
```

Windows Command Prompt (cmd.exe):

```cmd
cd my_backend
set PORT=4000
npm.cmd run dev
```

On Unix/macOS:

```bash
cd my_backend
PORT=4000 npm run dev
```

## Environment variables

- `DATABASE_URL` — MySQL connection string used by Prisma
- `PORT` — API port (default 4000)
- `JWT_SECRET` — secret for signing JWTs
- `JWT_EXPIRES_IN_SECONDS` — token lifetime (optional)
- `CORS_ORIGIN` — allowed origin for CORS (optional)

## API Endpoints (prefix: `/api`)

### Auth

- `POST /api/auth/register` — body `{ name, email, password }` → `{ user, token }` (201)
- `POST /api/auth/login` — body `{ email, password }` → `{ user, token }`
- `GET /api/auth/me` — requires `Authorization: Bearer <token>` → `{ user }`

### Categories (authorization required)

- `GET /api/categories` — list categories (non-deleted)
- `POST /api/categories` — body `{ name }` → create
- `PUT /api/categories/:id` — update name
- `DELETE /api/categories/:id` — soft-delete

### Tasks (authorization required)

- `GET /api/tasks` — list tasks for current user. Query: `page`, `limit`, `status`, `category_id`, `search`.
- `GET /api/tasks/:id` — get task (must be owned by user)
- `POST /api/tasks` — create task; body `{ title, description?, status?, due_date? (YYYY-MM-DD), category_id }`
- `PUT /api/tasks/:id` — update task (partial allowed)
- `DELETE /api/tasks/:id` — soft-delete task

## Notes & limitations

- Categories are global (not per-user) in the current schema — if you need per-user categories, schema and controllers must be changed.
- Backend validates `due_date` and rejects past dates.
- JWT tokens are stored client-side; secure storage and refresh flow not implemented.
