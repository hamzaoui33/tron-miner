import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { formatTrx, getDisplayName } from '@/lib/utils';
import { hapticFeedback, shareReferralLink } from '@/lib/telegram';
import { motion } from 'framer-motion';
import { Copy, Share2, Users, UserCheck, Coins } from 'lucide-react';
import { useState } from 'react';

export default function Referrals() {
  const { data, isLoading } = useQuery({
    queryKey: ['referrals'],
    queryFn: () => api.referrals.get(),
  });

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.referralLink);
    hapticFeedback('success');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!data) return;
    shareReferralLink(
      data.referralLink,
      'Join me on TRON Miner and start earning virtual TRX! 🚀'
    );
  };

  if (isLoading || !data) return null;

  return (
    <div className="px-4 pb-4 space-y-4">
      <PageHeader title="Referrals" subtitle="Earn 10% of referral mining" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Users, label: 'Total', value: data.totalReferrals },
          { icon: UserCheck, label: 'Active', value: data.activeReferrals },
          { icon: Coins, label: 'Earned', value: `${formatTrx(data.totalRewardsEarned)}` },
        ].map((stat) => (
          <Card key={stat.label} className="text-center py-3">
            <stat.icon className="w-5 h-5 text-tron-red mx-auto mb-1" />
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Referral Link */}
      <Card>
        <p className="text-sm text-text-secondary mb-2">Your Referral Link</p>
        <div className="bg-surface rounded-xl p-3 text-sm text-text-secondary break-all font-mono">
          {data.referralLink}
        </div>
        <div className="flex gap-3 mt-3">
          <Button className="flex-1" variant="secondary" onClick={handleCopy}>
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button className="flex-1" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </Card>

      {/* Referral List */}
      <div>
        <h3 className="font-semibold mb-3">Your Referrals</h3>
        {data.referrals.length === 0 ? (
          <Card className="text-center py-8">
            <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">No referrals yet</p>
            <p className="text-xs text-text-muted mt-1">Share your link to start earning</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {data.referrals.map((ref, i) => (
              <motion.div
                key={ref.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="flex items-center gap-3 py-3">
                  <Avatar src={ref.photoUrl} name={ref.firstName} size="sm" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {getDisplayName(ref.username, ref.firstName)}
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-tron-red">
                      +{formatTrx(ref.rewardEarned)}
                    </p>
                    <p className="text-xs text-text-muted">TRX earned</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
