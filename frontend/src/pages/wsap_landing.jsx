'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Brain, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function DammiAI() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [displayedText, setDisplayedText] = useState('');
  const [particles, setParticles] = useState([]);

  const fullText = "Hi, I'm dammi.ai 💜";

  // Load Bootstrap and Manrope font
  useEffect(() => {
    const bootstrapCSS = document.createElement('link');
    bootstrapCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css';
    bootstrapCSS.rel = 'stylesheet';
    document.head.appendChild(bootstrapCSS);

    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const style = document.createElement('style');
    style.textContent = `
      body { font-family: 'Manrope', sans-serif !important; }
      .cursor-blink { animation: blink 1s infinite; }
      @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    `;
    document.head.appendChild(style);
  }, []);

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Chat simulation
  useEffect(() => {
    const messages = [
      { text: "Hi! Looking for product info 👋", sender: "customer", delay: 500 },
      { text: "Hey! I'd love to help. What product are you interested in?", sender: "ai", delay: 2000 },
      { text: "The blue sneakers from last week", sender: "customer", delay: 3500 },
      { text: "Perfect! I remember you viewed those. They're back in stock in your size 😊", sender: "ai", delay: 5000 }
    ];

    messages.forEach((msg) => {
      setTimeout(() => {
        setChatMessages(prev => [...prev, msg]);
      }, msg.delay);
    });
  }, []);

  // Particle animation
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10
    }));
    setParticles(newParticles);
  }, []);

  const bgStyle = isDarkMode 
    ? { background: '#000000', color: '#ffffff' }
    : { background: '#F9FAFB', color: '#000000' };

  return (
    <div style={{ ...bgStyle, minHeight: '100vh', position: 'relative', overflow: 'hidden', transition: 'all 0.5s' }}>
      
      {/* Particles Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              opacity: 0.3
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Dark/Light Mode Toggle */} 


      
      <motion.button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="btn position-fixed top-0 end-0 m-4 shadow-lg"
        style={{
          zIndex: 1050,
          background: '#3b82f6',
          color: '#ffffff',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 24px',
          fontWeight: 600
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </motion.button>
      
      

      

      {/* Hero Section */}
      <section className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
        <div className="text-center" style={{ maxWidth: '1140px' }}>
          {/* Logo */}
          <motion.div
            className="d-flex align-items-center justify-content-center gap-3 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div 
              className="d-flex align-items-center justify-content-center fw-bold fs-2"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: '#3b82f6',
                color: '#ffffff',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)'
              }}
            >
              D
            </div>
          </motion.div>
          
          <motion.h1 
            className="display-1 fw-bold mb-4"
            style={{
              color: isDarkMode ? '#ffffff' : '#000000',
              textShadow: 'none'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {displayedText}
            <span className="cursor-blink">|</span>
          </motion.h1>
          
          <motion.p 
            className="fs-4 mb-5"
            style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Setup your WhatsApp AI Agent in under 5 minutes.
          </motion.p>

          {/* Mock WhatsApp Chat */}
          <motion.div 
            className="mx-auto mb-5 p-4 rounded-4 border"
            style={{
              maxWidth: '448px',
              background: isDarkMode 
                ? 'rgba(17, 24, 39, 0.8)'
                : 'rgba(249, 250, 251, 0.8)',
              borderColor: isDarkMode ? 'rgba(55, 65, 81, 1)' : 'rgba(229, 231, 235, 1)',
              backdropFilter: 'blur(10px)',
              boxShadow: isDarkMode 
                ? '0 4px 6px rgba(0, 0, 0, 0.3)'
                : '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div 
              className="d-flex align-items-center mb-3 pb-3 border-bottom"
              style={{ borderColor: isDarkMode ? 'rgba(55, 65, 81, 1)' : 'rgba(229, 231, 235, 1)' }}
            >
              <div 
                className="d-flex align-items-center justify-content-center fw-bold me-3"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  color: '#ffffff'
                }}
              >
                D
              </div>
              <div className="text-start">
                <p className="mb-0 fw-semibold" style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                  dammi.ai
                </p>
                <p className="mb-0 small text-success">● online</p>
              </div>
            </div>
            
            <div className="text-start">
              <AnimatePresence>
                {chatMessages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    className={`mb-2 ${msg.sender === 'customer' ? 'text-end' : 'text-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span 
                      className="d-inline-block px-3 py-2 small rounded-4"
                      style={{
                        background: msg.sender === 'customer'
                          ? '#3b82f6'
                          : isDarkMode ? '#374151' : '#f3f4f6',
                        color: msg.sender === 'customer' ? '#ffffff' : isDarkMode ? '#ffffff' : '#000000'
                      }}
                    >
                      {msg.text}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <motion.button
              className="btn btn-lg shadow-lg"
              style={{
                background: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50px',
                padding: '12px 32px',
                fontWeight: 600
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: ['0 0 20px rgba(59, 130, 246, 0.3)', '0 0 40px rgba(59, 130, 246, 0.5)', '0 0 20px rgba(59, 130, 246, 0.3)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Try Demo
            </motion.button>
            <motion.button
              className="btn btn-lg shadow-lg border"
              style={{
                background: 'transparent',
                color: isDarkMode ? '#ffffff' : '#000000',
                borderColor: isDarkMode ? '#ffffff' : '#000000',
                borderRadius: '50px',
                padding: '12px 32px',
                fontWeight: 600,
                borderWidth: '2px'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Set Up Your Agent
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section - Apple Style with Lucide Icons */}
      <section className="container py-5">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="display-3 fw-bold mb-4"
            style={{
              color: isDarkMode ? "white" : "black",
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text'
            }}
          >
            How It Works
          </motion.h2>
          <motion.p 
            className="fs-5 mb-0"
            style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Set up your AI agent in three simple steps
          </motion.p>
        </motion.div>
          
        <div className="row g-4 align-items-stretch">
          {[
            { 
              icon: MessageCircle, 
              title: 'Connect WhatsApp', 
              desc: 'Link your WhatsApp Business account in seconds with our secure integration',
              gradient: 'from-blue-500 to-cyan-500'
            },
            { 
              icon: Brain, 
              title: 'Train Your AI', 
              desc: 'Teach it your brand voice, product knowledge, and customer service style',
              gradient: 'from-purple-500 to-pink-500'
            },
            { 
              icon: Rocket, 
              title: 'Go Live Instantly', 
              desc: 'Start having natural conversations with customers right away',
              gradient: 'from-green-500 to-emerald-500'
            }
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={idx}
                className="col-lg-4 col-md-6"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.7, type: "spring", stiffness: 100 }}
              >
                <motion.div
                  className="h-100 rounded-4 p-5 position-relative overflow-hidden"
                  style={{
                    background: isDarkMode
                      ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))'
                      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))',
                    border: isDarkMode 
                      ? '1px solid rgba(255, 255, 255, 0.1)' 
                      : '1px solid rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: isDarkMode
                      ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
                      : '0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08)'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -5,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  {/* Background Gradient Accent */}
                  <div 
                    className="position-absolute top-0 start-0 w-100 h-1"
                    style={{
                      background: `linear-gradient(90deg, ${isDarkMode ? '#3b82f6' : '#1d4ed8'}, ${isDarkMode ? '#06b6d4' : '#0ea5e9'})`
                    }}
                  />

                  {/* Icon Container */}
                  <motion.div
                    className="rounded-3 p-3 mb-4 d-inline-flex"
                    style={{
                      background: isDarkMode
                        ? 'rgba(59, 130, 246, 0.1)'
                        : 'rgba(59, 130, 246, 0.05)',
                      border: `1px solid ${isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`
                    }}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 5,
                      background: isDarkMode
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'rgba(59, 130, 246, 0.1)'
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <IconComponent 
                      size={32} 
                      color={isDarkMode ? '#60a5fa' : '#1d4ed8'}
                      strokeWidth={1.5}
                    />
                  </motion.div>

                  {/* Step Number */}
                  <div 
                    className="position-absolute top-4 end-4 rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{
                      width: '32px',
                      height: '32px',
                      background: `linear-gradient(135deg, ${isDarkMode ? '#3b82f6' : '#1d4ed8'}, ${isDarkMode ? '#06b6d4' : '#0ea5e9'})`,
                      color: 'white',
                      fontSize: '14px',
                      boxShadow: isDarkMode 
                        ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                        : '0 4px 12px rgba(59, 130, 246, 0.2)'
                    }}
                  >
                    {idx + 1}
                  </div>

                  {/* Content */}
                  <h3 
                    className="h4 fw-bold mb-3"
                    style={{
                      color: isDarkMode ? '#f8fafc' : '#1f2937'
                    }}
                  >
                    {item.title}
                  </h3>
                  <p 
                    className="mb-0 lh-lg"
                    style={{
                      color: isDarkMode ? '#cbd5e1' : '#6b7280',
                      fontSize: '15px'
                    }}
                  >
                    {item.desc}
                  </p>

                  {/* Hover Effect Overlay */}
                  <motion.div
                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                    style={{
                      background: `linear-gradient(135deg, ${isDarkMode ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.02)'}, transparent)`,
                      pointerEvents: 'none'
                    }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </section>
      {/* Why dammi.ai Section */}
      <section className="container py-5">
        <motion.h2 
          className="display-4 fw-bold text-center mb-5"
          style={{
            color: isDarkMode ? '#ffffff' : '#000000',
            textShadow: 'none'
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Why dammi.ai?
        </motion.h2>
        
        <div className="row g-4">
          {[
            { icon: '💬', title: 'Understands Your Customers', desc: 'Reads between the lines and gets context like a human' },
            { icon: '🧠', title: 'Remembers Every Chat', desc: 'Never asks the same question twice, builds real relationships' },
            { icon: '💜', title: 'Talks Like Your Brand', desc: 'Matches your personality, tone, and style perfectly' }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="col-md-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
            >
              <motion.div
                className="p-4 rounded-4 border h-100"
                style={{
                  background: isDarkMode
                    ? 'rgba(17, 24, 39, 0.8)'
                    : 'rgba(249, 250, 251, 0.8)',
                  borderColor: isDarkMode ? 'rgba(55, 65, 81, 1)' : 'rgba(229, 231, 235, 1)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: isDarkMode 
                    ? '0 4px 6px rgba(0, 0, 0, 0.3)'
                    : '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="fs-1 mb-3">{item.icon}</div>
                <h3 className="h4 fw-bold mb-3" style={{ color: '#3b82f6' }}>
                  {item.title}
                </h3>
                <p style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}>
                  {item.desc}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container py-5">
        <motion.h2 
          className="display-4 fw-bold text-center mb-3"
          style={{
            color: isDarkMode ? '#F9FAFB' : '#1f2937',
            textShadow: isDarkMode ? '0 0 20px rgba(16, 185, 129, 0.3)' : '0 0 20px rgba(59, 130, 246, 0.3)'
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Simple pricing for everyone
        </motion.h2>
        <motion.p 
          className="fs-5 text-center mb-5"
          style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          The Most Affordable Ai Whatsapp Agent in the World
        </motion.p>
        
        <div className="row g-4">
          {[
            { name: 'Free Plan', price: '₹0', desc: 'Perfect to get started', features: ['20 chats per day', 'Basic AI responses', 'Community support'] },
            { name: 'Starter Plan', price: '₹499', desc: 'For growing businesses', features: ['Up to 1,000 chats', 'Advanced AI', 'Priority support'], popular: true },
            { name: 'Pro Plan', price: '₹999', desc: 'Unlimited everything', features: ['Unlimited chats', 'Custom persona', 'Dedicated support'] }
          ].map((plan, idx) => (
            <motion.div
              key={idx}
              className="col-md-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
            >
              <motion.div
                className="p-4 rounded-4 border position-relative h-100"
                style={{
                  background: plan.popular
                    ? '#3b82f6'
                    : isDarkMode
                      ? 'rgba(17, 24, 39, 0.8)'
                      : 'rgba(249, 250, 251, 0.8)',
                  borderColor: plan.popular
                    ? '#3b82f6'
                    : isDarkMode ? 'rgba(55, 65, 81, 1)' : 'rgba(229, 231, 235, 1)',
                  color: plan.popular ? '#ffffff' : 'inherit',
                  backdropFilter: 'blur(10px)',
                  boxShadow: plan.popular
                    ? '0 0 40px rgba(59, 130, 246, 0.4)'
                    : isDarkMode 
                      ? '0 4px 6px rgba(0, 0, 0, 0.3)'
                      : '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                whileHover={{ scale: plan.popular ? 1.1 : 1.05 }}
              >
                {plan.popular && (
                  <div 
                    className="position-absolute start-50 translate-middle px-3 py-1 rounded-pill fw-bold small"
                    style={{
                      top: '-12px',
                      background: '#fbbf24',
                      color: '#111827'
                    }}
                  >
                    ✨ POPULAR
                  </div>
                )}
                <h3 className="h4 fw-bold mb-2" style={{
                  color: plan.popular 
                    ? '#ffffff'
                    : '#3b82f6'
                }}>
                  {plan.name}
                </h3>
                <p className="display-4 fw-bold mb-3" style={{
                  color: plan.popular ? '#ffffff' : isDarkMode ? '#ffffff' : '#000000'
                }}>
                  {plan.price}<span className="fs-6">/month</span>
                </p>
                <p className="mb-4" style={{
                  color: plan.popular 
                    ? 'rgba(255, 255, 255, 0.9)'
                    : isDarkMode ? '#d1d5db' : '#6b7280'
                }}>
                  {plan.desc}
                </p>
                <ul className="list-unstyled mb-4" style={{
                  color: plan.popular 
                    ? '#ffffff'
                    : isDarkMode ? '#e5e7eb' : '#6b7280'
                }}>
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="mb-2">
                      <span className="text-success me-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <motion.button
                  className="btn w-100 fw-semibold"
                  style={{
                    background: plan.popular
                      ? '#ffffff'
                      : '#3b82f6',
                    color: plan.popular
                      ? '#3b82f6'
                      : '#ffffff',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '12px'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-5 text-center space-y-4">
        <div className='flex flex-row justify-center space-x-2 '>
          <Link href="/privacy_policy" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }} className="text-decoration-none"> Privacy Policy </Link>
          <Link href="/tos" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }} className="text-decoration-none"> Terms of Service </Link>
        
        </div>

          <motion.p 
          style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          dammi.ai © 2025 — WhatsApp AI Agent, made with 💜 and code.
        </motion.p>

        
        
      </footer>
    </div>
  );
}