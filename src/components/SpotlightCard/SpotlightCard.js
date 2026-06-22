'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function SpotlightCard({ children, className }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  const [hovering, setHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    // For rotation
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);

    // For spotlight
    setMousePosition({ x: mouseX, y: mouseY });
  };

  const handleMouseEnter = () => setHovering(true);
  const handleMouseLeave = () => {
    setHovering(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`glass-panel ${className}`}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {hovering && (
        <div
          style={{
            position: 'absolute',
            top: mousePosition.y - 150,
            left: mousePosition.x - 150,
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.6,
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1, transform: 'translateZ(30px)' }}>
        {children}
      </div>
    </motion.div>
  );
}
