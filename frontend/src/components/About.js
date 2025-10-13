'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

function Card({ title, content, index }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg"
    >
      <h3 className="text-2xl font-bold text-lavender mb-4">{title}</h3>
      <p className="text-white/80">{content}</p>
    </motion.div>
  );
}

export default function About() {
  const cards = [
    {
      title: "Emotionally Intelligent",
      content: "Dammi.ai understands and responds to your emotions, making interactions feel human and caring."
    },
    {
      title: "Always Learning",
      content: "Our AI continuously evolves to better serve you, adapting to your unique communication style."
    },
    {
      title: "Privacy Focused",
      content: "Your conversations are secure and private. We believe in transparent data practices."
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">What is dammi.ai?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <Card key={index} title={card.title} content={card.content} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}