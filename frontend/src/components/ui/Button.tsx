import { cn } from '@/lib/utils';
import { hapticFeedback } from '@/lib/telegram';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  className,
  onClick,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'tron-gradient text-white shadow-lg shadow-tron-red/20 hover:shadow-tron-red/40',
    secondary: 'bg-surface-card border border-border text-white hover:border-tron-red/50',
    ghost: 'bg-transparent text-text-secondary hover:text-white hover:bg-white/5',
    danger: 'bg-red-900/50 border border-red-500/50 text-red-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3.5 text-base rounded-xl font-semibold',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      onClick={(e) => {
        hapticFeedback('light');
        onClick?.(e);
      }}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
