import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useTelegramBackButton } from '@/hooks/useTelegramBackButton';

export function Layout() {
  useTelegramBackButton();

  return (
    <div className="min-h-screen bg-black pb-20">
      <div className="max-w-lg mx-auto">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
