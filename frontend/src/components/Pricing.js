'use client';

import { motion } from 'framer-motion';

const pricingTiers = [
  {
    name: 'Free',
    price: 'Rs 0',
    conversations: '50 conversations',
    features: ['Basic emotion recognition', 'Standard support', '1 user']
  },
  {
    name: 'Pro',
    price: 'Rs 999/month',
    conversations: '450 conversations',
    features: ['Advanced emotion recognition', 'Priority support', 'Up to 5 users', 'Custom integrations']
  },
  {
    name: 'Enterprise',
    price: 'Rs 2499/month',
    conversations: '1000 conversations',
    features: ['Full emotion intelligence', '24/7 dedicated support', 'Unlimited users', 'White-label options']
  }
];

export default function Pricing() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-lavender/20"
            >
              <h3 className="text-2xl font-bold text-lavender mb-4">{tier.name}</h3>
              <div className="text-4xl font-bold mb-4">{tier.price}</div>
              <div className="text-softPink mb-6">{tier.conversations}</div>
              <ul className="mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="mb-2">✓ {feature}</li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 rounded-full bg-lavender text-white font-semibold hover:bg-softPink transition-colors"
              >
                Get Started
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}