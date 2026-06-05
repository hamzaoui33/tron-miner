export interface User {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  photoUrl: string | null;
  balance: number;
  miningRate: number;
  minerLevel: number;
  xp: number;
  userLevel: number;
  dailyStreak: number;
  createdAt: string;
}

export interface MiningSession {
  id: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  claimed: boolean;
  earnedAmount: number;
}

export interface MiningStatus {
  isActive: boolean;
  canClaim: boolean;
  canStart: boolean;
  timeRemaining: number;
  earnedSoFar: number;
  miningRate: number;
  minerLevel: number;
  balance: number;
  session: MiningSession | null;
}

export interface Achievement {
  key: string;
  title: string;
  description: string;
  unlockedAt: string;
}

export interface UserProfile {
  user: User;
  mining: MiningStatus;
  achievements: Achievement[];
}

export interface MinerLevel {
  level: number;
  rate: number;
  cost: number;
}

export interface ReferralStats {
  referralLink: string;
  totalReferrals: number;
  activeReferrals: number;
  totalRewardsEarned: number;
  referrals: Array<{
    id: string;
    username: string | null;
    firstName: string | null;
    photoUrl: string | null;
    rewardEarned: number;
    isActive: boolean;
    createdAt: string;
  }>;
}

export interface DailyRewardStatus {
  streak: number;
  canClaim: boolean;
  claimedToday: boolean;
  nextReward: number;
  currentDay: number;
  rewards: Array<{
    day: number;
    amount: number;
    claimed: boolean;
    isToday: boolean;
  }>;
  lastClaim: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  reward: number;
  type: string;
  url: string | null;
  completed: boolean;
  completedAt: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string | null;
  firstName: string | null;
  photoUrl: string | null;
}

export interface Leaderboard {
  balances: Array<LeaderboardEntry & { balance: number; minerLevel: number; userLevel: number }>;
  miners: Array<LeaderboardEntry & { miningRate: number; minerLevel: number }>;
  referrals: Array<LeaderboardEntry & { referralCount: number; totalRewards: number }>;
}

export interface AuthResponse {
  token: string;
  user: User;
}
