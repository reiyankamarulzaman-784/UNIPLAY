import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MatchPair } from '../../types/index.js';
import { RotateCcw, CheckCircle2, Timer, Eye } from 'lucide-react';

interface CardItem {
  uid: string;
  pairId: string;
  content: string;
  isTerm: boolean;
}

interface MemoryMatchGameProps {
  pairs: MatchPair[];
  title?: string;
  instructions?: string;
  onGameComplete?: (score: number) => void;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  pairs,
  title = 'Memory Match Grid',
  instructions = 'Flip tiles face-up to reveal matching terms and definitions.',
  onGameComplete,
}) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  useEffect(() => {
    restartGame();
  }, [pairs]);

  useEffect(() => {
    if (!isGameOver) {
      const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isGameOver]);

  const restartGame = () => {
    const deck: CardItem[] = [];
    const activePairs = pairs.slice(0, 6); // 12 cards

    activePairs.forEach((p, idx) => {
      deck.push({
        uid: `term-${idx}-${p.id}`,
        pairId: p.id,
        content: p.term,
        isTerm: true,
      });
      deck.push({
        uid: `def-${idx}-${p.id}`,
        pairId: p.id,
        content: p.definition,
        isTerm: false,
      });
    });

    setCards(deck.sort(() => Math.random() - 0.5));
    setFlippedUids([]);
    setMatchedPairIds([]);
    setMoves(0);
    setSeconds(0);
    setIsGameOver(false);
  };

  const handleCardClick = (card: CardItem) => {
    if (flippedUids.length >= 2 || flippedUids.includes(card.uid) || matchedPairIds.includes(card.pairId)) {
      return;
    }

    const nextFlipped = [...flippedUids, card.uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const firstCard = cards.find((c) => c.uid === nextFlipped[0])!;
      const secondCard = card;

      if (firstCard.pairId === secondCard.pairId) {
        // Matched!
        const nextMatched = [...matchedPairIds, card.pairId];
        setMatchedPairIds(nextMatched);
        setFlippedUids([]);
        confetti({ particleCount: 25, spread: 45 });

        if (nextMatched.length === Math.min(6, pairs.length)) {
          setIsGameOver(true);
          const finalScore = Math.max(100, 1000 - moves * 20 - seconds * 3);
          onGameComplete?.(finalScore);
          confetti({ particleCount: 80, spread: 70 });
        }
      } else {
        // Not matched, flip back after 1 second
        setTimeout(() => {
          setFlippedUids([]);
        }, 1100);
      }
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{instructions}</p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <Eye className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400">Moves:</span>
            <strong className="text-white text-sm">{moves}</strong>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <Timer className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Time:</span>
            <strong className="text-white text-sm">{seconds}s</strong>
          </div>
        </div>
      </div>

      {isGameOver ? (
        <div className="py-8 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h4 className="text-2xl font-bold text-white mb-2">Memory Grid Cleared!</h4>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            You solved all pairs in {moves} moves and {seconds} seconds. Excellent recall!
          </p>
          <button
            onClick={restartGame}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card) => {
            const isFlipped = flippedUids.includes(card.uid) || matchedPairIds.includes(card.pairId);
            const isMatched = matchedPairIds.includes(card.pairId);

            return (
              <button
                key={card.uid}
                disabled={isMatched}
                onClick={() => handleCardClick(card)}
                className={`min-h-[105px] sm:min-h-[120px] p-3 rounded-xl border text-center flex flex-col items-center justify-center transition-all duration-300 relative select-none ${
                  isMatched
                    ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : isFlipped
                    ? 'border-indigo-500 bg-indigo-950/50 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900 cursor-pointer'
                }`}
              >
                {isFlipped ? (
                  <div className="animate-fadeIn">
                    <span
                      className={`font-semibold leading-snug line-clamp-3 ${
                        card.isTerm ? 'text-sm font-bold text-indigo-300' : 'text-xs text-slate-200'
                      }`}
                    >
                      {card.content}
                    </span>
                    {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-2 mx-auto" />}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center opacity-40">
                    <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-500 font-mono text-xs">
                      ?
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
