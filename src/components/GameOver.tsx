import React from 'react';
import { motion } from 'motion/react';
import { PlayerType } from '../types';
import { Trophy, Frown, RotateCcw } from 'lucide-react';

interface GameOverProps {
  winner: PlayerType | null;
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ winner, onRestart }) => {
  const isPlayerWinner = winner === 'player';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center"
      >
        <div className="flex justify-center mb-6">
          {isPlayerWinner ? (
            <div className="bg-yellow-100 p-4 rounded-full">
              <Trophy className="w-16 h-16 text-yellow-500" />
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded-full">
              <Frown className="w-16 h-16 text-gray-500" />
            </div>
          )}
        </div>

        <h2 className="text-4xl font-black mb-2 text-gray-900">
          {isPlayerWinner ? "你赢了！" : "游戏结束"}
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          {isPlayerWinner 
            ? "恭喜！你清空了所有手牌。" 
            : "这次AI更快一步。下次加油！"}
        </p>

        <button
          onClick={onRestart}
          className="flex items-center justify-center w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-lg hover:shadow-indigo-500/30"
        >
          <RotateCcw className="w-5 h-5" />
          再玩一次
        </button>
      </motion.div>
    </div>
  );
};
