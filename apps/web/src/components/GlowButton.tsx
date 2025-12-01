import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'accent';
  className?: string;
}

export default function GlowButton({
  children,
  onClick,
  variant = 'primary',
  className = ''
}: GlowButtonProps) {
  const glowColor = variant === 'primary'
    ? 'shadow-[0_0_20px_rgba(255,107,0,0.5)]'
    : 'shadow-[0_0_20px_rgba(255,0,64,0.5)]';

  const bgColor = variant === 'primary'
    ? 'bg-[#FF6B00]'
    : 'bg-[#FF0040]';

  return (
    <motion.button
      onClick={onClick}
      className={`${bgColor} text-white px-8 py-4 rounded-lg font-semibold text-lg ${glowColor} hover:${glowColor.replace('0.5', '0.8')} transition-all duration-300 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.button>
  );
}
