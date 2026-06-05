import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { formatTrx, getDisplayName, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Trophy, Zap, Users } from 'lucide-react';

type Tab = 'balances' | 'miners' | 'referrals';

const TABS: { id: Tab; label: string; icon: typeof Trophy }[] = [
  { id: 'balances', label: 'Balance', icon: Trophy },
  { id: 'miners', label: 'Miners', icon: Zap },
  { id: 'referrals', label: 'Referrals', icon: Users },
];

const RANK_COLORS = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

export default function Leaderboard() {
  const [tab, setTab] = useState<Tab>('balances');

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.leaderboard.get(),
  });

  if (isLoading || !data) return null;

  const entries = data[tab];

  const getValue = (entry: (typeof entries)[0]) => {
    if (tab === 'balances') return `${formatTrx((entry as typeof data.balances[0]).balance)} TRX`;
    if (tab === 'miners') return `${formatTrx((entry as typeof data.miners[0]).miningRate)}/hr`;
    return `${(entry as typeof data.referrals[0]).referralCount} refs`;
  };

  const getSubValue = (entry: (typeof entries)[0]) => {
    if (tab === 'balances') return `Miner Lv.${(entry as typeof data.balances[0]).minerLevel}`;
    if (tab === 'miners') return `Lv.${(entry as typeof data.miners[0]).minerLevel}`;
    return `+${formatTrx((entry as typeof data.referrals[0]).totalRewards)} TRX`;
  };

  return (
    <div className="px-4 pb-4 space-y-4">
      <PageHeader title="Leaderboard" subtitle="Top 100 miners" />

      {/* Tabs */}
      <div className="flex gap-2 bg-surface rounded-xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === id
                ? 'tron-gradient text-white'
                : 'text-text-secondary hover:text-white'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Top 3 */}
      {entries.length >= 3 && (
        <div className="flex items-end justify-center gap-3 py-4">
          {[1, 0, 2].map((idx) => {
            const entry = entries[idx];
            const isFirst = idx === 0;
            return (
              <motion.div
                key={entry.id}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Avatar
                  src={entry.photoUrl}
                  name={entry.firstName}
                  size={isFirst ? 'lg' : 'md'}
                  className={isFirst ? 'border-yellow-400' : ''}
                />
                <p className={cn('font-bold text-sm mt-2', RANK_COLORS[idx])}>
                  #{entry.rank}
                </p>
                <p className="text-xs text-text-secondary truncate max-w-[80px]">
                  {getDisplayName(entry.username, entry.firstName)}
                </p>
                <p className="text-xs font-semibold text-tron-red mt-0.5">
                  {getValue(entry)}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {entries.slice(0, 100).map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(i * 0.02, 1) }}
          >
            <Card className="flex items-center gap-3 py-2.5">
              <span
                className={cn(
                  'w-8 text-center font-bold text-sm',
                  entry.rank <= 3 ? RANK_COLORS[entry.rank - 1] : 'text-text-muted'
                )}
              >
                {entry.rank}
              </span>
              <Avatar src={entry.photoUrl} name={entry.firstName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {getDisplayName(entry.username, entry.firstName)}
                </p>
                <p className="text-xs text-text-muted">{getSubValue(entry)}</p>
              </div>
              <p className="font-semibold text-sm text-tron-red">{getValue(entry)}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
