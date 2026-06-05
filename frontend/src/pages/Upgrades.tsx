import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatTrx } from '@/lib/utils';
import { hapticFeedback } from '@/lib/telegram';
import { motion } from 'framer-motion';
import { Zap, Lock, Check, ArrowUp } from 'lucide-react';

const LEVEL_ICONS = ['⛏️', '🔨', '⚡', '🔥', '💎'];

export default function Upgrades() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: levelsData } = useQuery({
    queryKey: ['upgrade-levels'],
    queryFn: () => api.upgrade.levels(),
  });

  const upgradeMutation = useMutation({
    mutationFn: (targetLevel: number) => api.upgrade.purchase(targetLevel),
    onSuccess: () => {
      hapticFeedback('success');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['upgrade-levels'] });
    },
    onError: () => hapticFeedback('error'),
  });

  if (!user || !levelsData) return null;

  const { user: profile } = user;
  const levels = levelsData.levels;

  return (
    <div className="px-4 pb-4 space-y-4">
      <PageHeader
        title="Upgrade Center"
        subtitle={`Balance: ${formatTrx(profile.balance)} TRX`}
      />

      <Card className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl tron-gradient flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">Current Mining Rate</p>
          <p className="text-xl font-bold">{formatTrx(profile.miningRate)} TRX/hr</p>
        </div>
        <Badge variant="tron" className="ml-auto">Lv.{profile.minerLevel}</Badge>
      </Card>

      <div className="space-y-3">
        {levels.map((level, index) => {
          const isOwned = profile.minerLevel >= level.level;
          const isNext = profile.minerLevel + 1 === level.level;
          const canAfford = profile.balance >= level.cost;
          const isLocked = level.level > profile.minerLevel + 1;

          return (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative overflow-hidden ${
                  isOwned ? 'border-success/30' : isNext ? 'border-tron-red/40' : ''
                }`}
              >
                {isOwned && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-5 h-5 text-success" />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="text-3xl">{LEVEL_ICONS[index]}</div>
                  <div className="flex-1">
                    <h3 className="font-bold">Level {level.level} Miner</h3>
                    <p className="text-sm text-tron-red font-semibold">
                      {formatTrx(level.rate)} TRX/hr
                    </p>
                    {level.cost > 0 && (
                      <p className="text-xs text-text-muted mt-0.5">
                        Cost: {formatTrx(level.cost)} TRX
                      </p>
                    )}
                  </div>

                  {isOwned ? (
                    <Badge variant="success">Owned</Badge>
                  ) : isLocked ? (
                    <Lock className="w-5 h-5 text-text-muted" />
                  ) : isNext ? (
                    <Button
                      size="sm"
                      disabled={!canAfford}
                      loading={upgradeMutation.isPending}
                      onClick={() => upgradeMutation.mutate(level.level)}
                    >
                      <ArrowUp className="w-4 h-4" />
                      Upgrade
                    </Button>
                  ) : null}
                </div>

                {!isOwned && isNext && !canAfford && (
                  <p className="text-xs text-warning mt-2">
                    Need {formatTrx(level.cost - profile.balance)} more TRX
                  </p>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
