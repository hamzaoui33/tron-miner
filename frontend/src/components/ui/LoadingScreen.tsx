import { motion } from 'framer-motion';

export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-6">
      <motion.div
        className="relative w-20 h-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-tron-red/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-tron-red" />
        <div className="absolute inset-2 rounded-full bg-tron-red/10 flex items-center justify-center">
          <span className="text-tron-red font-bold text-lg">T</span>
        </div>
      </motion.div>
      <p className="text-text-secondary text-sm animate-pulse">{message}</p>
    </div>
  );
}
