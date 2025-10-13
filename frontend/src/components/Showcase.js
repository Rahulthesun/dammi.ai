'use client';

import { motion } from 'framer-motion';

export default function Showcase() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-3xl md:text-5xl font-bold mb-8"
        >
          Powered by emotion. Driven by intelligence.
        </motion.div>
      </div>
      {/* Floating blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-lavender/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-softPink/20 rounded-full blur-xl"></div>
    </section>
  );
}