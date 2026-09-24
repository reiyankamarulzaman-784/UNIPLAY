import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RapidQuestion } from '../../types/index.js';
import { Flame, Timer, Zap, CheckCircle2, RotateCcw } from 'lucide-react';

interface RapidFireGameProps {
  questions: RapidQuestion[];
  timePerQuestion?: number;
  title?: string;
  instructions?: string;
  onGameComplete?: (score: number) => void;
}

export const RapidFireGame: React.FC<RapidFireGameProps> = ({
  questions,
  timePerQuestion = 10,
  title = 'Rapid Fire Sprint',
  instructions = 'Answer quickly before time expires! Keep your streak alive for multipliers.',
  onGameComplete,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(timePerQuestion);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const currentQ: RapidQuestion = questions[currentIdx] || questions[0];

  useEffect(() => {
    if (isGameOver || isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Time expired for this question
          handleAnswer(-1); // wrong
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIdx, isGameOver, isAnswered]);

  const handleAnswer = (optionIdx: number) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOpt(optionIdx);

    const isCorrect = optionIdx === currentQ.correctIndex;
    if (isCorrect) {
      const added = 100 + streak * 30 + timeLeft * 10;
      setScore((s) => s + added);
      setStreak((st) => st + 1);
      confetti({ particleCount: 15, spread: 35 });
    } else {
      setStreak(0);
    }

    // Auto advance after brief delay
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx((idx) => idx + 1);
        setSelectedOpt(null);
        setIsAnswered(false);
        setTimeLeft(timePerQuestion);
      } else {
        setIsGameOver(true);
        const finalScore = score + (isCorrect ? 100 + streak * 30 : 0);
        onGameComplete?.(finalScore);
        confetti({ particleCount: 60, spread: 60 });
      }
    }, 850);
  };

  const restartGame = () => {
    setCurrentIdx(0);
    setTimeLeft(timePerQuestion);
    setScore(0);
    setStreak(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setIsGameOver(false);
  };

  const timerPercent = (timeLeft / timePerQuestion) * 100;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{instructions}</p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Score:</span>
            <strong className="text-amber-400 text-sm">{score}</strong>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
            <strong className="text-orange-400 text-sm">{streak}x Streak</strong>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <Timer className="w-4 h-4 text-rose-400" />
            <strong className={`text-sm ${timeLeft <= 3 ? 'text-rose-400 animate-ping' : 'text-slate-200'}`}>
              {timeLeft}s
            </strong>
          </div>
        </div>
      </div>

      {isGameOver ? (
        <div className="py-8 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-amber-400" />
          </div>
          <h4 className="text-2xl font-bold text-white mb-2">Rapid Sprint Finished!</h4>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            Blazing speed! You concluded with a final score of <strong className="text-amber-400">{score}</strong>.
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
        <div>
          {/* Question Counter & Timer Bar */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>
              QUESTION {currentIdx + 1} OF {questions.length}
            </span>
            <span className="text-indigo-400 font-medium">Concept: {currentQ.concept}</span>
          </div>

          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mb-6">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 3 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-400 to-rose-500'
              }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>

          {/* Prompt */}
          <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 mb-6">
            <h4 className="text-lg font-bold text-white leading-relaxed">{currentQ.prompt}</h4>
          </div>

          {/* Rapid Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedOpt === i;
              const isCorrect = i === currentQ.correctIndex;

              let style = 'border-slate-800 bg-slate-950/80 hover:border-slate-700 hover:bg-slate-800/60 text-slate-200';
              if (isAnswered) {
                if (isCorrect) {
                  style = 'border-emerald-500 bg-emerald-950/50 text-emerald-200 shadow-md shadow-emerald-500/20';
                } else if (isSelected && !isCorrect) {
                  style = 'border-rose-500 bg-rose-950/50 text-rose-200';
                } else {
                  style = 'border-slate-800 bg-slate-950/30 opacity-40';
                }
              }

              return (
                <button
                  key={i}
                  disabled={isAnswered}
                  onClick={() => handleAnswer(i)}
                  className={`p-4 rounded-xl border text-left font-medium text-sm transition-all flex items-center justify-between gap-3 ${style}`}
                >
                  <span>{opt}</span>
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center text-xs font-mono shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
