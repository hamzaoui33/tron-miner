const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('tron_miner_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('tron_miner_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('tron_miner_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  auth = {
    telegram: (initData: string) =>
      this.request<import('@/types').AuthResponse>('/auth/telegram', {
        method: 'POST',
        body: JSON.stringify({ initData }),
      }),
  };

  user = {
    get: () => this.request<import('@/types').UserProfile>('/user'),
  };

  mining = {
    start: () => this.request<{ session: import('@/types').MiningSession; status: import('@/types').MiningStatus }>('/mining/start', { method: 'POST' }),
    stop: () => this.request<{ session: import('@/types').MiningSession; status: import('@/types').MiningStatus }>('/mining/stop', { method: 'POST' }),
    claim: () => this.request<{ earned: number; streakBonus: number; status: import('@/types').MiningStatus }>('/mining/claim', { method: 'POST' }),
    status: () => this.request<import('@/types').MiningStatus>('/mining/status'),
  };

  upgrade = {
    levels: () => this.request<{ levels: import('@/types').MinerLevel[] }>('/upgrade/levels'),
    purchase: (targetLevel?: number) =>
      this.request<{ minerLevel: number; miningRate: number; balance: number; cost: number }>('/upgrade', {
        method: 'POST',
        body: JSON.stringify({ targetLevel }),
      }),
  };

  referrals = {
    get: () => this.request<import('@/types').ReferralStats>('/referrals'),
  };

  dailyReward = {
    status: () => this.request<import('@/types').DailyRewardStatus>('/daily-reward/status'),
    claim: () => this.request<{ reward: number; streak: number; dayNumber: number }>('/daily-reward/claim', { method: 'POST' }),
  };

  tasks = {
    get: () => this.request<{ tasks: import('@/types').Task[] }>('/tasks'),
    complete: (taskId: string) =>
      this.request<{ reward: number; taskTitle: string }>('/tasks/complete', {
        method: 'POST',
        body: JSON.stringify({ taskId }),
      }),
  };

  leaderboard = {
    get: () => this.request<import('@/types').Leaderboard>('/leaderboard'),
  };
}

export const api = new ApiClient();
