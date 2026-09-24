import React, { useState } from 'react';
import { FullLectureData, SubjectArea } from '../../types/index.js';
import { Search, Filter, BookOpen, Clock, FileText, Upload, Play, Brain, Gamepad2 } from 'lucide-react';

interface LecturesPageProps {
  lectures: FullLectureData[];
  onOpenLecture: (id: string, tab?: string) => void;
  onOpenUpload: () => void;
}

export const LecturesPage: React.FC<LecturesPageProps> = ({
  lectures,
  onOpenLecture,
  onOpenUpload,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  const subjects = ['All', 'Medicine', 'Economics', 'Physics', 'Biology', 'General'];

  const filteredLectures = lectures.filter((lec) => {
    const matchesSearch =
      lec.lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lec.lecture.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || lec.lecture.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">University Lecture Library</h2>
          <p className="text-sm text-slate-400 mt-1">
            Browse, watch, and master your processed lectures with interactive lessons, quizzes, and games.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition active:scale-95"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Lecture</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lectures, topics, or formulas..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Subject Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Lectures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLectures.map((lec) => {
          return (
            <div
              key={lec.lecture.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                    {lec.lecture.subject}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{lec.lecture.estimatedDuration}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                  {lec.lecture.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {lec.lecture.summary}
                </p>

                {/* Metadata Pills */}
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 mb-6">
                  <span className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                    <FileText className="w-3 h-3 text-slate-500" />
                    {lec.lecture.pageCount || 20} pages
                  </span>
                  <span className="bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                    {lec.lesson.scenes.length} Scenes
                  </span>
                  <span className="bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                    {lec.quiz.questions.length} Questions
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => onOpenLecture(lec.lecture.id, 'video')}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch</span>
                </button>
                <button
                  onClick={() => onOpenLecture(lec.lecture.id, 'quiz')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                  title="Take Grounded Quiz"
                >
                  <Brain className="w-4 h-4 text-emerald-400" />
                </button>
                <button
                  onClick={() => onOpenLecture(lec.lecture.id, 'games')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                  title="Play Educational Games"
                >
                  <Gamepad2 className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
