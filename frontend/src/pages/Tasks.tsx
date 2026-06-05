import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatTrx } from '@/lib/utils';
import { hapticFeedback, getTelegramWebApp } from '@/lib/telegram';
import { motion } from 'framer-motion';
import { CheckSquare, ExternalLink, Check, MessageCircle, Twitter, Users } from 'lucide-react';

const TASK_ICONS: Record<string, typeof CheckSquare> = {
  telegram_channel: MessageCircle,
  telegram_group: Users,
  twitter: Twitter,
  referral: Users,
  custom: CheckSquare,
};

export default function Tasks() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.tasks.get(),
  });

  const completeMutation = useMutation({
    mutationFn: (taskId: string) => api.tasks.complete(taskId),
    onSuccess: () => {
      hapticFeedback('success');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: () => hapticFeedback('error'),
  });

  const handleTaskAction = (task: { id: string; url: string | null; completed: boolean }) => {
    if (task.url) {
      const tg = getTelegramWebApp();
      if (tg) {
        tg.openLink(task.url);
      } else {
        window.open(task.url, '_blank');
      }
    }
  };

  if (isLoading || !data) return null;

  const completedCount = data.tasks.filter((t) => t.completed).length;

  return (
    <div className="px-4 pb-4 space-y-4">
      <PageHeader
        title="Tasks"
        subtitle={`${completedCount}/${data.tasks.length} completed`}
      />

      <div className="space-y-3">
        {data.tasks.map((task, i) => {
          const Icon = TASK_ICONS[task.type] ?? CheckSquare;

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className={task.completed ? 'opacity-60' : ''}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-tron-red/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-tron-red" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{task.title}</h3>
                      {task.completed && <Badge variant="success">Done</Badge>}
                    </div>
                    {task.description && (
                      <p className="text-xs text-text-muted mt-0.5">{task.description}</p>
                    )}
                    <p className="text-sm font-bold text-tron-red mt-1">
                      +{formatTrx(task.reward)} TRX
                    </p>
                  </div>
                </div>

                {!task.completed && (
                  <div className="flex gap-2 mt-3">
                    {task.url && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleTaskAction(task)}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="flex-1"
                      loading={completeMutation.isPending}
                      onClick={() => completeMutation.mutate(task.id)}
                    >
                      <Check className="w-4 h-4" />
                      Complete
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
