import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar.js';
import { LandingPage } from './components/pages/LandingPage.js';
import { DashboardPage } from './components/pages/DashboardPage.js';
import { LecturesPage } from './components/pages/LecturesPage.js';
import { LectureDetailPage } from './components/pages/LectureDetailPage.js';
import { GamesHubPage } from './components/pages/GamesHubPage.js';
import { ProgressPage } from './components/pages/ProgressPage.js';
import { ProfilePage } from './components/pages/ProfilePage.js';
import { UploadLectureModal } from './components/upload/UploadLectureModal.js';
import { FullLectureData, UserStats, Achievement, JobProgress } from './types/index.js';
import { PRESET_LECTURES } from '../server/presetLectures.js';
import { Sparkles, Loader2, ChevronRight, CheckCircle2 } from 'lucide-react';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('/dashboard');
  const [lectures, setLectures] = useState<FullLectureData[]>(Object.values(PRESET_LECTURES));
  const [selectedLectureId, setSelectedLectureId] = useState<string>('anatomy-circulatory-system');
  const [selectedLectureTab, setSelectedLectureTab] = useState<string>('video');
  const [selectedGameKey, setSelectedGameKey] = useState<string | undefined>(undefined);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [activeJob, setActiveJob] = useState<JobProgress | null>(null);

  // Student Stats & Achievements
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 1240,
    level: 7,
    streakDays: 5,
    lastActiveDate: new Date().toISOString().split('T')[0],
    videosWatched: 6,
    quizzesCompleted: 5,
    quizAccuracy: 86,
    gamesPlayed: 14,
    recentScores: [
      { activity: 'Match Concepts: Anatomy', score: 820, lectureTitle: 'Human Anatomy & Circulatory Dynamics', date: 'Today' },
      { activity: 'Rapid Fire: Physics', score: 1240, lectureTitle: "Physics: Newton's Laws & Classical Dynamics", date: 'Yesterday' },
      { activity: 'Macroeconomics Quiz', score: 950, lectureTitle: 'Macroeconomics: Supply, Demand & Equilibrium', date: '2 days ago' },
    ],
    masteredLectureIds: ['anatomy-circulatory-system'],
    unlockedAchievementIds: ['first-lesson', 'quiz-streak', 'game-explorer', 'five-day-streak'],
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-lesson',
      title: 'First Lesson Complete',
      description: 'Watched your first animated visual lesson.',
      icon: 'PlayCircle',
      xpReward: 100,
      category: 'learning',
      isUnlocked: true,
      unlockedAt: '2 days ago',
      progress: 1,
      maxProgress: 1,
    },
    {
      id: 'quiz-master',
      title: 'Quiz Master',
      description: 'Complete 5 lecture mastery quizzes with >80% accuracy.',
      icon: 'Brain',
      xpReward: 250,
      category: 'quiz',
      isUnlocked: true,
      unlockedAt: 'Yesterday',
      progress: 5,
      maxProgress: 5,
    },
    {
      id: 'perfect-score',
      title: 'Perfect Precision',
      description: 'Attain a 100% perfect score on any university exam quiz.',
      icon: 'Sparkles',
      xpReward: 200,
      category: 'quiz',
      isUnlocked: false,
      progress: 0,
      maxProgress: 1,
    },
    {
      id: 'five-day-streak',
      title: '5-Day Study Streak',
      description: 'Engage with UNIPLAY for 5 consecutive study days.',
      icon: 'Flame',
      xpReward: 300,
      category: 'streak',
      isUnlocked: true,
      unlockedAt: 'Today',
      progress: 5,
      maxProgress: 5,
    },
    {
      id: 'game-explorer',
      title: 'Game Champion',
      description: 'Play 10 educational games across any university lectures.',
      icon: 'Gamepad2',
      xpReward: 200,
      category: 'games',
      isUnlocked: true,
      unlockedAt: 'Yesterday',
      progress: 14,
      maxProgress: 10,
    },
    {
      id: 'boss-slayer',
      title: 'Professor Challenge Conqueror',
      description: 'Defeat a final lecture boss challenge and master the subject.',
      icon: 'Trophy',
      xpReward: 350,
      category: 'mastery',
      isUnlocked: true,
      unlockedAt: 'Today',
      progress: 1,
      maxProgress: 1,
    },
  ]);

  // Fetch initial progress and sync from server
  useEffect(() => {
    async function loadData() {
      try {
        const progRes = await fetch('/api/progress');
        if (progRes.ok) {
          const progData = await progRes.json();
          if (progData.stats) setUserStats(progData.stats);
          if (progData.achievements) setAchievements(progData.achievements);
        }

        const lecRes = await fetch('/api/lectures');
        if (lecRes.ok) {
          const lecList = await lecRes.json();
          if (Array.isArray(lecList) && lecList.length > 0) {
            // Load full details for each lecture
            const fullList: FullLectureData[] = [];
            for (const item of lecList) {
              const fullRes = await fetch(`/api/lectures/${item.id}`);
              if (fullRes.ok) {
                fullList.push(await fullRes.json());
              }
            }
            if (fullList.length > 0) {
              setLectures(fullList);
            }
          }
        }
      } catch (e) {
        console.warn('Initial server sync warning, using local presets:', e);
      }
    }
    loadData();
  }, []);

  // Poll background job if saved in localStorage
  useEffect(() => {
    const savedJobId = localStorage.getItem('uniplay_active_job_id');
    if (!savedJobId) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${savedJobId}`);
        if (!res.ok) {
          if (res.status === 404) {
            localStorage.removeItem('uniplay_active_job_id');
            setActiveJob(null);
            clearInterval(interval);
          }
          return;
        }
        const data: JobProgress = await res.json();
        if (!isSubscribed) return;
        setActiveJob(data);

        if (data.status === 'completed' && data.lectureId) {
          clearInterval(interval);
          localStorage.removeItem('uniplay_active_job_id');
          handleLectureReady(data.lectureId);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          localStorage.removeItem('uniplay_active_job_id');
        }
      } catch (e) {
        console.warn('Background job poll warning:', e);
      }
    }, 1500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  const handleRecordProgress = async (
    activityType: string,
    score?: number,
    accuracy?: number,
    details?: any
  ) => {
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityType,
          lectureId: selectedLectureId,
          score,
          accuracy,
          details,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setUserStats(data.stats);
        }
      }
    } catch (e) {
      console.warn('Progress recording fallback to local:', e);
      // Fallback local update
      setUserStats((prev) => {
        const xpGain = activityType === 'video_complete' ? 100 : activityType === 'quiz_complete' ? 100 : 75;
        const newXp = prev.xp + xpGain;
        return {
          ...prev,
          xp: newXp,
          level: Math.floor(newXp / 250) + 1,
        };
      });
    }
  };

  const handleOpenLecture = (id: string, initialTab: string = 'video') => {
    setSelectedLectureId(id);
    setSelectedLectureTab(initialTab);
    setCurrentRoute(`/lecture/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToGames = (gameKey?: string) => {
    setSelectedGameKey(gameKey);
    setCurrentRoute('/games');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLectureReady = async (newLectureId: string) => {
    try {
      const res = await fetch(`/api/lectures/${newLectureId}`);
      if (res.ok) {
        const newLecture = await res.json();
        setLectures((prev) => [newLecture, ...prev.filter((l) => l.lecture.id !== newLectureId)]);
        handleOpenLecture(newLectureId, 'video');
      }
    } catch (e) {
      console.error('Failed to load new lecture:', e);
    }
  };

  const currentLectureData =
    lectures.find((l) => l.lecture.id === selectedLectureId) || lectures[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentRoute={currentRoute}
        navigate={(r) => {
          setCurrentRoute(r);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        userStats={userStats}
      />

      {/* Main Page Routing */}
      <main className="flex-1 flex flex-col">
        {currentRoute === '/' && (
          <LandingPage
            onOpenUpload={() => setIsUploadOpen(true)}
            onExploreLectures={() => {
              setCurrentRoute('/lectures');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenPreset={(key) => {
              handleOpenLecture(key, 'video');
            }}
          />
        )}

        {currentRoute === '/dashboard' && (
          <DashboardPage
            userStats={userStats}
            lectures={lectures}
            onOpenLecture={handleOpenLecture}
            onOpenUpload={() => setIsUploadOpen(true)}
            onNavigateToGames={handleNavigateToGames}
          />
        )}

        {currentRoute === '/lectures' && (
          <LecturesPage
            lectures={lectures}
            onOpenLecture={handleOpenLecture}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        )}

        {currentRoute.startsWith('/lecture/') && currentLectureData && (
          <LectureDetailPage
            lectureData={currentLectureData}
            initialTab={selectedLectureTab}
            onBack={() => setCurrentRoute('/lectures')}
            onRecordProgress={handleRecordProgress}
          />
        )}

        {currentRoute === '/games' && (
          <GamesHubPage
            lectures={lectures}
            initialGameKey={selectedGameKey}
            onRecordProgress={handleRecordProgress}
          />
        )}

        {currentRoute === '/progress' && (
          <ProgressPage userStats={userStats} achievements={achievements} />
        )}

        {currentRoute === '/profile' && (
          <ProfilePage
            userStats={userStats}
            lectures={lectures}
            onOpenLecture={handleOpenLecture}
          />
        )}
      </main>

      {/* Persistent Background Job Status Floating Bar */}
      {activeJob && activeJob.status !== 'completed' && activeJob.status !== 'failed' && !isUploadOpen && (
        <div className="fixed bottom-6 right-6 z-40 max-w-md w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            onClick={() => setIsUploadOpen(true)}
            className="p-4 rounded-2xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl backdrop-blur-xl cursor-pointer hover:border-indigo-400 transition group flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-white truncate flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  Compiling Lecture
                </span>
                <span className="font-mono font-bold text-indigo-400">{activeJob.progress}%</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{activeJob.message}</p>
              <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${activeJob.progress}%` }}
                />
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition shrink-0" />
          </div>
        </div>
      )}

      {/* Upload Lecture Modal with Async Job Pipeline Tracker */}
      <UploadLectureModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onLectureReady={handleLectureReady}
        onJobUpdate={(job) => setActiveJob(job)}
      />
    </div>
  );
}

export default App;
