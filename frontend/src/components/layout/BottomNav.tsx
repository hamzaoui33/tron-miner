import { NavLink } from 'react-router-dom';
import { Home, Pickaxe, Zap, Users, Gift, CheckSquare, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hapticFeedback } from '@/lib/telegram';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/mining', icon: Pickaxe, label: 'Mine' },
  { to: '/upgrades', icon: Zap, label: 'Upgrade' },
  { to: '/referrals', icon: Users, label: 'Refer' },
  { to: '/daily', icon: Gift, label: 'Daily' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/leaderboard', icon: Trophy, label: 'Rank' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-2 max-w-lg mx-auto overflow-x-auto scrollbar-hide">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => hapticFeedback('selection')}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[48px]',
                isActive ? 'text-tron-red' : 'text-text-muted hover:text-text-secondary'
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
