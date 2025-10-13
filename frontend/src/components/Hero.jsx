// components/Hero.jsx (updated for Tailwind v4)
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Hero({ terminalMode }) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "hi, i'm dammi.ai 💜";

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setDisplayText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        setInterval(() => {
          setShowCursor(prev => !prev);
        }, 500);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span style={{ 
            color: terminalMode ? '#A5F3FC' : '#C084FC',
            textShadow: terminalMode ? '0 0 10px rgba(165, 243, 252, 0.5)' : '0 0 20px rgba(192, 132, 252, 0.5)'
          }}>
            {displayText}
            {showCursor && '|'}
          </span>
        </h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="text-xl md:text-2xl mb-12"
          style={{ color: terminalMode ? '#A5F3FC' : '#F9A8D4' }}
        >
          where intelligence meets affection.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: terminalMode ? '#A5F3FC' : '#C084FC',
              color: terminalMode ? '#0D0B1E' : 'white',
            }}
            className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:opacity-90"
          >
            Get Started
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              borderColor: terminalMode ? '#A5F3FC' : '#C084FC',
              color: terminalMode ? '#A5F3FC' : '#C084FC',
            }}
            className="px-8 py-4 rounded-full font-semibold border transition-all duration-300 hover:bg-opacity-10"
          >
            Talk to Dammi
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}