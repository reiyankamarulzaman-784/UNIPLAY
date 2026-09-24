import React from 'react';
import { UserStats, Achievement } from '../../types/index.js';
import { Trophy, Flame, Target, Award, CheckCircle2, Sparkles, Lock, Clock, Calendar } from 'lucide-react';

interface ProgressPageProps {
  userStats: UserStats;
  achievements: Achievement[];
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ userStats, achievements }) => {
  const xpForNextLevel = userStats.level * 250;
  const currentLevelProgress = userStats.xp % 250;
  const progressPercent = Math.min(100, Math.round((currentLevelProgress / 250) * 100));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Student Academic Progress</h2>
        <p className="text-sm text-slate-400 mt-1">
          Detailed telemetry on your study streak, quiz accuracy, earned XP, and unlocked university honors.
        </p>
      </div>

      {/* Primary XP & Level Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                LEVEL {userStats.level} SCHOLAR
              </span>
              <span className="text-xs text-slate-400 font-mono">Honor Track</span>
            </div>
            <h3 className="text-3xl font-black text-white mt-1">
              {userStats.xp.toLocaleString()} <span className="text-sm text-slate-400 font-normal">Total XP</span>
            </h3>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="w-full md:w-80 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Next Level (Lv.{userStats.level + 1})</span>
            <span>{currentLevelProgress} / 250 XP</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Core Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-orange-400 font-mono mb-2">
            <Flame className="w-4 h-4 animate-pulse" />
            <span>LEARNING STREAK</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{userStats.streakDays} Days</div>
          <p className="text-xs text-slate-400">Consecutive active study sessions</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mb-2">
            <Target className="w-4 h-4" />
            <span>QUIZ ACCURACY</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{userStats.quizAccuracy}%</div>
          <p className="text-xs text-slate-400">Across {userStats.quizzesCompleted} validated exams</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-2">
            <Award className="w-4 h-4" />
            <span>GAMES PLAYED</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{userStats.gamesPlayed}</div>
          <p className="text-xs text-slate-400">Interactive learning drills completed</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-purple-400 font-mono mb-2">
            <Clock className="w-4 h-4" />
            <span>VIDEOS WATCHED</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{userStats.videosWatched}</div>
          <p className="text-xs text-slate-400">Animated visual lessons digested</p>
        </div>
      </div>

      {/* Achievements Gallery */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">University Achievements</h3>
            <p className="text-xs text-slate-400">Earn honors by watching lessons, perfecting quizzes, and defeating bosses.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            return (
              <div
                key={ach.id}
                className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  ach.isUnlocked
                    ? 'bg-slate-900 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    ach.isUnlocked
                      ? 'bg-gradient-to-tr from-indigo-500 to-emerald-400 text-white shadow-md'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {ach.isUnlocked ? <Sparkles className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-white text-sm">{ach.title}</h4>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      +{ach.xpReward} XP
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">{ach.description}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{ach.isUnlocked ? '✓ Unlocked' : 'Locked'}</span>
                    {ach.unlockedAt && <span>{ach.unlockedAt}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Scores Feed */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">Recent Study Activity</h3>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden">
          {userStats.recentScores.map((scoreItem, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">{scoreItem.activity}</div>
                  <div className="text-xs text-slate-400">{scoreItem.lectureTitle}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-indigo-400">+{scoreItem.score} pts</div>
                <div className="text-[10px] text-slate-500">{scoreItem.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
