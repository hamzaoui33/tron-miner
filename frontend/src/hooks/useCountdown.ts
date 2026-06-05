import { useState, useEffect } from 'react';

export function useCountdown(targetMs: number, active = true) {
  const [remaining, setRemaining] = useState(targetMs);

  useEffect(() => {
    if (!active || targetMs <= 0) {
      setRemaining(0);
      return;
    }

    setRemaining(targetMs);

    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetMs, active]);

  return remaining;
}
