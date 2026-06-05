import { useAuth } from '@/hooks/useAuth';
import { useMining } from '@/hooks/useMining';
import { useCountdown } from '@/hooks/useCountdown';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MiningAnimation } from '@/components/mining/MiningAnimation';
import { formatTrx, formatTime, getDisplayName } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { claimRewards, isClaiming } = useMining();

  if (!user) return null;

  const { user: profile, mining } = user;
  const countdown = useCountdown(mining.timeRemaining, mining.isActive);

  const handleClaim = async () => {
    try {
      await claimRewards();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="px-4 pb-4 space-y-4">
      {/* User Header */}
      <motion.div
        className="flex items-center gap-3 pt-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Avatar src={profile.photoUrl} name={profile.firstName} size="lg" />
        <div className="flex-1">
          <h2 className="font-bold text-lg">{getDisplayName(profile.username, profile.firstName)}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="tron">Lv.{profile.userLevel}</Badge>
            <Badge>Miner Lv.{profile.minerLevel}</Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-secondary">XP</p>
          <p className="font-semibold text-tron-red">{profile.xp.toLocaleString()}</p>
        </div>
      </motion.div>

      {/* Balance Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-tron-red/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <p className="text-text-secondary text-sm">Total Balance</p>
        <p className="text-3xl font-bold tron-text-gradient mt-1">
          {formatTrx(profile.balance)} <span className="text-lg">TRX</span>
        </p>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-sm text-text-secondary">
            <Zap className="w-4 h-4 text-tron-red" />
            {formatTrx(mining.miningRate)}/hr
          </div>
          <div className="flex items-center gap-1.5 text-sm text-text-secondary">
            <TrendingUp className="w-4 h-4 text-success" />
            +{formatTrx(mining.earnedSoFar)} earned
          </div>
        </div>
      </Card>

      {/* Mining Card */}
      <Card glow={mining.isActive} className="flex flex-col items-center py-6">
        <MiningAnimation active={mining.isActive} />
        
        <div className="mt-4 text-center w-full">
          <Badge variant={mining.isActive ? 'success' : mining.canClaim ? 'warning' : 'default'}>
            {mining.isActive ? 'Mining Active' : mining.canClaim ? 'Ready to Claim' : 'Inactive'}
          </Badge>

          {mining.isActive && (
            <div className="mt-3 flex items-center justify-center gap-2 text-text-secondary">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Claim in</span>
              <span className="font-mono font-bold text-white">{formatTime(countdown)}</span>
            </div>
          )}

          <p className="mt-2 text-2xl font-bold text-white">
            {formatTrx(mining.earnedSoFar)} <span className="text-sm text-text-secondary">TRX</span>
          </p>
          <p className="text-xs text-text-muted mt-1">Current session earnings</p>
        </div>

        <div className="flex gap-3 mt-5 w-full">
          {mining.canClaim ? (
            <Button className="flex-1" size="lg" loading={isClaiming} onClick={handleClaim}>
              Claim Rewards
            </Button>
          ) : mining.canStart ? (
            <Link to="/mining" className="flex-1">
              <Button className="w-full" size="lg">Start Mining</Button>
            </Link>
          ) : (
            <Link to="/mining" className="flex-1">
              <Button className="w-full" variant="secondary" size="lg">View Mining</Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Mining Rate', value: `${formatTrx(mining.miningRate)}/h` },
          { label: 'Streak', value: `${profile.dailyStreak} days` },
          { label: 'Miner Level', value: `Lv.${profile.minerLevel}` },
        ].map((stat) => (
          <Card key={stat.label} className="text-center py-3">
            <p className="text-xs text-text-muted">{stat.label}</p>
            <p className="font-bold text-sm mt-1">{stat.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
