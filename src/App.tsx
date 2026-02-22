import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Card, 
  Suit, 
  Rank, 
  GameState, 
  PlayerType 
} from './types';
import { 
  createDeck, 
  shuffleDeck, 
  isPlayable, 
  getAiMove, 
  getBestSuitForAi 
} from './utils/gameLogic';
import { PlayingCard } from './components/PlayingCard';
import { SuitSelector } from './components/SuitSelector';
import { GameOver } from './components/GameOver';
import { Layers, User, Cpu, Info, AlertCircle } from 'lucide-react';

const INITIAL_HAND_SIZE = 8;

export default function App() {
  const [game, setGame] = useState<GameState>({
    deck: [],
    playerHand: [],
    aiHand: [],
    discardPile: [],
    currentSuit: null,
    currentRank: null,
    turn: 'player',
    status: 'waiting',
    winner: null,
    lastAction: '欢迎来到豆子的疯狂8点！',
  });

  const aiActionTimeout = useRef<NodeJS.Timeout | null>(null);

  const translateSuit = (suit: Suit | null) => {
    switch (suit) {
      case 'hearts': return '红心';
      case 'diamonds': return '方块';
      case 'clubs': return '梅花';
      case 'spades': return '黑桃';
      default: return '';
    }
  };

  const startNewGame = useCallback(() => {
    const fullDeck = shuffleDeck(createDeck());
    const playerHand = fullDeck.splice(0, INITIAL_HAND_SIZE);
    const aiHand = fullDeck.splice(0, INITIAL_HAND_SIZE);
    
    // Initial discard must not be an 8
    let discardIndex = 0;
    while (fullDeck[discardIndex].rank === '8') {
      discardIndex++;
    }
    const firstDiscard = fullDeck.splice(discardIndex, 1)[0];

    setGame({
      deck: fullDeck,
      playerHand,
      aiHand,
      discardPile: [firstDiscard],
      currentSuit: firstDiscard.suit,
      currentRank: firstDiscard.rank,
      turn: 'player',
      status: 'playing',
      winner: null,
      lastAction: '游戏开始！轮到你了。',
    });
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const checkWinner = (gameState: GameState) => {
    if (gameState.playerHand.length === 0) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      return 'player';
    }
    if (gameState.aiHand.length === 0) {
      return 'ai';
    }
    return null;
  };

  const handleDraw = () => {
    if (game.turn !== 'player' || game.status !== 'playing') return;

    if (game.deck.length === 0) {
      setGame(prev => ({
        ...prev,
        turn: 'ai',
        lastAction: '摸牌堆已空！跳过至AI回合。'
      }));
      return;
    }

    const newDeck = [...game.deck];
    const drawnCard = newDeck.pop()!;
    
    setGame(prev => ({
      ...prev,
      deck: newDeck,
      playerHand: [...prev.playerHand, drawnCard],
      lastAction: '你摸了一张牌。',
    }));
  };

  const handlePlayerPlay = (card: Card) => {
    if (game.turn !== 'player' || game.status !== 'playing') return;
    if (!isPlayable(card, game.currentSuit, game.currentRank)) return;

    const newHand = game.playerHand.filter(c => c.id !== card.id);
    const newDiscard = [...game.discardPile, card];

    if (card.rank === '8') {
      setGame(prev => ({
        ...prev,
        playerHand: newHand,
        discardPile: newDiscard,
        status: 'suitSelection',
        lastAction: '你打出了一个8！请选择花色。'
      }));
    } else {
      const nextGame = {
        ...game,
        playerHand: newHand,
        discardPile: newDiscard,
        currentSuit: card.suit,
        currentRank: card.rank,
        turn: 'ai' as PlayerType,
        lastAction: `你打出了 ${translateSuit(card.suit)} ${card.rank}。`
      };

      const winner = checkWinner(nextGame);
      if (winner) {
        setGame({ ...nextGame, status: 'gameOver', winner });
      } else {
        setGame(nextGame);
      }
    }
  };

  const handleSuitSelect = (suit: Suit) => {
    const nextGame = {
      ...game,
      currentSuit: suit,
      currentRank: '8' as Rank,
      status: 'playing' as const,
      turn: 'ai' as PlayerType,
      lastAction: `花色已更改为 ${translateSuit(suit)}。轮到AI。`
    };

    const winner = checkWinner(nextGame);
    if (winner) {
      setGame({ ...nextGame, status: 'gameOver', winner });
    } else {
      setGame(nextGame);
    }
  };

  // AI Turn Logic
  useEffect(() => {
    if (game.turn === 'ai' && game.status === 'playing' && !game.winner) {
      aiActionTimeout.current = setTimeout(() => {
        const aiMove = getAiMove(game.aiHand, game.currentSuit, game.currentRank);

        if (aiMove) {
          const newHand = game.aiHand.filter(c => c.id !== aiMove.id);
          const newDiscard = [...game.discardPile, aiMove];

          if (aiMove.rank === '8') {
            const bestSuit = getBestSuitForAi(newHand);
            const nextGame = {
              ...game,
              aiHand: newHand,
              discardPile: newDiscard,
              currentSuit: bestSuit,
              currentRank: '8' as Rank,
              turn: 'player' as PlayerType,
              lastAction: `AI 打出了一个8并选择了 ${translateSuit(bestSuit)}。`
            };
            const winner = checkWinner(nextGame);
            if (winner) setGame({ ...nextGame, status: 'gameOver', winner });
            else setGame(nextGame);
          } else {
            const nextGame = {
              ...game,
              aiHand: newHand,
              discardPile: newDiscard,
              currentSuit: aiMove.suit,
              currentRank: aiMove.rank,
              turn: 'player' as PlayerType,
              lastAction: `AI 打出了 ${translateSuit(aiMove.suit)} ${aiMove.rank}。`
            };
            const winner = checkWinner(nextGame);
            if (winner) setGame({ ...nextGame, status: 'gameOver', winner });
            else setGame(nextGame);
          }
        } else {
          // AI needs to draw
          if (game.deck.length > 0) {
            const newDeck = [...game.deck];
            const drawnCard = newDeck.pop()!;
            setGame(prev => ({
              ...prev,
              deck: newDeck,
              aiHand: [...prev.aiHand, drawnCard],
              lastAction: 'AI 摸了一张牌。'
            }));
          } else {
            // AI can't draw, skip turn
            setGame(prev => ({
              ...prev,
              turn: 'player',
              lastAction: 'AI 跳过了回合（无牌可出且摸牌堆已空）。'
            }));
          }
        }
      }, 1500);
    }

    return () => {
      if (aiActionTimeout.current) clearTimeout(aiActionTimeout.current);
    };
  }, [game.turn, game.status, game.aiHand, game.currentSuit, game.currentRank, game.deck, game.discardPile, game.winner]);

  const topDiscard = game.discardPile[game.discardPile.length - 1];

  return (
    <div className="min-h-screen bg-[#1a472a] text-white font-sans selection:bg-yellow-400 selection:text-black overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-2xl font-black italic">8</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden sm:block">豆子的疯狂8点</h1>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
            <Layers className="w-4 h-4 text-yellow-400" />
            <span>{game.deck.length} 张牌</span>
          </div>
          <button 
            onClick={startNewGame}
            className="px-4 py-1.5 bg-white text-black rounded-full hover:bg-yellow-400 transition-colors"
          >
            重置
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-grow relative flex flex-col p-4 sm:p-8 max-w-6xl mx-auto w-full">
        
        {/* AI Area */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-4 px-4 py-1 bg-black/30 rounded-full border border-white/10">
            <Cpu className="w-4 h-4 text-red-400" />
            <span className="text-xs uppercase tracking-widest font-bold">对手 ({game.aiHand.length})</span>
            {game.turn === 'ai' && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="w-2 h-2 bg-red-500 rounded-full ml-1" />}
          </div>
          <div className="flex justify-center -space-x-8 sm:-space-x-12">
            {game.aiHand.map((card, i) => (
              <PlayingCard 
                key={card.id} 
                suit={card.suit} 
                rank={card.rank} 
                isFaceUp={false} 
                index={i}
                className="scale-90 opacity-80"
              />
            ))}
          </div>
        </div>

        {/* Center Table */}
        <div className="flex-grow flex items-center justify-center gap-8 sm:gap-16 my-4">
          {/* Draw Pile */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-white/5 rounded-2xl blur-xl group-hover:bg-white/10 transition-colors" />
            <div 
              onClick={handleDraw}
              className={`relative cursor-pointer transition-transform active:scale-95 ${game.turn !== 'player' ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <PlayingCard suit="spades" rank="A" isFaceUp={false} className="shadow-2xl" />
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                摸牌
              </div>
            </div>
          </div>

          {/* Discard Pile */}
          <div className="relative">
            <div className="absolute -inset-8 bg-indigo-500/20 rounded-full blur-3xl" />
            <AnimatePresence mode="wait">
              {topDiscard && (
                <PlayingCard 
                  key={topDiscard.id}
                  suit={topDiscard.suit} 
                  rank={topDiscard.rank} 
                  className="shadow-2xl relative z-10"
                />
              )}
            </AnimatePresence>
            
            {/* Current Suit Indicator (for 8s) */}
            {game.currentRank === '8' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl whitespace-nowrap"
              >
                <AlertCircle className="w-3 h-3 text-indigo-600" />
                当前花色：{translateSuit(game.currentSuit).toUpperCase()}
              </motion.div>
            )}
          </div>
        </div>

        {/* Action Log */}
        <div className="flex justify-center mb-8">
           <div className="bg-black/40 backdrop-blur-sm px-6 py-2 rounded-2xl border border-white/5 flex items-center gap-3">
              <Info className="w-4 h-4 text-indigo-400" />
              <p className="text-sm font-medium text-white/80 italic">{game.lastAction}</p>
           </div>
        </div>

        {/* Player Area */}
        <div className="mt-auto flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 px-4 py-1 bg-black/30 rounded-full border border-white/10">
            <User className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-widest font-bold">你的手牌 ({game.playerHand.length})</span>
            {game.turn === 'player' && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="w-2 h-2 bg-emerald-500 rounded-full ml-1" />}
          </div>
          
          <div className="w-full overflow-x-auto pb-8 flex justify-center no-scrollbar">
            <div className="flex -space-x-6 sm:-space-x-10 px-10">
              {game.playerHand.map((card, i) => (
                <PlayingCard 
                  key={card.id} 
                  suit={card.suit} 
                  rank={card.rank} 
                  isPlayable={game.turn === 'player' && isPlayable(card, game.currentSuit, game.currentRank)}
                  onClick={() => handlePlayerPlay(card)}
                  index={i}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {game.status === 'suitSelection' && (
          <SuitSelector onSelect={handleSuitSelect} />
        )}
        {game.status === 'gameOver' && (
          <GameOver winner={game.winner} onRestart={startNewGame} />
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
