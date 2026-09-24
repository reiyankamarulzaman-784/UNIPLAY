import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, XCircle, Award, HelpCircle, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { Quiz, QuizQuestion } from '../../types/index.js';

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete?: (score: number, accuracy: number) => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onComplete }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [answersState, setAnswersState] = useState<{ [qId: string]: { selected: number; isCorrect: boolean } }>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const filteredQuestions: QuizQuestion[] =
    selectedDifficulty === 'all'
      ? quiz.questions
      : quiz.questions.filter((q) => q.difficulty === selectedDifficulty);

  const currentQ: QuizQuestion = filteredQuestions[currentIndex] || filteredQuestions[0];

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    const isCorrect = selectedOption === currentQ.correctOptionIndex;
    setIsAnswerSubmitted(true);
    setAnswersState((prev) => ({
      ...prev,
      [currentQ.id]: { selected: selectedOption, isCorrect },
    }));

    if (isCorrect) {
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.8 },
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Finished
      setIsFinished(true);
      const totalCorrect = Object.values(answersState).filter((a) => a.isCorrect).length + (selectedOption === currentQ.correctOptionIndex ? 1 : 0);
      const totalQ = filteredQuestions.length;
      const accuracy = Math.round((totalCorrect / totalQ) * 100);
      const score = totalCorrect * 100;

      if (accuracy >= 80) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }

      onComplete?.(score, accuracy);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setAnswersState({});
    setIsFinished(false);
  };

  if (!filteredQuestions || filteredQuestions.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
        <p className="text-slate-400 mb-4">No questions available for difficulty "{selectedDifficulty}".</p>
        <button
          onClick={() => setSelectedDifficulty('all')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
        >
          View All Questions
        </button>
      </div>
    );
  }

  // Summary / Finished Screen
  if (isFinished) {
    const totalCorrect = Object.values(answersState).filter((a) => a.isCorrect).length;
    const accuracy = Math.round((totalCorrect / filteredQuestions.length) * 100);
    const xpEarned = accuracy === 100 ? 200 : 100;

    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 p-1 mx-auto mb-4">
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
            <Award className="w-10 h-10 text-emerald-400" />
          </div>
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Quiz Complete!</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
          Your mastery evaluation has been recorded and verified against the lecture knowledge base.
        </p>

        {/* Score grid */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Score</div>
            <div className="text-2xl font-bold text-white">{totalCorrect}/{filteredQuestions.length}</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Accuracy</div>
            <div className={`text-2xl font-bold ${accuracy >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {accuracy}%
            </div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">XP Earned</div>
            <div className="text-2xl font-bold text-indigo-400">+{xpEarned}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Quiz Header */}
      <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
            QUESTION {currentIndex + 1} OF {filteredQuestions.length}
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">{quiz.title}</h3>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs">
          {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setSelectedDifficulty(diff);
                setCurrentIndex(0);
                setSelectedOption(null);
                setIsAnswerSubmitted(false);
              }}
              className={`px-2.5 py-1 rounded-md font-medium capitalize transition ${
                selectedDifficulty === diff ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1.5 bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` }}
        />
      </div>

      {/* Main Question Body */}
      <div className="p-6 sm:p-8 flex-1">
        {/* Source citation badge */}
        <div className="flex items-center gap-2 mb-3 text-xs text-slate-400 font-mono">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>Grounded Source: </span>
          <span className="text-slate-300 font-medium">{currentQ.lectureConceptSource}</span>
          <span className="ml-auto px-2 py-0.5 rounded bg-slate-800 border border-slate-700 uppercase text-[10px] font-bold text-indigo-300">
            {currentQ.difficulty}
          </span>
        </div>

        {/* Prompt */}
        <h4 className="text-lg sm:text-xl font-semibold text-white leading-relaxed mb-6">
          {currentQ.prompt}
        </h4>

        {/* Options Grid */}
        <div className="flex flex-col gap-3 mb-6">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctOptionIndex;

            let borderStyle = 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/60';
            if (isSelected && !isAnswerSubmitted) {
              borderStyle = 'border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-500/20';
            } else if (isAnswerSubmitted) {
              if (isCorrect) {
                borderStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200';
              } else if (isSelected && !isCorrect) {
                borderStyle = 'border-rose-500 bg-rose-950/40 text-rose-200';
              } else {
                borderStyle = 'border-slate-800 bg-slate-950/30 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswerSubmitted}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${borderStyle}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-sm sm:text-base font-medium flex-1">{option}</span>
                {isAnswerSubmitted && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
                {isAnswerSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Explanation Alert when submitted */}
        {isAnswerSubmitted && (
          <div
            className={`p-4 rounded-xl border mb-6 text-sm leading-relaxed ${
              selectedOption === currentQ.correctOptionIndex
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
            }`}
          >
            <div className="font-bold mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              {selectedOption === currentQ.correctOptionIndex ? 'Correct! Lecture Grounding:' : 'Incorrect. Lecture Grounding:'}
            </div>
            <p className="text-slate-300">{currentQ.explanation}</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-slate-950/90 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-mono">
          {filteredQuestions.length - currentIndex - 1} questions remaining
        </span>

        {!isAnswerSubmitted ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition active:scale-95"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition active:scale-95"
          >
            <span>{currentIndex < filteredQuestions.length - 1 ? 'Next Question' : 'View Results'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
