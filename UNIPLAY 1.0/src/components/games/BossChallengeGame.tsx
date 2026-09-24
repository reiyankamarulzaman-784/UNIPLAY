import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { BossChallengeData, BossPhase } from '../../types/index.js';
import { ShieldAlert, Sword, Trophy, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

interface BossChallengeGameProps {
  bossData: BossChallengeData;
  lectureTitle?: string;
  onDefeatBoss?: (xpEarned: number) => void;
}

export const BossChallengeGame: React.FC<BossChallengeGameProps> = ({
  bossData,
  lectureTitle = 'University Lecture',
  onDefeatBoss,
}) => {
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState<number>(0);
  const [bossHp, setBossHp] = useState<number>(bossData.totalHp);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isDefeated, setIsDefeated] = useState<boolean>(false);

  const phase: BossPhase = bossData.phases[currentPhaseIdx] || bossData.phases[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleAttack = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === phase.question.correctOptionIndex;
    if (isCorrect) {
      // Deal damage to boss
      const newBossHp = Math.max(0, bossHp - phase.damageToBoss);
      setBossHp(newBossHp);
      confetti({ particleCount: 40, spread: 50 });

      if (newBossHp === 0 || currentPhaseIdx === bossData.phases.length - 1) {
        setIsVictory(true);
        confetti({ particleCount: 120, spread: 90 });
        onDefeatBoss?.(bossData.masteryRewardXp);
      }
    } else {
      // Player takes damage
      const newPlayerHp = Math.max(0, playerHp - 40);
      setPlayerHp(newPlayerHp);
      if (newPlayerHp === 0) {
        setIsDefeated(true);
      }
    }
  };

  const handleNextPhase = () => {
    if (currentPhaseIdx < bossData.phases.length - 1) {
      setCurrentPhaseIdx((idx) => idx + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    }
  };

  const restartBoss = () => {
    setCurrentPhaseIdx(0);
    setBossHp(bossData.totalHp);
    setPlayerHp(100);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsVictory(false);
    setIsDefeated(false);
  };

  const bossHpPercent = Math.max(0, Math.round((bossHp / bossData.totalHp) * 100));

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col">
      {/* Top Boss HUD */}
      <div className="flex flex-col gap-4 pb-6 mb-6 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-600/30">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-[10px] font-mono font-bold text-rose-300 uppercase">
                  BOSS EXAM
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  PHASE {currentPhaseIdx + 1} OF {bossData.phases.length}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">{bossData.bossName}</h3>
              <p className="text-xs text-rose-400/90 font-medium">{bossData.bossTitle}</p>
            </div>
          </div>

          {/* Player HP */}
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 font-mono text-xs">
            <span className="text-slate-400">Student Vitality:</span>
            <div className="w-24 h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${playerHp}%` }}
              />
            </div>
            <strong className="text-white">{playerHp}%</strong>
          </div>
        </div>

        {/* Boss HP Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span className="text-rose-400 font-bold">Boss Health Pool</span>
            <span>{bossHp} / {bossData.totalHp} HP ({bossHpPercent}%)</span>
          </div>
          <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 rounded-full transition-all duration-500"
              style={{ width: `${bossHpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {isVictory ? (
        <div className="py-10 text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-amber-400" />
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/80 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider inline-block mb-2">
            LECTURE MASTERED
          </span>
          <h4 className="text-3xl font-extrabold text-white mb-2">Boss Overcome!</h4>
          <p className="text-slate-300 text-sm max-w-md mx-auto mb-6">
            You successfully conquered {bossData.bossName} and demonstrated total conceptual mastery over "{lectureTitle}".
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Mastery Reward: +{bossData.masteryRewardXp} XP</span>
          </div>
          <div>
            <button
              onClick={restartBoss}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition"
            >
              <RotateCcw className="w-4 h-4" />
              Challenge Again
            </button>
          </div>
        </div>
      ) : isDefeated ? (
        <div className="py-10 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          </div>
          <h4 className="text-2xl font-bold text-white mb-2">Challenge Failed</h4>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            Vitality dropped to zero. Review the lecture notes and challenge the professor again!
          </p>
          <button
            onClick={restartBoss}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Challenge
          </button>
        </div>
      ) : (
        /* Active Phase Battle */
        <div>
          {/* Boss Dialog Bubble */}
          <div className="bg-slate-950 p-4 rounded-xl border border-rose-950 mb-6 relative">
            <div className="text-xs font-mono font-bold text-rose-400 mb-1">{bossData.bossName} says:</div>
            <p className="text-sm text-slate-200 italic font-serif">"{phase.bossDialog}"</p>
          </div>

          {/* Question Prompt */}
          <h4 className="text-lg font-bold text-white leading-relaxed mb-5">
            {phase.question.prompt}
          </h4>

          {/* Options */}
          <div className="flex flex-col gap-3 mb-6">
            {phase.question.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === phase.question.correctOptionIndex;

              let style = 'border-slate-800 bg-slate-950/80 hover:border-slate-700 text-slate-200';
              if (isSelected && !isAnswerSubmitted) {
                style = 'border-rose-500 bg-rose-950/40 text-white shadow-lg shadow-rose-500/20';
              } else if (isAnswerSubmitted) {
                if (isCorrect) {
                  style = 'border-emerald-500 bg-emerald-950/50 text-emerald-200';
                } else if (isSelected && !isCorrect) {
                  style = 'border-rose-500 bg-rose-950/50 text-rose-200';
                } else {
                  style = 'border-slate-800 bg-slate-950/30 opacity-40';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswerSubmitted}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-xl border text-left font-medium text-sm transition-all flex items-start gap-3 ${style}`}
                >
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-slate-400 shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {isAnswerSubmitted && (
            <div
              className={`p-4 rounded-xl border mb-6 text-sm ${
                selectedOption === phase.question.correctOptionIndex
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-800 text-rose-200'
              }`}
            >
              <div className="font-bold mb-1">
                {selectedOption === phase.question.correctOptionIndex
                  ? `⚔️ Direct Hit! Dealt -${phase.damageToBoss} HP to Boss!`
                  : `💥 Attack Missed! Student took -40 Vitality damage!`}
              </div>
              <p className="text-slate-300 text-xs">{phase.question.explanation}</p>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end pt-2">
            {!isAnswerSubmitted ? (
              <button
                onClick={handleAttack}
                disabled={selectedOption === null}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-40 text-white text-sm font-semibold shadow-lg shadow-rose-600/30 transition active:scale-95"
              >
                <Sword className="w-4 h-4" />
                <span>Execute Counter-Attack</span>
              </button>
            ) : (
              <button
                onClick={handleNextPhase}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition active:scale-95"
              >
                Advance to Next Phase ➔
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
