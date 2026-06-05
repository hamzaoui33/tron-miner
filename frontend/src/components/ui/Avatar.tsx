import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'User'}
        className={cn('rounded-full object-cover border-2 border-tron-red/30', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-surface-card border-2 border-tron-red/30 flex items-center justify-center text-tron-red font-bold',
        sizes[size],
        className
      )}
    >
      {name?.[0]?.toUpperCase() ?? <User className="w-1/2 h-1/2" />}
    </div>
  );
}
