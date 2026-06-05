import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getTelegramWebApp } from '@/lib/telegram';

export function useTelegramBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const tg = getTelegramWebApp();
    if (!tg) return;

    const isHome = location.pathname === '/';

    if (isHome) {
      tg.BackButton.hide();
      return;
    }

    tg.BackButton.show();

    const handleBack = () => navigate(-1);
    tg.BackButton.onClick(handleBack);

    return () => {
      tg.BackButton.offClick(handleBack);
    };
  }, [location.pathname, navigate]);
}
