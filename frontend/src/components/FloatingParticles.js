// components/FloatingParticles.jsx
'use client';

import { useEffect, useRef } from 'react';

export default function FloatingParticles() {
  const particlesRef = useRef(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    // Create particles with random positions and animations
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      
      // Random properties
      const size = Math.random() * 6 + 2;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;
      
      particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: #A5F3FC;
        border-radius: 50%;
        pointer-events: none;
        z-index: 0;
        left: ${posX}vw;
        top: ${posY}vh;
        opacity: ${Math.random() * 0.5 + 0.2};
        animation: floatParticle ${duration}s ease-in-out ${delay}s infinite alternate;
      `;
      
      container.appendChild(particle);
    }

    // Add CSS for the animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatParticle {
        0% {
          transform: translate(0, 0) scale(1);
          opacity: 0.2;
        }
        25% {
          transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) scale(1.2);
        }
        50% {
          transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0.8);
          opacity: 0.7;
        }
        75% {
          transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) scale(1.1);
        }
        100% {
          transform: translate(0, 0) scale(1);
          opacity: 0.2;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
      if (style) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return <div ref={particlesRef} className="fixed inset-0 pointer-events-none" />;
}