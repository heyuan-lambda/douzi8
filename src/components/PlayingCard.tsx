import React from 'react';
import { motion } from 'motion/react';
import { Suit, Rank } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PlayingCardProps {
  suit: Suit;
  rank: Rank;
  isFaceUp?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
  index?: number;
}

const SuitIcon = ({ suit, className }: { suit: Suit; className?: string }) => {
  switch (suit) {
    case 'hearts': return <span className={cn("text-red-600", className)}>♥</span>;
    case 'diamonds': return <span className={cn("text-red-600", className)}>♦</span>;
    case 'clubs': return <span className={cn("text-black", className)}>♣</span>;
    case 'spades': return <span className={cn("text-black", className)}>♠</span>;
  }
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  suit,
  rank,
  isFaceUp = true,
  onClick,
  isPlayable = false,
  className,
  index = 0,
}) => {
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={isPlayable ? { y: -20, scale: 1.05 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={cn(
        "relative w-20 h-28 sm:w-24 sm:h-36 rounded-lg shadow-md cursor-pointer transition-shadow duration-200",
        isFaceUp ? "bg-white border border-gray-200" : "bg-indigo-800 border-2 border-white",
        isPlayable && "ring-4 ring-yellow-400 shadow-xl",
        !isPlayable && isFaceUp && "opacity-90 grayscale-[0.2]",
        className
      )}
      style={{
        zIndex: index,
      }}
    >
      {isFaceUp ? (
        <div className="flex flex-col h-full p-1 sm:p-2 select-none">
          <div className="flex flex-col items-start leading-none">
            <span className={cn("text-sm sm:text-lg font-bold", (suit === 'hearts' || suit === 'diamonds') ? "text-red-600" : "text-black")}>
              {rank}
            </span>
            <SuitIcon suit={suit} className="text-xs sm:text-sm" />
          </div>
          
          <div className="flex-grow flex items-center justify-center">
            <SuitIcon suit={suit} className="text-2xl sm:text-4xl" />
          </div>
          
          <div className="flex flex-col items-end leading-none rotate-180">
            <span className={cn("text-sm sm:text-lg font-bold", (suit === 'hearts' || suit === 'diamonds') ? "text-red-600" : "text-black")}>
              {rank}
            </span>
            <SuitIcon suit={suit} className="text-xs sm:text-sm" />
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
          <div className="w-full h-full border-4 border-white/20 flex items-center justify-center">
             <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center">
                <span className="text-white/40 font-bold text-xl italic">T</span>
             </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
