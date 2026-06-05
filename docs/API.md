# TRON Miner API Documentation

Base URL: `https://your-api.railway.app/api` (production) or `http://localhost:3001/api` (development)

All authenticated endpoints require a Bearer token in the `Authorization` header.

```
Authorization: Bearer <jwt_token>
```

---

## Authentication

### POST /auth/telegram

Authenticate user via Telegram Mini App initData.

**Request Body:**
```json
{
  "initData": "query_id=...&user=...&auth_date=...&hash=..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "cuid",
    "telegramId": "123456789",
    "username": "miner_user",
    "firstName": "John",
    "photoUrl": "https://...",
    "balance": 0,
    "miningRate": 10,
    "minerLevel": 1,
    "xp": 0,
    "userLevel": 1,
    "dailyStreak": 0,
    "createdAt": "2025-06-05T00:00:00.000Z"
  }
}
```

---

## User

### GET /user

Get current user profile with mining status and achievements.

**Response:**
```json
{
  "user": { /* User object */ },
  "mining": {
    "isActive": true,
    "canClaim": false,
    "canStart": false,
    "timeRemaining": 43200000,
    "earnedSoFar": 120.5,
    "miningRate": 10,
    "minerLevel": 1,
    "balance": 500,
    "session": { /* MiningSession or null */ }
  },
  "achievements": [
    {
      "key": "first_mine",
      "title": "First Strike",
      "description": "Start your first mining session",
      "unlockedAt": "2025-06-05T00:00:00.000Z"
    }
  ]
}
```

---

## Mining

### POST /mining/start

Start a new 24-hour mining session.

**Response:**
```json
{
  "session": {
    "id": "cuid",
    "userId": "cuid",
    "startedAt": "2025-06-05T00:00:00.000Z",
    "endedAt": null,
    "claimed": false,
    "earnedAmount": 0
  },
  "status": { /* MiningStatus */ }
}
```

### POST /mining/stop

Stop the current mining session early.

### POST /mining/claim

Claim rewards from a completed mining session.

**Response:**
```json
{
  "earned": 240,
  "streakBonus": 0.05,
  "status": { /* MiningStatus */ }
}
```

### GET /mining/status

Get current mining status.

---

## Upgrades

### GET /upgrade/levels

Get all miner upgrade levels.

**Response:**
```json
{
  "levels": [
    { "level": 1, "rate": 10, "cost": 0 },
    { "level": 2, "rate": 20, "cost": 500 },
    { "level": 3, "rate": 40, "cost": 2000 },
    { "level": 4, "rate": 80, "cost": 8000 },
    { "level": 5, "rate": 160, "cost": 32000 }
  ]
}
```

### POST /upgrade

Purchase a miner upgrade.

**Request Body:**
```json
{
  "targetLevel": 2
}
```

**Response:**
```json
{
  "minerLevel": 2,
  "miningRate": 20,
  "balance": 450,
  "cost": 500
}
```

---

## Referrals

### GET /referrals

Get referral stats and list.

**Response:**
```json
{
  "referralLink": "https://t.me/TRONMinerBot?start=123456789",
  "totalReferrals": 5,
  "activeReferrals": 3,
  "totalRewardsEarned": 120.5,
  "referrals": [ /* array of referral objects */ ]
}
```

---

## Daily Rewards

### GET /daily-reward/status

Get daily reward streak status.

**Response:**
```json
{
  "streak": 3,
  "canClaim": true,
  "claimedToday": false,
  "nextReward": 100,
  "currentDay": 4,
  "rewards": [
    { "day": 1, "amount": 50, "claimed": true, "isToday": false }
  ],
  "lastClaim": "2025-06-04T00:00:00.000Z"
}
```

### POST /daily-reward/claim

Claim today's daily reward.

**Response:**
```json
{
  "reward": 100,
  "streak": 4,
  "dayNumber": 4
}
```

---

## Tasks

### GET /tasks

Get available tasks with completion status.

### POST /tasks/complete

Mark a task as completed and receive reward.

**Request Body:**
```json
{
  "taskId": "cuid"
}
```

---

## Leaderboard

### GET /leaderboard

Get top 100 users by balance, mining rate, and referrals.

**Response:**
```json
{
  "balances": [ /* top by balance */ ],
  "miners": [ /* top by mining rate */ ],
  "referrals": [ /* top by referral count */ ]
}
```

---

## Health

### GET /health

```json
{
  "status": "ok",
  "timestamp": "2025-06-05T00:00:00.000Z"
}
```

---

## Error Responses

All errors return:
```json
{
  "error": "Error message"
}
```

| Status | Description |
|--------|-------------|
| 400 | Bad request / validation error |
| 401 | Unauthorized / invalid token |
| 403 | Forbidden (admin only) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
