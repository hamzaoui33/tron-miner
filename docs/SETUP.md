# TRON Miner Setup Guide

## Prerequisites

- Node.js 20+
- PostgreSQL database (local or Supabase)
- Telegram Bot (via [@BotFather](https://t.me/BotFather))
- Vercel account (frontend deployment)
- Railway account (backend deployment)

---

## 1. Create Telegram Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow prompts
3. Name your bot `TRON Miner Bot` (username: `TRONMinerBot`)
4. Save the **bot token**
5. Configure the Mini App:
   ```
   /mybots → Select bot → Bot Settings → Menu Button → Configure
   ```
   Set the Web App URL to your Vercel deployment URL

6. Enable inline mode (optional):
   ```
   /setinline
   ```

---

## 2. Database Setup

### Option A: Supabase (Recommended)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection string (URI)
3. Copy the connection string

### Option B: Local PostgreSQL

```bash
createdb tron_miner
```

Connection string:
```
postgresql://postgres:password@localhost:5432/tron_miner
```

---

## 3. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://..."
JWT_SECRET=generate-a-strong-random-secret-here
JWT_EXPIRES_IN=7d
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
FRONTEND_URL=http://localhost:5173
ADMIN_TELEGRAM_IDS=your-telegram-id
```

Install and run:
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run dev
```

API runs at `http://localhost:3001`

---

## 4. Frontend Setup

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_BOT_USERNAME=TRONMinerBot
```

Install and run:
```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`

> **Note:** In development mode, the app uses a mock Telegram user when not opened inside Telegram.

---

## 5. Deploy Backend (Railway)

1. Push code to GitHub
2. Create new project on [Railway](https://railway.app)
3. Add PostgreSQL plugin (or use external Supabase URL)
4. Deploy from GitHub repo, set root directory to `backend`
5. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `TELEGRAM_BOT_TOKEN`
   - `FRONTEND_URL` (your Vercel URL)
   - `NODE_ENV=production`
6. Railway auto-runs migrations on deploy

---

## 6. Deploy Frontend (Vercel)

1. Import GitHub repo on [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. Set environment variables:
   - `VITE_API_URL=https://your-api.railway.app/api`
   - `VITE_BOT_USERNAME=TRONMinerBot`
4. Deploy

---

## 7. Connect Telegram Mini App

1. Copy your Vercel deployment URL
2. In BotFather: `/mybots` → your bot → Bot Settings → Menu Button
3. Set Web App URL to your Vercel URL
4. Test by opening the bot and tapping the menu button

---

## Development Tips

### Testing without Telegram

The backend accepts `dev_mode` initData when `NODE_ENV=development`. The frontend automatically sends this in dev mode.

### Reset database

```bash
cd backend
npx prisma migrate reset
npm run db:seed
```

### View database

```bash
cd backend
npm run db:studio
```

### Generate new migration

```bash
cd backend
npx prisma migrate dev --name your_migration_name
```
