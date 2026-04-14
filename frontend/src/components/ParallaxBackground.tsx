import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const ParallaxBackground: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Hareket aralıkları (hafif hareket için)
  const moveX = useTransform(springX, [0, window.innerWidth], [-20, 20]);
  const moveY = useTransform(springY, [0, window.innerHeight], [-20, 20]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-900">
      {/* Background Image */}
      <motion.div 
        style={{ 
          x: moveX, 
          y: moveY,
          backgroundImage: 'url("/bg-premium.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          scale: 1.1 // Kenarlarda boşluk kalmaması için hafif büyük
        }}
        className="absolute inset-[-40px] opacity-40 grayscale-[20%] sepia-[10%]"
      />
      
      {/* Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-royal-blue/40 via-transparent to-slate-900/60 backdrop-blur-[2px]" />
    </div>
  );
};

export default ParallaxBackground;
