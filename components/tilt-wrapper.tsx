"use client";

import React, { useRef } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

interface TiltWrapperProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function TiltWrapper({ children, className = "", delay = 0 }: TiltWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Motion values for X and Y rotation
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Springs for smooth movement
  const rotateX = useSpring(x, { damping: 25, stiffness: 120 });
  const rotateY = useSpring(y, { damping: 25, stiffness: 120 });

  // Sheen overlay reflection position
  const sheenX = useMotionValue(0);
  const sheenY = useMotionValue(0);
  const sheenOpacity = useMotionValue(0);
  
  const springSheenX = useSpring(sheenX, { damping: 20, stiffness: 150 });
  const springSheenY = useSpring(sheenY, { damping: 20, stiffness: 150 });
  const springSheenOpacity = useSpring(sheenOpacity, { damping: 15, stiffness: 120 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Get mouse position relative to element center
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;

    // Calculate rotation: max 8 degrees
    const rX = -(mouseY / (height / 2)) * 8;
    const rY = (mouseX / (width / 2)) * 8;

    x.set(rX);
    y.set(rY);

    // Sheen reflection position relative to card boundaries
    const sheenPercX = ((event.clientX - rect.left) / width) * 100;
    const sheenPercY = ((event.clientY - rect.top) / height) * 100;
    sheenX.set(sheenPercX);
    sheenY.set(sheenPercY);
    sheenOpacity.set(0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    sheenOpacity.set(0);
  };

  const sheenBackground = useTransform(
    [springSheenX, springSheenY],
    ([xVal, yVal]) => `radial-gradient(circle 200px at ${xVal}% ${yVal}%, rgba(255,255,255,0.14) 0%, rgba(159,232,112,0.04) 40%, rgba(255,255,255,0) 80%)`
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className={`relative group will-change-transform ${className}`}
    >
      {/* Light sheen reflection overlay */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
        style={{
          background: sheenBackground,
          opacity: springSheenOpacity,
        }}
      />
      
      {/* 3D Border Glow Layer */}
      <div 
        className="absolute inset-0 rounded-[inherit] pointer-events-none z-10 transition-all duration-300 opacity-0 group-hover:opacity-100" 
        style={{
          border: "1.5px solid rgba(159, 232, 112, 0.28)",
          boxShadow: "0 0 25px rgba(159, 232, 112, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
        }}
      />

      {/* Actual inner contents projecting slightly forward with preserve-3d */}
      <div style={{ transform: "translateZ(15px)", transformStyle: "preserve-3d" }} className="h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
