import { motion } from 'framer-motion';

interface FloatingGhostProps {
  delay?: number;
  size?: number;
}

export default function FloatingGhost({ delay = 0, size = 60 }: FloatingGhostProps) {
  return (
    <motion.div
      className="absolute opacity-30 pointer-events-none"
      style={{
        left: `${Math.random() * 80 + 10}%`,
        top: `${Math.random() * 60 + 20}%`,
      }}
      animate={{
        y: [-20, 20, -20],
        x: [-10, 10, -10],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{
        duration: 5,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M32 8C19.85 8 10 17.85 10 30V48C10 50.21 11.79 52 14 52C16.21 52 18 50.21 18 48V44C18 41.79 19.79 40 22 40C24.21 40 26 41.79 26 44V48C26 50.21 27.79 52 30 52C32.21 52 34 50.21 34 48V44C34 41.79 35.79 40 38 40C40.21 40 42 41.79 42 44V48C42 50.21 43.79 52 46 52C48.21 52 50 50.21 50 48V30C50 17.85 40.15 8 28 8H32Z"
          fill="#FF6B00"
          fillOpacity="0.6"
        />
        <circle cx="24" cy="26" r="4" fill="#0B0B0B" />
        <circle cx="40" cy="26" r="4" fill="#0B0B0B" />
      </svg>
    </motion.div>
  );
}
