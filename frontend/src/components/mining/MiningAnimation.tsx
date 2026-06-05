import { motion } from 'framer-motion';

interface MiningAnimationProps {
  active?: boolean;
  size?: 'sm' | 'lg';
}

export function MiningAnimation({ active = true, size = 'lg' }: MiningAnimationProps) {
  const isLarge = size === 'lg';

  return (
    <div className={`relative flex items-center justify-center ${isLarge ? 'w-48 h-48' : 'w-24 h-24'}`}>
      {/* Outer ring */}
      <motion.div
        className={`absolute rounded-full border-2 ${active ? 'border-tron-red/40' : 'border-border'}`}
        style={{ width: '100%', height: '100%' }}
        animate={active ? { rotate: 360 } : {}}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Middle ring */}
      <motion.div
        className={`absolute rounded-full border ${active ? 'border-tron-red/60' : 'border-border'}`}
        style={{ width: '75%', height: '75%' }}
        animate={active ? { rotate: -360 } : {}}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Inner glow */}
      <motion.div
        className={`absolute rounded-full ${active ? 'bg-tron-red/20 animate-pulse-glow' : 'bg-surface-card'}`}
        style={{ width: '50%', height: '50%' }}
        animate={active ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Core */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className={`font-bold tron-text-gradient ${isLarge ? 'text-3xl' : 'text-lg'}`}
          animate={active ? { opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          TRX
        </motion.div>
        {active && (
          <motion.div
            className="flex gap-1 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-tron-red"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Orbiting particles */}
      {active &&
        [0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-tron-red/80"
            style={{ top: '50%', left: '50%' }}
            animate={{
              x: [0, Math.cos((i * Math.PI) / 2) * (isLarge ? 80 : 40)],
              y: [0, Math.sin((i * Math.PI) / 2) * (isLarge ? 80 : 40)],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
    </div>
  );
}
