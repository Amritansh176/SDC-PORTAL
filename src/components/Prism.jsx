import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function Prism({ children, className }) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    // A beautiful slow moving glowing effect
    gsap.to('.prism-glow', {
      rotation: 360,
      duration: 20,
      repeat: -1,
      ease: 'linear',
    });
  }, []);

  return (
    <div ref={containerRef} className={`relative overflow-hidden w-full h-full rounded-3xl border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl ${className}`}>
      {/* Animated Gradient Orbs */}
      <div className="prism-glow absolute -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none opacity-50 mix-blend-screen">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-purple-600/30 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 w-[35vw] h-[35vw] bg-blue-600/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[45vw] h-[45vw] bg-teal-600/20 rounded-full blur-[100px]" />
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
}
