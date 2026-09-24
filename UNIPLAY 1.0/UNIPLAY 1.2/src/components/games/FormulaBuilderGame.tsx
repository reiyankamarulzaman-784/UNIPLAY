import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { FormulaChallenge, FormulaToken } from '../../types/index.js';
import { Calculator, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

interface FormulaBuilderGameProps {
  challenges: FormulaChallenge[];
  title?: string;
  instructions?: string;
  onGameComplete?: (score: number) => void;
}

export const FormulaBuilderGame: React.FC<FormulaBuilderGameProps> = ({
  challenges,
  title = 'Formula Builder & Computation Lab',
  instructions = 'Assemble the formula tokens in the correct order, then test with real numerical variables.',
  onGameComplete,
}) => {
  const [activeChallengeIdx, setActiveChallengeIdx] = useState<number>(0);
  const challenge = challenges[activeChallengeIdx] || challenges[0];

  const [assembledTokens, setAssembledTokens] = useState<FormulaToken[]>([]);
  const [availableTokens, setAvailableTokens] = useState<FormulaToken[]>(
    challenge ? [...challenge.scrambledTokens] : []
  );
  const [isFormulaVerified, setIsFormulaVerified] = useState<boolean>(false);
  const [isFormulaCorrect, setIsFormulaCorrect] = useState<boolean>(false);
  const [userCalculationInput, setUserCalculationInput] = useState<string>('');
  const [isCalcVerified, setIsCalcVerified] = useState<boolean>(false);
  const [isCalcCorrect, setIsCalcCorrect] = useState<boolean>(false);

  const handleSelectToken = (token: FormulaToken) => {
    if (isFormulaVerified) return;
    setAssembledTokens([...assembledTokens, token]);
    setAvailableTokens(availableTokens.filter((t) => t.id !== token.id));
  };

  const handleRemoveToken = (index: number) => {
    if (isFormulaVerified) return;
    const removed = assembledTokens[index];
    setAssembledTokens(assembledTokens.filter((_, i) => i !== index));
    setAvailableTokens([...availableTokens, removed]);
  };

  const verifyFormula = () => {
    const currentSequence = assembledTokens.map((t) => t.token);
    const target = challenge.targetSequence;
    const correct =
      currentSequence.length === target.length &&
      currentSequence.every((val, idx) => val === target[idx]);

    setIsFormulaVerified(true);
    setIsFormulaCorrect(correct);

    if (correct) {
      confetti({ particleCount: 30, spread: 45 });
      if (!challenge.followUpProblem) {
        onGameComplete?.(300);
      }
    }
  };

  const verifyCalculation = () => {
    if (!challenge.followUpProblem) return;
    const userVal = parseFloat(userCalculationInput.trim());
    const expected = challenge.followUpProblem.answer;
    const correct = Math.abs(userVal - expected) < 0.1;

    setIsCalcVerified(true);
    setIsCalcCorrect(correct);

    if (correct) {
      confetti({ particleCount: 60, spread: 60 });
      onGameComplete?.(450);
    }
  };

  const resetChallenge = () => {
    setAssembledTokens([]);
    setAvailableTokens([...challenge.scrambledTokens]);
    setIsFormulaVerified(false);
    setIsFormulaCorrect(false);
    setUserCalculationInput('');
    setIsCalcVerified(false);
    setIsCalcCorrect(false);
  };

  if (!challenge) {
    return <div className="p-6 text-slate-400">No formula challenges found for this lecture.</div>;
  }

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{instructions}</p>
        </div>

        <span className="font-mono text-xs px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 font-bold">
          {challenge.name}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-200 mb-2">{challenge.prompt}</p>
      </div>

      {/* Assembly Dropzone Canvas */}
      <div className="min-h-[75px] p-4 rounded-xl bg-slate-950 border-2 border-dashed border-slate-800 flex flex-wrap items-center gap-2 mb-6">
        {assembledTokens.length === 0 ? (
          <span className="text-xs text-slate-500 font-mono italic">
            Click formula tokens below to construct equation here...
          </span>
        ) : (
          assembledTokens.map((t, idx) => (
            <button
              key={t.id || idx}
              onClick={() => handleRemoveToken(idx)}
              className="px-4 py-2 rounded-lg bg-indigo-600/90 text-white font-mono font-bold text-base hover:bg-rose-600/80 transition"
              title="Click to remove"
            >
              {t.token}
            </button>
          ))
        )}
      </div>

      {/* Scrambled Tokens Pool */}
      {!isFormulaVerified && (
        <div className="mb-6">
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-2">
            Available Equation Tokens:
          </span>
          <div className="flex flex-wrap gap-2.5">
            {availableTokens.map((token) => (
              <button
                key={token.id}
                onClick={() => handleSelectToken(token)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-base border border-slate-700 hover:border-indigo-500 transition shadow-sm"
              >
                {token.token}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formula Feedback */}
      {isFormulaVerified && (
        <div
          className={`p-4 rounded-xl border mb-6 text-sm flex items-center justify-between ${
            isFormulaCorrect
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
              : 'bg-rose-950/40 border-rose-800 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {isFormulaCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <RotateCcw className="w-5 h-5" />}
            <span className="font-semibold">
              {isFormulaCorrect ? 'Formula correctly assembled!' : 'Formula sequence incorrect.'}
            </span>
          </div>
          {!isFormulaCorrect && (
            <button onClick={resetChallenge} className="text-xs underline text-rose-300">
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Follow-up Calculation Problem */}
      {isFormulaCorrect && challenge.followUpProblem && (
        <div className="mt-2 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6">
          <div className="flex items-center gap-2 mb-2 text-indigo-400 font-mono text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>PART 2: NUMERICAL APPLICATION</span>
          </div>
          <p className="text-sm font-semibold text-slate-100 mb-4">{challenge.followUpProblem.question}</p>

          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.1"
              value={userCalculationInput}
              onChange={(e) => setUserCalculationInput(e.target.value)}
              placeholder="Enter numerical answer"
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 w-48"
            />
            <span className="text-slate-400 font-mono text-xs">{challenge.followUpProblem.unit}</span>
            <button
              onClick={verifyCalculation}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition"
            >
              Verify Computation
            </button>
          </div>

          {isCalcVerified && (
            <div
              className={`mt-3 text-xs font-semibold ${
                isCalcCorrect ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isCalcCorrect
                ? `✓ Correct! ${challenge.followUpProblem.answer} ${challenge.followUpProblem.unit}`
                : `Incorrect. Expected answer is approximately ${challenge.followUpProblem.answer} ${challenge.followUpProblem.unit}`}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={resetChallenge}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Challenge</span>
        </button>

        {!isFormulaVerified && (
          <button
            onClick={verifyFormula}
            disabled={assembledTokens.length === 0}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition"
          >
            Check Formula
          </button>
        )}
      </div>
    </div>
  );
};
