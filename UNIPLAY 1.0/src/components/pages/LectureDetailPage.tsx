import React, { useState } from 'react';
import { FullLectureData, UserStats } from '../../types/index.js';
import { EducationalVideoPlayer } from '../video/EducationalVideoPlayer.js';
import { QuizPlayer } from '../quiz/QuizPlayer.js';
import { MatchConceptsGame } from '../games/MatchConceptsGame.js';
import { MemoryMatchGame } from '../games/MemoryMatchGame.js';
import { RapidFireGame } from '../games/RapidFireGame.js';
import { SortItGame } from '../games/SortItGame.js';
import { PutItInOrderGame } from '../games/PutItInOrderGame.js';
import { FormulaBuilderGame } from '../games/FormulaBuilderGame.js';
import { DiagramLabelerGame } from '../games/DiagramLabelerGame.js';
import { BossChallengeGame } from '../games/BossChallengeGame.js';
import { Play, Brain, Gamepad2, BookOpen, Award, CheckCircle2, ArrowLeft, Clock, FileText, Sparkles } from 'lucide-react';

interface LectureDetailPageProps {
  lectureData: FullLectureData;
  initialTab?: string;
  onBack: () => void;
  onRecordProgress: (type: string, score?: number, accuracy?: number, details?: any) => void;
}

export const LectureDetailPage: React.FC<LectureDetailPageProps> = ({
  lectureData,
  initialTab = 'video',
  onBack,
  onRecordProgress,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [activeGameKey, setActiveGameKey] = useState<string>('match');

  const { lecture, lesson, quiz, games } = lectureData;

  const tabs = [
    { id: 'video', label: '🎬 Watch Lesson', count: `${lesson.scenes.length} Scenes` },
    { id: 'quiz', label: '🧠 Take Quiz', count: `${quiz.questions.length} Questions` },
    { id: 'games', label: '🎮 Play Games', count: '8 Games' },
    { id: 'concepts', label: '📚 Review Concepts', count: `${lecture.keyTerms.length} Terms` },
    { id: 'progress', label: '🏆 Mastery & Progress', count: 'Track' },
  ];

  const gameButtons = [
    { key: 'match', name: '🎯 Match Concepts' },
    { key: 'memory', name: '🧩 Memory Match' },
    { key: 'rapid', name: '⚡ Rapid Fire' },
    { key: 'sort', name: '⚖️ Sort It' },
    { key: 'order', name: '🔢 Put It In Order' },
    ...(games.formulaBuilder ? [{ key: 'formula', name: '📐 Formula Builder' }] : []),
    ...(games.diagramLabeler ? [{ key: 'diagram', name: '🎯 Diagram Labeler' }] : []),
    { key: 'boss', name: '🏆 Boss Challenge' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      {/* Top Breadcrumb & Title */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-bold uppercase">
                {lecture.subject}
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {lecture.estimatedDuration}
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {lecture.pageCount || 20} pages
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {lecture.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Video Lesson Player */}
      {activeTab === 'video' && (
        <div className="flex flex-col gap-6">
          <EducationalVideoPlayer
            lesson={lesson}
            onComplete={() => {
              onRecordProgress('video_complete', 100, 100, {
                title: `Watched: ${lecture.title}`,
                lectureTitle: lecture.title,
              });
            }}
          />

          {/* Lesson Overview & Learning Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-mono font-bold text-indigo-400 uppercase tracking-wider mb-2">
                Lecture Synopsis
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">{lecture.summary}</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-mono font-bold text-emerald-400 uppercase tracking-wider mb-3">
                Learning Objectives
              </h3>
              <ul className="flex flex-col gap-2">
                {lecture.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Take Quiz */}
      {activeTab === 'quiz' && (
        <div className="flex flex-col gap-6">
          <QuizPlayer
            quiz={quiz}
            onComplete={(score, accuracy) => {
              onRecordProgress('quiz_complete', score, accuracy, {
                title: `Quiz: ${lecture.title}`,
                lectureTitle: lecture.title,
              });
            }}
          />
        </div>
      )}

      {/* Tab 3: Play Games */}
      {activeTab === 'games' && (
        <div className="flex flex-col gap-6">
          {/* Game Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {gameButtons.map((g) => (
              <button
                key={g.key}
                onClick={() => setActiveGameKey(g.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  activeGameKey === g.key
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>

          {/* Active Game Viewport */}
          {activeGameKey === 'match' && (
            <MatchConceptsGame
              pairs={games.matchConcepts.pairs}
              title={games.matchConcepts.title}
              instructions={games.matchConcepts.instructions}
              onGameComplete={(score) =>
                onRecordProgress('game_complete', score, 100, {
                  title: `Match Concepts: ${lecture.title}`,
                  lectureTitle: lecture.title,
                })
              }
            />
          )}

          {activeGameKey === 'memory' && (
            <MemoryMatchGame
              pairs={games.memoryMatch.pairs}
              title={games.memoryMatch.title}
              instructions={games.memoryMatch.instructions}
              onGameComplete={(score) =>
                onRecordProgress('game_complete', score, 100, {
                  title: `Memory Match: ${lecture.title}`,
                  lectureTitle: lecture.title,
                })
              }
            />
          )}

          {activeGameKey === 'rapid' && (
            <RapidFireGame
              questions={games.rapidFire.questions}
              timePerQuestion={games.rapidFire.timePerQuestion}
              title={games.rapidFire.title}
              instructions={games.rapidFire.instructions}
              onGameComplete={(score) =>
                onRecordProgress('game_complete', score, 100, {
                  title: `Rapid Fire: ${lecture.title}`,
                  lectureTitle: lecture.title,
                })
              }
            />
          )}

          {activeGameKey === 'sort' && (
            <SortItGame
              categories={games.sortIt.categories}
              items={games.sortIt.items}
              title={games.sortIt.title}
              instructions={games.sortIt.instructions}
              onGameComplete={(score) =>
                onRecordProgress('game_complete', score, 100, {
                  title: `Sort It: ${lecture.title}`,
                  lectureTitle: lecture.title,
                })
              }
            />
          )}

          {activeGameKey === 'order' && (
            <PutItInOrderGame
              items={games.putItInOrder.items}
              processName={games.putItInOrder.processName}
              title={games.putItInOrder.title}
              instructions={games.putItInOrder.instructions}
              onGameComplete={(score) =>
                onRecordProgress('game_complete', score, 100, {
                  title: `Put It In Order: ${lecture.title}`,
                  lectureTitle: lecture.title,
                })
              }
            />
          )}

          {activeGameKey === 'formula' && games.formulaBuilder && (
            <FormulaBuilderGame
              challenges={games.formulaBuilder.challenges}
              title={games.formulaBuilder.title}
              instructions={games.formulaBuilder.instructions}
              onGameComplete={(score) =>
                onRecordProgress('game_complete', score, 100, {
                  title: `Formula Builder: ${lecture.title}`,
                  lectureTitle: lecture.title,
                })
              }
            />
          )}

          {activeGameKey === 'diagram' && games.diagramLabeler && (
            <DiagramLabelerGame
              data={games.diagramLabeler}
              onGameComplete={(score) =>
                onRecordProgress('game_complete', score, 100, {
                  title: `Diagram Labeler: ${lecture.title}`,
                  lectureTitle: lecture.title,
                })
              }
            />
          )}

          {activeGameKey === 'boss' && (
            <BossChallengeGame
              bossData={games.bossChallenge}
              lectureTitle={lecture.title}
              onDefeatBoss={(xp) =>
                onRecordProgress('boss_defeat', xp, 100, {
                  title: `Boss Defeat: ${games.bossChallenge.bossName}`,
                  lectureTitle: lecture.title,
                })
              }
            />
          )}
        </div>
      )}

      {/* Tab 4: Review Concepts & Knowledge Base */}
      {activeTab === 'concepts' && (
        <div className="flex flex-col gap-6">
          {/* Key Terms Grid */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Grounded Key Terms & Definitions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lecture.keyTerms.map((term, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <h4 className="font-bold text-indigo-400 text-sm mb-1">{term.term}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{term.definition}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Formulas if present */}
          {lecture.formulas.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Formulas & Quantitative Laws</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lecture.formulas.map((form, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-xs font-mono font-bold text-slate-400 block mb-1">
                      {form.name}
                    </span>
                    <div className="font-mono text-base font-bold text-amber-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 mb-2">
                      {form.formula}
                    </div>
                    <p className="text-xs text-slate-300 mb-3">{form.explanation}</p>
                    <div className="flex flex-wrap gap-2">
                      {form.variables.map((v, vi) => (
                        <span key={vi} className="text-[11px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                          <strong>{v.symbol}:</strong> {v.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Lecture Progress */}
      {activeTab === 'progress' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Lecture Mastery Checklist</h3>
              <p className="text-xs text-slate-400">Track your completion and milestone XP for this course module.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h5 className="text-sm font-bold text-white">Animated Visual Lesson</h5>
                <p className="text-xs text-slate-400">+100 XP awarded</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h5 className="text-sm font-bold text-white">Grounded Quiz Completed</h5>
                <p className="text-xs text-slate-400">+100 XP awarded</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h5 className="text-sm font-bold text-white">Educational Games Played</h5>
                <p className="text-xs text-slate-400">+75 XP per session</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
