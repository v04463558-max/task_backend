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
# Edit DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DATABASE, PORT, JWT_SECRET
```

Local `.env` example:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DATABASE=task_tracker
PORT=3000
JWT_SECRET="replace-with-a-long-random-secret"
```

3. Prisma setup (generate client, run migrations):

```powershell
npm run prisma:generate
npm run prisma:migrate
```

4. Start server (default PORT 3000):

```powershell
cd my_backend
npm run dev
```

API is available at `http://localhost:3000` (or whatever `PORT` you set).

## Environment variables

**Database (required — use these):**

| Variable | Description | Local example |
|---|---|---|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USERNAME` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password (can be empty) | *(blank)* |
| `DATABASE` | Database name | `task_tracker` |
| `PORT` | API listen port | `3000` |

**App:**

- `JWT_SECRET` — secret for signing JWTs
- `JWT_EXPIRES_IN_SECONDS` — token lifetime (optional)
- `CORS_ORIGIN` — allowed origin for CORS (optional)

**Railway:** set the same `DB_*` vars from your MySQL service (or link MySQL — the app also reads `MYSQL_*` / `MYSQL_URL`). Railway injects `PORT` automatically. The process binds `0.0.0.0` so the proxy can reach it without crashing.

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
