"use client";

import { motion } from "framer-motion";

const PetalSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C16.5 6.5 21 10.5 21 15C21 19.5 17.5 22 12 22C6.5 22 3 19.5 3 15C3 10.5 7.5 6.5 12 2Z"
      fill="rgba(212, 144, 122, 0.45)"
    />
  </svg>
);

interface Petal {
  id: number;
  left: string;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

const petals: Petal[] = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 90 + 5}%`,
  delay: Math.random() * 4,
  duration: 6 + Math.random() * 4, // random duration between 6-10 seconds
  size: 0.6 + Math.random() * 0.6,
  opacity: 0.2 + Math.random() * 0.4,
}));

export function FloatingLeaves() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute"
          style={{ left: petal.left, bottom: "-40px", opacity: petal.opacity, scale: petal.size }}
          animate={{
            y: ["0px", "-110vh"],
            rotate: [0, 180 + Math.random() * 180],
            x: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 80, 0]
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <PetalSVG />
        </motion.div>
      ))}
    </div>
  );
}
