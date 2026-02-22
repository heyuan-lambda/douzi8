import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Suit } from '../types';

interface SuitSelectorProps {
  onSelect: (suit: Suit) => void;
}

export const SuitSelector: React.FC<SuitSelectorProps> = ({ onSelect }) => {
  const suits: { type: Suit; label: string; color: string; icon: string }[] = [
    { type: 'hearts', label: '红心', color: 'text-red-600', icon: '♥' },
    { type: 'diamonds', label: '方块', color: 'text-red-600', icon: '♦' },
    { type: 'clubs', label: '梅花', color: 'text-black', icon: '♣' },
    { type: 'spades', label: '黑桃', color: 'text-black', icon: '♠' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">选择花色</h2>
        <div className="grid grid-cols-2 gap-4">
          {suits.map((s) => (
            <button
              key={s.type}
              onClick={() => onSelect(s.type)}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <span className={`${s.color} text-4xl mb-2 group-hover:scale-125 transition-transform`}>{s.icon}</span>
              <span className="text-gray-600 font-medium">{s.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
