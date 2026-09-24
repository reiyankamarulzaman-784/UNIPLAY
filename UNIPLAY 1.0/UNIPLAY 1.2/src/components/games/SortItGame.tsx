import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SortCategory, SortItem } from '../../types/index.js';
import { ArrowLeftRight, CheckCircle2, RotateCcw } from 'lucide-react';

interface SortItGameProps {
  categories: SortCategory[];
  items: SortItem[];
  title?: string;
  instructions?: string;
  onGameComplete?: (score: number) => void;
}

export const SortItGame: React.FC<SortItGameProps> = ({
  categories,
  items,
  title = 'Sort It: Academic Classification',
  instructions = 'Assign each term into its accurate lecture category.',
  onGameComplete,
}) => {
  const [sortedAssignments, setSortedAssignments] = useState<{ [itemId: string]: string }>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    restartGame();
  }, [items, categories]);

  const restartGame = () => {
    setSortedAssignments({});
    setSelectedItemId(null);
    setIsSubmitted(false);
    setScore(0);
  };

  const handleItemClick = (id: string) => {
    if (isSubmitted) return;
    setSelectedItemId(id === selectedItemId ? null : id);
  };

  const handleCategoryBucketClick = (catId: string) => {
    if (!selectedItemId || isSubmitted) return;
    setSortedAssignments((prev) => ({
      ...prev,
      [selectedItemId]: catId,
    }));
    setSelectedItemId(null);
  };

  const handleSubmit = () => {
    let correctCount = 0;
    items.forEach((item) => {
      if (sortedAssignments[item.id] === item.categoryId) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / items.length) * 500);
    setScore(calculatedScore);
    setIsSubmitted(true);

    if (correctCount === items.length) {
      confetti({ particleCount: 70, spread: 60 });
    }
    onGameComplete?.(calculatedScore);
  };

  const unassignedItems = items.filter((it) => !sortedAssignments[it.id]);
  const allAssigned = Object.keys(sortedAssignments).length === items.length;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{instructions}</p>
        </div>

        {isSubmitted && (
          <div className="flex items-center gap-2 font-mono text-sm px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400">
            <span>Score:</span>
            <strong>{score} / 500</strong>
          </div>
        )}
      </div>

      {/* Unassigned Items Pool */}
      {!isSubmitted && (
        <div className="mb-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-3">
            Tap an item below, then tap a category to assign:
          </span>
          {unassignedItems.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {unassignedItems.map((item) => {
                const isSelected = selectedItemId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                        : 'border-slate-700 bg-slate-900 hover:border-slate-600 text-slate-200'
                    }`}
                  >
                    {item.text}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-emerald-400 font-mono">
              ✓ All items assigned! Click "Validate Sorting" below.
            </p>
          )}
        </div>
      )}

      {/* Category Buckets Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {categories.map((cat, idx) => {
          const assignedToThisCat = items.filter((it) => sortedAssignments[it.id] === cat.id);
          const isTargeted = selectedItemId !== null;

          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryBucketClick(cat.id)}
              className={`p-5 rounded-2xl border transition-all flex flex-col min-h-[220px] ${
                isTargeted && !isSubmitted
                  ? 'border-indigo-500/80 bg-indigo-950/20 cursor-pointer hover:bg-indigo-950/40'
                  : 'border-slate-800 bg-slate-950/50'
              }`}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                <div>
                  <h4 className="font-bold text-white text-base">{cat.name}</h4>
                  {cat.description && <p className="text-xs text-slate-400">{cat.description}</p>}
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {assignedToThisCat.length}
                </span>
              </div>

              {/* Items in this bucket */}
              <div className="flex-1 flex flex-wrap gap-2 content-start">
                {assignedToThisCat.map((it) => {
                  const isCorrect = it.categoryId === cat.id;

                  return (
                    <div
                      key={it.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                        isSubmitted
                          ? isCorrect
                            ? 'border-emerald-500 bg-emerald-950/50 text-emerald-200'
                            : 'border-rose-500 bg-rose-950/50 text-rose-200'
                          : 'border-slate-700 bg-slate-800 text-slate-200'
                      }`}
                    >
                      <span>{it.text}</span>
                      {!isSubmitted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSortedAssignments((prev) => {
                              const copy = { ...prev };
                              delete copy[it.id];
                              return copy;
                            });
                          }}
                          className="text-slate-400 hover:text-rose-400 ml-1 font-bold"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer action */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={restartGame}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sorting</span>
        </button>

        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!allAssigned}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition"
          >
            Validate Sorting
          </button>
        ) : (
          <button
            onClick={restartGame}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition"
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
};
