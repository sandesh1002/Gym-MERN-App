import { useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  perspective?: number;
  scale?: number;
  glareEnabled?: boolean;
}

export function TiltCard({
  children,
  className = '',
  tiltAmount = 10,
  perspective = 1000,
  scale = 1.02,
  glareEnabled = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { stiffness: 300, damping: 30 };
  const rotateX = useSpring(useTransform(y, [0, 1], [tiltAmount, -tiltAmount]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-tiltAmount, tiltAmount]), springConfig);

  const glareX = useTransform(x, [0, 1], ['0%', '100%']);
  const glareY = useTransform(y, [0, 1], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPos = (e.clientX - rect.left) / rect.width;
    const yPos = (e.clientY - rect.top) / rect.height;
    x.set(xPos);
    y.set(yPos);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{
        perspective,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{ scale: isHovered ? scale : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {children}
        {glareEnabled && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none opacity-0"
            style={{
              background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.15) 0%, transparent 60%)`,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

