# TRON Miner Architecture

## Overview

TRON Miner is a Telegram Mini App that simulates cryptocurrency mining as a game. All balances and rewards are virtual — no real cryptocurrency is involved.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Telegram App   │────▶│  React Frontend │────▶│  Express API    │
│  (Mini App SDK) │     │  (Vercel)       │     │  (Railway)      │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                           │
                                                  ┌────────▼────────┐
                                                  │   PostgreSQL    │
                                                  │   (Supabase)    │
                                                  └─────────────────┘
```

## Security Model

- **Telegram initData validation**: All auth uses HMAC-SHA256 validation of Telegram WebApp initData on the backend
- **JWT tokens**: Short-lived tokens for API access
- **Server-side calculations**: All mining rewards, balances, and upgrades calculated on backend
- **Rate limiting**: Express rate limiter on all endpoints
- **Input validation**: Zod schemas on all request bodies

## Backend Architecture

```
src/
├── config/          # Environment configuration
├── constants/       # Game constants (rates, rewards, levels)
├── lib/             # Prisma client
├── middleware/      # Auth, error handling, rate limiting
├── routes/          # Express route handlers
├── services/        # Business logic layer
│   ├── auth.service.ts
│   ├── mining.service.ts
│   ├── upgrade.service.ts
│   ├── referral.service.ts
│   ├── dailyReward.service.ts
│   ├── task.service.ts
│   ├── leaderboard.service.ts
│   ├── gamification.service.ts
│   ├── admin.service.ts        # Future admin panel
│   └── telegram.service.ts
└── utils/           # Helpers (decimal, logger)
```

### Service Layer Pattern

All business logic lives in services. Routes are thin handlers that:
1. Validate input (Zod)
2. Call service method
3. Return response

This enables future admin panel to reuse the same services.

## Frontend Architecture

```
src/
├── components/
│   ├── layout/      # Layout, navigation, headers
│   ├── mining/      # Mining-specific components
│   └── ui/          # Reusable UI primitives
├── hooks/           # Custom React hooks
├── lib/             # API client, Telegram SDK, utils
├── pages/           # Route-level page components (lazy loaded)
└── types/           # TypeScript interfaces
```

### State Management

- **React Query**: Server state, caching, mutations
- **Local state**: UI-only state (tabs, modals)
- **No global store**: React Query handles all server data

## Game Mechanics

### Mining Flow

```
Start Mining → 24hr Session → Claim Rewards → Start New Session
                    ↓
              Earn TRX/hour based on miner level
                    ↓
              Referrer gets 10% bonus
```

### Miner Levels

| Level | Rate (TRX/hr) | Upgrade Cost |
|-------|---------------|--------------|
| 1     | 10            | Free         |
| 2     | 20            | 500 TRX      |
| 3     | 40            | 2,000 TRX    |
| 4     | 80            | 8,000 TRX    |
| 5     | 160           | 32,000 TRX   |

### Gamification Systems

- **XP**: Earned from mining, tasks, achievements
- **User Levels**: XP / 1000 + 1
- **Achievements**: Unlockable milestones with TRX + XP rewards
- **Daily Streaks**: 7-day reward cycle with streak bonuses on mining
- **Referral Bonuses**: 10% of referred user's mining earnings

## Database Schema

See `backend/prisma/schema.prisma` for full schema.

Key relationships:
- User → MiningSession (1:many)
- User → Referral (self-referential)
- User → TaskCompletion (many:many via Task)
- User → Achievement (many:many via UserAchievement)

## Future Admin Panel

The `admin.service.ts` provides ready-to-use methods:
- `banUser(userId, banned)`
- `adjustBalance(userId, amount, operation)`
- `getAllUsers(page, limit)`
- `createTask(data)`
- `updateTask(taskId, data)`
- `deleteTask(taskId)`

Protected by `adminMiddleware` checking `ADMIN_TELEGRAM_IDS`.

## Deployment

| Component | Platform | Config |
|-----------|----------|--------|
| Frontend  | Vercel   | `vercel.json` |
| Backend   | Railway  | `railway.json` |
| Database  | Supabase | Connection string |
