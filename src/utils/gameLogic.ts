import { Card, Suit, Rank } from '../types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank, index) => {
      deck.push({
        id: `${rank}-${suit}`,
        suit,
        rank,
        value: index + 1,
      });
    });
  });
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const isPlayable = (card: Card, currentSuit: Suit | null, currentRank: Rank | null): boolean => {
  if (card.rank === '8') return true;
  return card.suit === currentSuit || card.rank === currentRank;
};

export const getAiMove = (hand: Card[], currentSuit: Suit | null, currentRank: Rank | null): Card | null => {
  // Priority 1: Normal matching cards (not 8s)
  const playableNormal = hand.filter(c => c.rank !== '8' && isPlayable(c, currentSuit, currentRank));
  if (playableNormal.length > 0) {
    return playableNormal[Math.floor(Math.random() * playableNormal.length)];
  }

  // Priority 2: 8s
  const eights = hand.filter(c => c.rank === '8');
  if (eights.length > 0) {
    return eights[0];
  }

  return null;
};

export const getBestSuitForAi = (hand: Card[]): Suit => {
  const counts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
  hand.forEach(c => {
    if (c.rank !== '8') {
      counts[c.suit]++;
    }
  });
  
  let bestSuit: Suit = 'hearts';
  let maxCount = -1;
  
  (Object.keys(counts) as Suit[]).forEach(suit => {
    if (counts[suit] > maxCount) {
      maxCount = counts[suit];
      bestSuit = suit;
    }
  });
  
  return bestSuit;
};
