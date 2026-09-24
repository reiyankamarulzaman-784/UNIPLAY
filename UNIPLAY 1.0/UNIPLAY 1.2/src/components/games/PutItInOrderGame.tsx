import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { OrderItem } from '../../types/index.js';
import { ArrowUp, ArrowDown, CheckCircle2, RotateCcw, ListOrdered } from 'lucide-react';

interface PutItInOrderGameProps {
  items: OrderItem[];
  processName?: string;
  title?: string;
  instructions?: string;
  onGameComplete?: (score: number) => void;
}

export const PutItInOrderGame: React.FC<PutItInOrderGameProps> = ({
  items,
  processName = 'Chronological Process',
  title = 'Put It In Order',
  instructions = 'Arrange the steps into the correct chronological or procedural sequence.',
  onGameComplete,
}) => {
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrectAll, setIsCorrectAll] = useState<boolean>(false);

  useEffect(() => {
    restartGame();
  }, [items]);

  const restartGame = () => {
    // Scramble items
    const scrambled = [...items].sort(() => Math.random() - 0.5);
    setCurrentOrder(scrambled);
    setIsSubmitted(false);
    setIsCorrectAll(false);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (isSubmitted) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentOrder.length) return;

    const copy = [...currentOrder];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setCurrentOrder(copy);
  };

  const handleSubmit = () => {
    let perfect = true;
    currentOrder.forEach((item, idx) => {
      if (item.stepNumber !== idx + 1) {
        perfect = false;
      }
    });

    setIsSubmitted(true);
    setIsCorrectAll(perfect);

    if (perfect) {
      confetti({ particleCount: 70, spread: 70 });
      onGameComplete?.(400);
    } else {
      onGameComplete?.(150);
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{instructions}</p>
        </div>

        <span className="font-mono text-xs px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-indigo-400">
          Target: {processName}
        </span>
      </div>

      {/* Reorderable List */}
      <div className="flex flex-col gap-2.5 mb-6">
        {currentOrder.map((item, idx) => {
          const isCorrectPosition = isSubmitted && item.stepNumber === idx + 1;
          const isWrongPosition = isSubmitted && item.stepNumber !== idx + 1;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                isSubmitted
                  ? isCorrectPosition
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
                    : 'border-rose-500 bg-rose-950/40 text-rose-200'
                  : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-slate-300">
                  {idx + 1}
                </span>
                <div>
                  <h5 className="text-sm font-semibold text-white">{item.text}</h5>
                  {item.detail && <p className="text-xs text-slate-400 mt-0.5">{item.detail}</p>}
                </div>
              </div>

              {/* Up / Down Controls */}
              {!isSubmitted ? (
                <div className="flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, 'up')}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={idx === currentOrder.length - 1}
                    onClick={() => moveItem(idx, 'down')}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="shrink-0">
                  {isCorrectPosition ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <span className="text-xs font-mono text-rose-400">Step #{item.stepNumber}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={restartGame}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reshuffle</span>
        </button>

        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition"
          >
            Check Sequence
          </button>
        ) : (
          <button
            onClick={restartGame}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition"
          >
            {isCorrectAll ? 'Mastered! Play Again' : 'Try Again'}
          </button>
        )}
      </div>
    </div>
  );
};
