import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, glow, onClick }: CardProps) {
  return (
    <motion.div
      className={cn(
        'glass-card rounded-2xl p-4',
        glow && 'animate-pulse-glow',
        onClick && 'cursor-pointer active:scale-[0.98] transition-transform',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
