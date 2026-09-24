import React, { useState } from 'react';
import { UserStats, FullLectureData } from '../../types/index.js';
import { User, Award, BookOpen, Settings, Volume2, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ProfilePageProps {
  userStats: UserStats;
  lectures: FullLectureData[];
  onOpenLecture: (id: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userStats,
  lectures,
  onOpenLecture,
}) => {
  const [studentName, setStudentName] = useState<string>('Alex Chen');
  const [major, setMajor] = useState<string>('Biomedical Engineering & Pre-Med');
  const [university, setUniversity] = useState<string>('Global University');
  const [audioSpeed, setAudioSpeed] = useState<string>('1.0x');
  const [autoPlayVideos, setAutoPlayVideos] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      {/* Profile Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 text-3xl font-extrabold shrink-0">
          AC
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">{studentName}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono text-xs font-bold border border-indigo-500/30">
              Level {userStats.level} Honor Scholar
            </span>
          </div>
          <p className="text-sm text-slate-300 font-medium mb-1">{major}</p>
          <p className="text-xs text-slate-500 font-mono">{university}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 pt-4 border-t border-slate-800 text-xs font-mono text-slate-400">
            <span>XP: <strong className="text-white">{userStats.xp.toLocaleString()}</strong></span>
            <span>Streak: <strong className="text-orange-400">{userStats.streakDays} Days 🔥</strong></span>
            <span>Accuracy: <strong className="text-emerald-400">{userStats.quizAccuracy}%</strong></span>
          </div>
        </div>
      </div>

      {/* Profile Settings Form */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <Settings className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">Academic Profile & Learning Preferences</h3>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile and study preferences updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
              Student Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
              University / Institution
            </label>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
              Major / Academic Discipline
            </label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300">Synchronized Narration Default: 1.0x Voice Pitch</span>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition active:scale-95"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Mastered Lectures Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">Mastered University Modules</h3>
        </div>

        <div className="flex flex-col gap-3">
          {lectures.map((lec) => (
            <div
              key={lec.lecture.id}
              onClick={() => onOpenLecture(lec.lecture.id)}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between gap-4 transition"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">{lec.lecture.title}</h4>
                  <span className="text-xs text-slate-400 font-mono">{lec.lecture.subject} • Completed</span>
                </div>
              </div>
              <span className="text-xs text-indigo-400 font-semibold font-mono">Review Module ➔</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
