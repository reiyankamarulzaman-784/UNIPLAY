import React, { useState } from 'react';
import { FullLectureData } from '../../types/index.js';
import { MatchConceptsGame } from '../games/MatchConceptsGame.js';
import { MemoryMatchGame } from '../games/MemoryMatchGame.js';
import { RapidFireGame } from '../games/RapidFireGame.js';
import { SortItGame } from '../games/SortItGame.js';
import { PutItInOrderGame } from '../games/PutItInOrderGame.js';
import { FormulaBuilderGame } from '../games/FormulaBuilderGame.js';
import { DiagramLabelerGame } from '../games/DiagramLabelerGame.js';
import { BossChallengeGame } from '../games/BossChallengeGame.js';
import { Gamepad2, ArrowLeft, Trophy, Sparkles } from 'lucide-react';

interface GamesHubPageProps {
  lectures: FullLectureData[];
  initialGameKey?: string;
  onRecordProgress: (type: string, score?: number, accuracy?: number, details?: any) => void;
}

export const GamesHubPage: React.FC<GamesHubPageProps> = ({
  lectures,
  initialGameKey,
  onRecordProgress,
}) => {
  const [selectedLectureId, setSelectedLectureId] = useState<string>(
    lectures[0]?.lecture.id || 'anatomy-circulatory-system'
  );
  const [activePlayingGame, setActivePlayingGame] = useState<string | null>(initialGameKey || null);

  const currentLecture =
    lectures.find((l) => l.lecture.id === selectedLectureId) || lectures[0];

  const gameCatalog = [
    {
      key: 'match',
      icon: '🎯',
      name: 'Match the Concepts',
      subject: currentLecture?.lecture.subject || 'Medicine',
      bestScore: 820,
      description: 'Pair lecture terms with definitions under timed pressure and combo multipliers.',
      badge: 'High Replayability',
    },
    {
      key: 'rapid',
      icon: '⚡',
      name: 'Rapid Fire',
      subject: currentLecture?.lecture.subject || 'Medicine',
      bestScore: 1240,
      description: 'Ten-second sprint rounds to test reflex recall and accuracy.',
      badge: 'Speed Demon',
    },
    {
      key: 'memory',
      icon: '🧩',
      name: 'Memory Match',
      subject: currentLecture?.lecture.subject || 'Medicine',
      bestScore: 940,
      description: 'Face-down grid of concept cards to train visual and structural recall.',
      badge: 'Memory Booster',
    },
    {
      key: 'sort',
      icon: '⚖️',
      name: 'Sort It',
      subject: currentLecture?.lecture.subject || 'Medicine',
      bestScore: 500,
      description: 'Drag and categorize concepts into proper lecture frameworks.',
      badge: 'Classification',
    },
    {
      key: 'order',
      icon: '🔢',
      name: 'Put It In Order',
      subject: currentLecture?.lecture.subject || 'Medicine',
      bestScore: 400,
      description: 'Arrange biological mechanisms, market shocks, or physics protocols in sequence.',
      badge: 'Sequencing',
    },
    ...(currentLecture?.games.formulaBuilder
      ? [
          {
            key: 'formula',
            icon: '📐',
            name: 'Formula Builder',
            subject: currentLecture?.lecture.subject || 'Medicine',
            bestScore: 450,
            description: 'Assemble algebraic & scientific equations and calculate live variables.',
            badge: 'Quantitative Lab',
          },
        ]
      : []),
    ...(currentLecture?.games.diagramLabeler
      ? [
          {
            key: 'diagram',
            icon: '🎯',
            name: 'Diagram Labeler',
            subject: currentLecture?.lecture.subject || 'Medicine',
            bestScore: 500,
            description: 'Pin academic labels onto high-definition diagrams and coordinate planes.',
            badge: 'Visual Anatomy',
          },
        ]
      : []),
    {
      key: 'boss',
      icon: '🏆',
      name: 'Boss Challenge',
      subject: currentLecture?.lecture.subject || 'Medicine',
      bestScore: 350,
      description: 'Multi-phase battle against the university professor to earn the Mastery Badge.',
      badge: 'Ultimate Exam',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gamepad2 className="w-6 h-6 text-indigo-400" />
            <h2 className="text-3xl font-extrabold text-white tracking-tight">University Game Hub</h2>
          </div>
          <p className="text-sm text-slate-400">
            Real educational games populated dynamically from your uploaded university lectures.
          </p>
        </div>

        {/* Lecture Switcher Dropdown */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          <span className="text-xs font-mono text-slate-400 pl-2">Lecture:</span>
          <select
            value={selectedLectureId}
            onChange={(e) => {
              setSelectedLectureId(e.target.value);
              setActivePlayingGame(null);
            }}
            className="bg-slate-950 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-indigo-500"
          >
            {lectures.map((lec) => (
              <option key={lec.lecture.id} value={lec.lecture.id}>
                {lec.lecture.title} ({lec.lecture.subject})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ACTIVE GAME VIEWPORT */}
      {activePlayingGame && currentLecture ? (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <button
            onClick={() => setActivePlayingGame(null)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Game Catalog</span>
          </button>

          {activePlayingGame === 'match' && (
            <MatchConceptsGame
              pairs={currentLecture.games.matchConcepts.pairs}
              title={currentLecture.games.matchConcepts.title}
              instructions={currentLecture.games.matchConcepts.instructions}
              onGameComplete={(score) =>
                onRecordProgress('game_complete', score, 100, {
                  title: `Match Concepts: ${currentLecture.lecture.title}`,
                  lectureTitle: currentLecture.lecture.title,
                })
              }
            />
          )}

          {activePlayingGame === 'rapid' && (
            <RapidFireGame
              questions={currentLecture.games.rapidFire.questions}
              timePerQuestion={currentLecture.games.rapidFire.timePerQuestion}
              title={currentLecture.games.rapidFire.title}
              instructions={currentLecture.games.rapidFire.instructions}
              onGameComplete={(score) =>
                onRecordProgress('game_complete', score, 100, {
                  title: `Rapid Fire: ${currentLecture.lecture.title}`,
                  lectureTitle: currentLecture.lecture.title,
                })
              }
            />
          )}

          {activePlayingGame === 'memory' && (
            <MemoryMatchGame
              pairs={currentLecture.games.memoryMatch.pairs}
              title={currentLecture.games.memoryMatch.title}
              instructions={currentLecture.games.memoryMatch.instructions}
              onGameComplete={(score) =>
                onRecordProgress('game_complete', score, 100, {
                  title: `Memory Match: ${currentLecture.lecture.title}`,
                  lectureTitle: currentLecture.lecture.title,
                })
              }
            />
          )}

          {activePlayingGame === 'sort' && (
            <SortItGame
              categories={currentLecture.games.sortIt.categories}
              items={currentLecture.games.sortIt.items}
              title={currentLecture.games.sortIt.title}
              instructions={currentLecture.games.sortIt.instructions}
              onGameComplete={(score) =>
                onRecordProgress('game_complete', score, 100, {
                  title: `Sort It: ${currentLecture.lecture.title}`,
                  lectureTitle: currentLecture.lecture.title,
                })
              }
            />
          )}

          {activePlayingGame === 'order' && (
            <PutItInOrderGame
              items={currentLecture.games.putItInOrder.items}
              processName={currentLecture.games.putItInOrder.processName}
              title={currentLecture.games.putItInOrder.title}
              instructions={currentLecture.games.putItInOrder.instructions}
              onGameComplete={(score) =>
                onRecordProgress('game_complete', score, 100, {
                  title: `Put It In Order: ${currentLecture.lecture.title}`,
                  lectureTitle: currentLecture.lecture.title,
                })
              }
            />
          )}

          {activePlayingGame === 'formula' && currentLecture.games.formulaBuilder && (
            <FormulaBuilderGame
              challenges={currentLecture.games.formulaBuilder.challenges}
              title={currentLecture.games.formulaBuilder.title}
              instructions={currentLecture.games.formulaBuilder.instructions}
              onGameComplete={(score) =>
                onRecordProgress('game_complete', score, 100, {
                  title: `Formula Builder: ${currentLecture.lecture.title}`,
                  lectureTitle: currentLecture.lecture.title,
                })
              }
            />
          )}

          {activePlayingGame === 'diagram' && currentLecture.games.diagramLabeler && (
            <DiagramLabelerGame
              data={currentLecture.games.diagramLabeler}
              onGameComplete={(score) =>
                onRecordProgress('game_complete', score, 100, {
                  title: `Diagram Labeler: ${currentLecture.lecture.title}`,
                  lectureTitle: currentLecture.lecture.title,
                })
              }
            />
          )}

          {activePlayingGame === 'boss' && (
            <BossChallengeGame
              bossData={currentLecture.games.bossChallenge}
              lectureTitle={currentLecture.lecture.title}
              onDefeatBoss={(xp) =>
                onRecordProgress('boss_defeat', xp, 100, {
                  title: `Boss Defeat: ${currentLecture.games.bossChallenge.bossName}`,
                  lectureTitle: currentLecture.lecture.title,
                })
              }
            />
          )}
        </div>
      ) : (
        /* GAME CARDS CATALOG */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {gameCatalog.map((game) => (
            <div
              key={game.key}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 uppercase">
                    {game.subject}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Best: {game.bestScore}</span>
                  </div>
                </div>

                <div className="text-3xl mb-2">{game.icon}</div>
                <h3 className="text-base font-bold text-white mb-1.5">{game.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{game.description}</p>
              </div>

              <button
                onClick={() => setActivePlayingGame(game.key)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition group-hover:scale-[1.02] active:scale-95"
              >
                PLAY NOW
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
