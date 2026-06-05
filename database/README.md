# Database

This directory contains database migration files and documentation for the TRON Miner PostgreSQL database.

## Schema

The canonical schema is defined in `backend/prisma/schema.prisma`.

## Migrations

Migrations are managed by Prisma in `backend/prisma/migrations/`.

A copy of the initial migration SQL is also stored here for reference:
- `migrations/20250605000000_init/migration.sql`

## Running Migrations

```bash
cd backend

# Development (creates migration + applies)
npx prisma migrate dev

# Production (applies pending migrations)
npx prisma migrate deploy

# Reset database (destructive)
npx prisma migrate reset
```

## Seeding

```bash
cd backend
npm run db:seed
```

Seeds:
- Default tasks (Join Channel, Join Group, Follow Twitter, Invite Friend)
- Achievement definitions

## Models

| Model | Description |
|-------|-------------|
| User | Player account with balance, mining rate, XP |
| MiningSession | 24-hour mining session tracking |
| Referral | Referrer-referred user relationships |
| DailyReward | Daily login reward claims |
| Task | Completable tasks with rewards |
| TaskCompletion | User task completion records |
| Achievement | Unlockable achievement definitions |
| UserAchievement | User achievement unlock records |

## Supabase Compatibility

The schema uses standard PostgreSQL features compatible with Supabase:
- `DECIMAL(18,8)` for precise balance tracking
- Standard indexes and foreign keys
- No Supabase-specific extensions required

Connection string format:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```
