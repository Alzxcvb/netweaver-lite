# NetWeaver Lite

A personal CRM for managing relationships — no auth, no cloud, runs locally.

**Stack:** React + Vite + Tailwind (frontend) / Node.js + Express + Prisma + PostgreSQL (backend)

---

## Features

- **Dashboard** — today's follow-ups, overdue contacts, stats
- **Contacts** — CRUD with search, tag filter, social links, custom fields
- **Interaction History** — log every touchpoint (in-person or digital)
- **Follow-Up Rules** — birthday, holiday, interval, or tag-based reminders
- **Bulk Import** — CSV upload with duplicate detection + manual merge review
- **Feedback** — bug/feature tracking stored locally in DB

---

## Setup

### 1. PostgreSQL

```bash
# macOS
brew install postgresql@16
brew services start postgresql@16
createdb netweaver
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env          # edit DATABASE_URL
npx prisma migrate dev --name init
node src/seed.js
npm run dev                   # → http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                   # → http://localhost:5173
```

---

## Environment

`backend/.env`:
```
DATABASE_URL="postgresql://localhost:5432/netweaver"
PORT=3001
```

---

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET/POST | `/api/contacts` | List / create contacts |
| GET/PUT/DELETE | `/api/contacts/:id` | Get / update / delete |
| GET/POST | `/api/contacts/:id/interactions` | Log / list interactions |
| GET/POST | `/api/follow-up-rules` | List / create rules |
| PUT/DELETE | `/api/follow-up-rules/:id` | Update / delete rule |
| GET | `/api/dashboard` | Today's follow-ups + stats |
| POST | `/api/feedback` | Submit feedback |
| POST | `/api/import/preview` | Parse CSV, detect duplicates |
| POST | `/api/import/confirm` | Apply confirmed import |

---

## CSV Import Format

```csv
name,email,phone,tags,notes
Jane Smith,jane@example.com,555-1234,"friend,work",Met at conference
```
