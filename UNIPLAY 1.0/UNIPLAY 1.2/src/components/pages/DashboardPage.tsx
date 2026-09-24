import React from 'react';
import { UserStats, FullLectureData } from '../../types/index.js';
import { Play, Flame, Trophy, Award, Target, Zap, Puzzle, ShieldAlert, ArrowRight, BookOpen, Clock, FileText, Upload } from 'lucide-react';

interface DashboardPageProps {
  userStats: UserStats;
  lectures: FullLectureData[];
  onOpenLecture: (id: string, initialTab?: string) => void;
  onOpenUpload: () => void;
  onNavigateToGames: (gameKey?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  userStats,
  lectures,
  onOpenLecture,
  onOpenUpload,
  onNavigateToGames,
}) => {
  const primaryLecture = lectures[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Welcome Banner & Continue Learning Hero */}
      <div className="flex flex-col lg:flex-row items-stretch gap-6">
        {/* Left: Continue Learning Hero Card */}
        <div className="flex-1 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-900/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold uppercase tracking-wider">
                CONTINUE LEARNING
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {primaryLecture?.lecture.estimatedDuration || '4 min lesson'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              {primaryLecture?.lecture.title || 'Human Anatomy & Circulatory Dynamics'}
            </h2>
            <p className="text-sm text-slate-300 line-clamp-2 max-w-xl mb-6">
              {primaryLecture?.lecture.summary || 'Analyze cardiac chambers, ventricular systole/diastole mechanics, and dual hemodynamics.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => onOpenLecture(primaryLecture?.lecture.id || 'anatomy-circulatory-system', 'video')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>▶ Continue Lesson</span>
            </button>

            <button
              onClick={() => onOpenLecture(primaryLecture?.lecture.id || 'anatomy-circulatory-system', 'quiz')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
            >
              Take Quiz
            </button>

            <button
              onClick={() => onOpenLecture(primaryLecture?.lecture.id || 'anatomy-circulatory-system', 'games')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
            >
              Play Games
            </button>
          </div>
        </div>

        {/* Right: Quick Stats Panel */}
        <div className="w-full lg:w-80 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4">
              STUDENT MASTERY STATS
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Total XP</span>
                </div>
                <div className="text-xl font-extrabold text-white font-mono">
                  {userStats.xp.toLocaleString()}
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  <span>Level</span>
                </div>
                <div className="text-xl font-extrabold text-purple-300 font-mono">
                  Lv.{userStats.level}
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                  <span>Streak</span>
                </div>
                <div className="text-xl font-extrabold text-orange-400 font-mono">
                  {userStats.streakDays} days
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Accuracy</span>
                </div>
                <div className="text-xl font-extrabold text-emerald-400 font-mono">
                  {userStats.quizAccuracy}%
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Games Played: <strong className="text-white">{userStats.gamesPlayed}</strong></span>
            <span>Videos: <strong className="text-white">{userStats.videosWatched}</strong></span>
          </div>
        </div>
      </div>

      {/* Quick Play Game Hub */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Quick Play Game Hub</h3>
            <p className="text-xs text-slate-400">Play real interactive mini-games powered by your lectures</p>
          </div>
          <button
            onClick={() => onNavigateToGames()}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All Games</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              key: 'match',
              name: '🎯 Match Concepts',
              tag: 'Terminology Pairing',
              desc: 'Pair lecture terms with definitions with combo multipliers.',
              color: 'from-blue-600/20 to-indigo-600/20 border-blue-500/30',
            },
            {
              key: 'rapid',
              name: '⚡ Rapid Fire',
              tag: '10s Time Sprint',
              desc: 'Answer fast-paced questions against the clock.',
              color: 'from-amber-600/20 to-orange-600/20 border-amber-500/30',
            },
            {
              key: 'memory',
              name: '🧩 Memory Match',
              tag: 'Tile Flip Grid',
              desc: 'Flip tiles face-up to uncover matching concept pairs.',
              color: 'from-purple-600/20 to-pink-600/20 border-purple-500/30',
            },
            {
              key: 'boss',
              name: '🏆 Boss Challenge',
              tag: 'Final University Exam',
              desc: 'Conquer multi-phase professor challenge to master the topic.',
              color: 'from-rose-600/20 to-red-600/20 border-rose-500/30',
            },
          ].map((game) => (
            <button
              key={game.key}
              onClick={() => onNavigateToGames(game.key)}
              className={`p-5 rounded-2xl bg-gradient-to-br ${game.color} border bg-slate-900/60 text-left hover:scale-[1.02] transition-all flex flex-col justify-between min-h-[150px] shadow-lg`}
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {game.tag}
                </span>
                <h4 className="text-base font-bold text-white mb-1.5">{game.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{game.desc}</p>
              </div>
              <span className="text-xs font-semibold text-indigo-300 font-mono mt-3 inline-flex items-center gap-1">
                Play Game ➔
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Lectures Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Recent University Lectures</h3>
            <p className="text-xs text-slate-400">All compiled lecture knowledge bases, lessons, and tests</p>
          </div>
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {lectures.map((lec) => {
            return (
              <div
                key={lec.lecture.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 uppercase">
                      {lec.lecture.subject}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {lec.lecture.estimatedDuration}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white line-clamp-1 mb-1.5">
                    {lec.lecture.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {lec.lecture.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenLecture(lec.lecture.id, 'video')}
                    className="flex-1 py-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white font-semibold text-xs transition text-center"
                  >
                    Watch Lesson
                  </button>
                  <button
                    onClick={() => onOpenLecture(lec.lecture.id, 'quiz')}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                  >
                    Quiz
                  </button>
                  <button
                    onClick={() => onOpenLecture(lec.lecture.id, 'games')}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                  >
                    Games
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
