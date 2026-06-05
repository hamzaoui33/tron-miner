import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatTrx } from '@/lib/utils';
import { hapticFeedback } from '@/lib/telegram';
import { motion } from 'framer-motion';
import { Gift, Flame, Check } from 'lucide-react';

export default function DailyRewards() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['daily-reward'],
    queryFn: () => api.dailyReward.status(),
  });

  const claimMutation = useMutation({
    mutationFn: () => api.dailyReward.claim(),
    onSuccess: () => {
      hapticFeedback('success');
      queryClient.invalidateQueries({ queryKey: ['daily-reward'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: () => hapticFeedback('error'),
  });

  if (isLoading || !data) return null;

  return (
    <div className="px-4 pb-4 space-y-4">
      <PageHeader title="Daily Rewards" subtitle="Login daily for bonus TRX" />

      <Card className="text-center py-6">
        <Flame className="w-10 h-10 text-tron-red mx-auto mb-2" />
        <p className="text-3xl font-bold">{data.streak}</p>
        <p className="text-text-secondary text-sm">Day Streak</p>
        {data.canClaim && (
          <Badge variant="tron" className="mt-2">Reward Available!</Badge>
        )}
      </Card>

      {data.canClaim && (
        <Button
          className="w-full"
          size="lg"
          loading={claimMutation.isPending}
          onClick={() => claimMutation.mutate()}
        >
          <Gift className="w-5 h-5" />
          Claim {formatTrx(data.nextReward)} TRX
        </Button>
      )}

      {data.claimedToday && (
        <Card className="text-center py-4 bg-success/5 border-success/20">
          <Check className="w-8 h-8 text-success mx-auto mb-2" />
          <p className="text-success font-semibold">Today's reward claimed!</p>
          <p className="text-xs text-text-muted mt-1">Come back tomorrow</p>
        </Card>
      )}

      <div className="grid grid-cols-7 gap-2">
        {data.rewards.map((reward, i) => (
          <motion.div
            key={reward.day}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className={`text-center py-3 px-1 ${
                reward.isToday
                  ? 'border-tron-red ring-2 ring-tron-red/30'
                  : reward.claimed
                  ? 'border-success/30 opacity-70'
                  : ''
              }`}
            >
              <p className="text-[10px] text-text-muted">D{reward.day}</p>
              <p className={`text-xs font-bold mt-1 ${reward.claimed ? 'text-success' : 'text-tron-red'}`}>
                {reward.amount}
              </p>
              {reward.claimed && (
                <Check className="w-3 h-3 text-success mx-auto mt-1" />
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-tron-red/5 border-tron-red/20">
        <p className="text-sm text-text-secondary">
          Maintain your streak to earn bigger rewards. Missing a day resets your streak to Day 1.
          Streak bonuses also boost your mining rewards!
        </p>
      </Card>
    </div>
  );
}
