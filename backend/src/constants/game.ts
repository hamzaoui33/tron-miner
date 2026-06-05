export const MINER_LEVELS = {
  1: { rate: 10, cost: 0 },
  2: { rate: 20, cost: 500 },
  3: { rate: 40, cost: 2000 },
  4: { rate: 80, cost: 8000 },
  5: { rate: 160, cost: 32000 },
} as const;

export const MAX_MINER_LEVEL = 5;

export const MINING_SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const DAILY_REWARDS = [50, 75, 100, 150, 200, 250, 500] as const;

export const REFERRAL_BONUS_PERCENT = 0.1; // 10%

export const XP_PER_TRX_MINED = 1;
export const XP_PER_LEVEL = 1000;

export const STREAK_BONUS_PERCENT: Record<number, number> = {
  3: 0.05,
  7: 0.1,
  14: 0.15,
  30: 0.25,
};

export const ACHIEVEMENTS = [
  { key: 'first_mine', title: 'First Strike', description: 'Start your first mining session', xpReward: 50, trxReward: 10 },
  { key: 'first_claim', title: 'Payday', description: 'Claim your first mining rewards', xpReward: 100, trxReward: 25 },
  { key: 'level_2', title: 'Rising Miner', description: 'Reach miner level 2', xpReward: 200, trxReward: 50 },
  { key: 'level_5', title: 'Mining Master', description: 'Reach max miner level', xpReward: 1000, trxReward: 500 },
  { key: 'first_referral', title: 'Recruiter', description: 'Refer your first friend', xpReward: 150, trxReward: 75 },
  { key: 'streak_7', title: 'Dedicated', description: 'Maintain a 7-day streak', xpReward: 300, trxReward: 100 },
  { key: 'balance_1000', title: 'Whale', description: 'Accumulate 1000 TRX balance', xpReward: 500, trxReward: 200 },
] as const;

export const BOT_USERNAME = 'TRONMinerBot';
