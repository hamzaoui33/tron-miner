# TRON Miner

A production-ready Telegram Mini App that simulates TRON mining as a game. All balances and rewards are **virtual** — no real cryptocurrency is mined or transferred.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![Node.js](https://img.shields.io/badge/Node.js-20+-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue)

## Features

- **Simulated Mining** — 24-hour mining sessions with real-time reward calculation
- **5 Upgrade Levels** — Increase mining speed from 10 to 160 TRX/hour
- **Referral System** — Earn 10% of referral mining earnings
- **Daily Rewards** — 7-day streak system with escalating bonuses
- **Tasks** — Complete social tasks for bonus TRX
- **Leaderboard** — Top 100 by balance, mining rate, and referrals
- **Gamification** — XP, user levels, achievements, streak bonuses
- **Premium UI** — Dark mode crypto dashboard with TRON red accents and animations

## Project Structure

```
├── frontend/     # React 19 + Vite + Tailwind (deploy to Vercel)
├── backend/      # Express + Prisma + JWT (deploy to Railway)
├── database/     # Migration files and database docs
└── docs/         # API docs, setup guide, architecture
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (local or [Supabase](https://supabase.com))
- Telegram Bot token from [@BotFather](https://t.me/BotFather)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your database URL, JWT secret, and bot token

npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run dev
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env with API URL

npm install
npm run dev
```

Open `http://localhost:5173` — dev mode uses a mock Telegram user.

### 3. Telegram Bot Setup

1. Create bot via [@BotFather](https://t.me/BotFather)
2. Set Mini App URL to your frontend deployment
3. Users open the bot → tap menu button → app launches

## Documentation

- [Setup Guide](docs/SETUP.md) — Full setup and deployment instructions
- [API Documentation](docs/API.md) — REST API reference
- [Architecture](docs/ARCHITECTURE.md) — System design and game mechanics
- [Database](database/README.md) — Schema and migrations

## Deployment

| Service | Platform | Directory |
|---------|----------|-----------|
| Frontend | [Vercel](https://vercel.com) | `frontend/` |
| Backend | [Railway](https://railway.app) | `backend/` |
| Database | [Supabase](https://supabase.com) | — |

See [docs/SETUP.md](docs/SETUP.md) for detailed deployment steps.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT signing (min 16 chars) |
| `TELEGRAM_BOT_TOKEN` | Bot token from BotFather |
| `FRONTEND_URL` | Frontend URL for CORS |
| `ADMIN_TELEGRAM_IDS` | Comma-separated admin Telegram IDs |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_BOT_USERNAME` | Telegram bot username |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/telegram` | Authenticate via Telegram |
| GET | `/api/user` | Get user profile |
| POST | `/api/mining/start` | Start mining session |
| POST | `/api/mining/claim` | Claim mining rewards |
| POST | `/api/upgrade` | Upgrade miner level |
| GET | `/api/referrals` | Get referral stats |
| POST | `/api/daily-reward/claim` | Claim daily reward |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks/complete` | Complete a task |
| GET | `/api/leaderboard` | Get leaderboards |

## Tech Stack

**Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Telegram Mini Apps SDK, React Query, React Router, Framer Motion

**Backend:** Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, JWT, Zod validation, Winston logging

## License

MIT
