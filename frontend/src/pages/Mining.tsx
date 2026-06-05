import { useAuth } from '@/hooks/useAuth';
import { useMining } from '@/hooks/useMining';
import { useCountdown } from '@/hooks/useCountdown';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MiningAnimation } from '@/components/mining/MiningAnimation';
import { formatTrx, formatTime, formatDuration } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Play, Square, Gift, Clock, Zap } from 'lucide-react';

export default function Mining() {
  const { user } = useAuth();
  const { startMining, stopMining, claimRewards, isStarting, isStopping, isClaiming } = useMining();

  if (!user) return null;

  const { mining } = user;
  const countdown = useCountdown(mining.timeRemaining, mining.isActive);

  const sessionStart = mining.session?.startedAt
    ? new Date(mining.session.startedAt).getTime()
    : null;
  const sessionDuration = sessionStart ? Date.now() - sessionStart : 0;

  return (
    <div className="px-4 pb-4 space-y-4">
      <PageHeader title="Mining" subtitle="24-hour mining sessions" />

      <Card className="flex flex-col items-center py-8" glow={mining.isActive}>
        <MiningAnimation active={mining.isActive} size="lg" />

        <div className="mt-6 text-center">
          <Badge variant={mining.isActive ? 'success' : 'default'} className="mb-3">
            {mining.isActive ? 'Session Active' : 'No Active Session'}
          </Badge>

          <p className="text-4xl font-bold tron-text-gradient">
            {formatTrx(mining.earnedSoFar)}
          </p>
          <p className="text-text-secondary text-sm mt-1">TRX earned this session</p>
        </div>
      </Card>

      {/* Session Info */}
      {mining.session && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-tron-red" />
            <div>
              <p className="text-xs text-text-muted">Duration</p>
              <p className="font-semibold text-sm">{formatDuration(sessionDuration)}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-tron-red" />
            <div>
              <p className="text-xs text-text-muted">Rate</p>
              <p className="font-semibold text-sm">{formatTrx(mining.miningRate)}/hr</p>
            </div>
          </Card>
        </div>
      )}

      {mining.isActive && (
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm">Time until claim</span>
            <span className="font-mono font-bold text-lg">{formatTime(countdown)}</span>
          </div>
          <div className="mt-3 h-2 bg-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full tron-gradient rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, ((86400000 - countdown) / 86400000) * 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {mining.canStart && (
          <Button
            className="w-full"
            size="lg"
            loading={isStarting}
            onClick={() => startMining()}
          >
            <Play className="w-5 h-5" />
            Start Mining
          </Button>
        )}

        {mining.isActive && (
          <Button
            className="w-full"
            variant="secondary"
            size="lg"
            loading={isStopping}
            onClick={() => stopMining()}
          >
            <Square className="w-5 h-5" />
            Stop Mining
          </Button>
        )}

        {mining.canClaim && (
          <Button
            className="w-full"
            size="lg"
            loading={isClaiming}
            onClick={() => claimRewards()}
          >
            <Gift className="w-5 h-5" />
            Claim Rewards
          </Button>
        )}
      </div>

      <Card className="bg-tron-red/5 border-tron-red/20">
        <p className="text-sm text-text-secondary">
          Mining sessions last <strong className="text-white">24 hours</strong>. After completion,
          claim your rewards before starting a new session. All rewards are virtual TRX.
        </p>
      </Card>
    </div>
  );
}
