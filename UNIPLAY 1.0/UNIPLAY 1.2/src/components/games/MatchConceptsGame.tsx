import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MatchPair } from '../../types/index.js';
import { Trophy, Flame, RotateCcw, CheckCircle2 } from 'lucide-react';

interface MatchConceptsGameProps {
  pairs: MatchPair[];
  title?: string;
  instructions?: string;
  onGameComplete?: (score: number) => void;
}

export const MatchConceptsGame: React.FC<MatchConceptsGameProps> = ({
  pairs,
  title = 'Match the Concepts',
  instructions = 'Pair each academic term with its exact definition.',
  onGameComplete,
}) => {
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [selectedDefId, setSelectedDefId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [shuffledDefs, setShuffledDefs] = useState<{ id: string; definition: string }[]>([]);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [wrongShakeId, setWrongShakeId] = useState<string | null>(null);

  // Initialize and shuffle definitions
  useEffect(() => {
    restartGame();
  }, [pairs]);

  // Timer
  useEffect(() => {
    if (!isGameOver) {
      const interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isGameOver]);

  const restartGame = () => {
    setMatchedIds([]);
    setSelectedTermId(null);
    setSelectedDefId(null);
    setScore(0);
    setStreak(0);
    setTimerSeconds(0);
    setIsGameOver(false);
    setShuffledDefs(
      [...pairs]
        .map((p) => ({ id: p.id, definition: p.definition }))
        .sort(() => Math.random() - 0.5)
    );
  };

  const handleTermClick = (id: string) => {
    if (matchedIds.includes(id)) return;
    setSelectedTermId(id);

    if (selectedDefId) {
      evaluateMatch(id, selectedDefId);
    }
  };

  const handleDefClick = (id: string) => {
    if (matchedIds.includes(id)) return;
    setSelectedDefId(id);

    if (selectedTermId) {
      evaluateMatch(selectedTermId, id);
    }
  };

  const evaluateMatch = (termId: string, defId: string) => {
    if (termId === defId) {
      // Correct Match!
      const newStreak = streak + 1;
      const streakBonus = newStreak * 25;
      const addedPoints = 100 + streakBonus;

      setScore((s) => s + addedPoints);
      setStreak(newStreak);
      const nextMatched = [...matchedIds, termId];
      setMatchedIds(nextMatched);
      setSelectedTermId(null);
      setSelectedDefId(null);

      confetti({ particleCount: 20, spread: 40 });

      if (nextMatched.length === pairs.length) {
        setIsGameOver(true);
        const finalScore = score + addedPoints + Math.max(0, 300 - timerSeconds * 5);
        onGameComplete?.(finalScore);
        confetti({ particleCount: 80, spread: 70 });
      }
    } else {
      // Wrong Match
      setWrongShakeId(termId);
      setTimeout(() => setWrongShakeId(null), 600);
      setStreak(0);
      setSelectedTermId(null);
      setSelectedDefId(null);
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{instructions}</p>
        </div>

        {/* Live HUD Stats */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Score:</span>
            <strong className="text-white text-sm">{score}</strong>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="text-slate-400">Streak:</span>
            <strong className="text-orange-400 text-sm">{streak}x</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            {Math.floor(timerSeconds / 60)}:{('0' + (timerSeconds % 60)).slice(-2)}
          </div>
        </div>
      </div>

      {isGameOver ? (
        <div className="py-8 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h4 className="text-2xl font-bold text-white mb-2">All Concepts Matched!</h4>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            You completed the challenge in {timerSeconds} seconds with a high score of{' '}
            <strong className="text-emerald-400">{score}</strong>!
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
        /* Matching Columns */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Terms Column */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider mb-1">
              Academic Terms
            </span>
            {pairs.map((p) => {
              const isMatched = matchedIds.includes(p.id);
              const isSelected = selectedTermId === p.id;
              const isShake = wrongShakeId === p.id;

              return (
                <button
                  key={p.id}
                  disabled={isMatched}
                  onClick={() => handleTermClick(p.id)}
                  className={`p-4 rounded-xl text-left border text-sm font-semibold transition-all ${
                    isMatched
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400 opacity-60 line-through'
                      : isSelected
                      ? 'border-indigo-500 bg-indigo-950/50 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]'
                      : isShake
                      ? 'border-rose-500 bg-rose-950/40 text-rose-300 animate-bounce'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{p.term}</span>
                    {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Definitions Column */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-1">
              Lecture Definitions
            </span>
            {shuffledDefs.map((def) => {
              const isMatched = matchedIds.includes(def.id);
              const isSelected = selectedDefId === def.id;

              return (
                <button
                  key={def.id}
                  disabled={isMatched}
                  onClick={() => handleDefClick(def.id)}
                  className={`p-4 rounded-xl text-left border text-xs sm:text-sm font-medium transition-all ${
                    isMatched
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400 opacity-60'
                      : isSelected
                      ? 'border-purple-500 bg-purple-950/50 text-white shadow-lg shadow-purple-500/20 scale-[1.02]'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="leading-relaxed">{def.definition}</span>
                    {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
