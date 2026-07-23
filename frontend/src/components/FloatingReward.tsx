import { AnimatePresence, motion } from 'framer-motion';
import type { CSSProperties } from 'react';

export type FloatingRewardBurst = {
  id: string;
  x: number;
  y: number;
  coins?: number;
  xp?: number;
};

type FloatingRewardProps = {
  burst: FloatingRewardBurst | null;
};

export default function FloatingReward({ burst }: FloatingRewardProps) {
  return (
    <AnimatePresence>
      {burst ? (
        <motion.div
          key={burst.id}
          className="foru-floating-reward"
          style={{ left: burst.x, top: burst.y }}
          initial={{ opacity: 0, y: 8, scale: 0.82 }}
          animate={{ opacity: 1, y: -46, scale: 1 }}
          exit={{ opacity: 0, y: -76, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 360, damping: 24 }}
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <i key={index} style={{ '--particle-index': index } as CSSProperties} />
          ))}
          {burst.coins ? <strong>+{burst.coins} 🪙</strong> : null}
          {burst.xp ? <span>+{burst.xp} XP ✨</span> : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
