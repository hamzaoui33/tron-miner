declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    };
    start_param?: string;
  };
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  ready: () => void;
  expand: () => void;
  close: () => void;
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    setText: (text: string) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  openTelegramLink: (url: string) => void;
  openLink: (url: string) => void;
  shareToStory?: (mediaUrl: string, params?: { text?: string }) => void;
}

export function getTelegramWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null;
}

export function initTelegramApp() {
  const tg = getTelegramWebApp();
  if (!tg) return null;

  tg.ready();
  tg.expand();

  if (tg.colorScheme === 'dark') {
    document.documentElement.classList.add('dark');
  }

  return tg;
}

export function getInitData(): string {
  const tg = getTelegramWebApp();
  if (tg?.initData) return tg.initData;

  // Dev fallback
  if (import.meta.env.DEV) {
    const devUser = {
      id: 123456789,
      first_name: 'Dev',
      username: 'devuser',
      photo_url: '',
    };
    const authDate = Math.floor(Date.now() / 1000);
    return `user=${encodeURIComponent(JSON.stringify(devUser))}&auth_date=${authDate}&hash=dev_mode`;
  }

  return '';
}

export function hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection' = 'light') {
  const tg = getTelegramWebApp();
  if (!tg) return;

  if (type === 'selection') {
    tg.HapticFeedback.selectionChanged();
  } else if (type === 'success' || type === 'error' || type === 'warning') {
    tg.HapticFeedback.notificationOccurred(type);
  } else {
    tg.HapticFeedback.impactOccurred(type);
  }
}

export function shareReferralLink(link: string, text: string) {
  const tg = getTelegramWebApp();
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;

  if (tg) {
    tg.openTelegramLink(shareUrl);
  } else {
    window.open(shareUrl, '_blank');
  }
}
