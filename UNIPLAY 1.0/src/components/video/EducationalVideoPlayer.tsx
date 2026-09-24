import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, SkipForward, SkipBack, Subtitles, CheckCircle2, RefreshCw } from 'lucide-react';
import { Lesson, Scene } from '../../types/index.js';
import { HeartVisualizer } from './visualizers/HeartVisualizer.js';
import { EconomicsVisualizer } from './visualizers/EconomicsVisualizer.js';
import { PhysicsVisualizer } from './visualizers/PhysicsVisualizer.js';
import { UniversalConceptVisualizer } from './visualizers/UniversalConceptVisualizer.js';

interface EducationalVideoPlayerProps {
  lesson: Lesson;
  onComplete?: () => void;
}

export const EducationalVideoPlayer: React.FC<EducationalVideoPlayerProps> = ({ lesson, onComplete }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSecond, setCurrentSecond] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [isRetryingScene, setIsRetryingScene] = useState<boolean>(false);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);

  const currentScene: Scene = lesson.scenes[currentSceneIndex] || lesson.scenes[0];
  const timerRef = useRef<any>(null);

  // Web Speech API for synchronized narration voiceover
  const speakNarration = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || isMuted) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = playbackSpeed;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis warning:', e);
    }
  };

  const stopNarration = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Scene transition & timer loop
  useEffect(() => {
    if (isPlaying) {
      speakNarration(currentScene.narration);
      timerRef.current = setInterval(() => {
        setCurrentSecond((prev) => {
          if (prev >= currentScene.duration) {
            // Next scene
            if (currentSceneIndex < lesson.scenes.length - 1) {
              setCurrentSceneIndex((idx) => idx + 1);
              return 0;
            } else {
              // Video completed!
              setIsPlaying(false);
              stopNarration();
              if (!hasCompleted) {
                setHasCompleted(true);
                onComplete?.();
              }
              return currentScene.duration;
            }
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      stopNarration();
      clearInterval(timerRef.current);
    }

    return () => {
      clearInterval(timerRef.current);
      stopNarration();
    };
  }, [isPlaying, currentSceneIndex, playbackSpeed, isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextScene = () => {
    if (currentSceneIndex < lesson.scenes.length - 1) {
      setCurrentSceneIndex((prev) => prev + 1);
      setCurrentSecond(0);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex((prev) => prev - 1);
      setCurrentSecond(0);
    }
  };

  const handleRetryScene = async () => {
    setIsRetryingScene(true);
    setIsPlaying(false);
    stopNarration();
    // Simulate scene recompilation & recovery
    await new Promise((r) => setTimeout(r, 600));
    setCurrentSecond(0);
    setIsRetryingScene(false);
    setIsPlaying(true);
  };

  const renderVisualComponent = () => {
    if (currentScene.customVisualKey === 'heart_circulatory') {
      return <HeartVisualizer currentSecond={currentSecond} />;
    }
    if (currentScene.customVisualKey === 'supply_demand') {
      return <EconomicsVisualizer currentSecond={currentSecond} />;
    }
    if (currentScene.customVisualKey === 'newton_dynamics') {
      return <PhysicsVisualizer />;
    }
    return <UniversalConceptVisualizer scene={currentScene} currentSecond={currentSecond} />;
  };

  const totalLessonDuration = lesson.scenes.reduce((acc, s) => acc + s.duration, 0);
  const elapsedSeconds =
    lesson.scenes.slice(0, currentSceneIndex).reduce((acc, s) => acc + s.duration, 0) + currentSecond;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalLessonDuration) * 100));

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Player Header */}
      <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-bold">
            SCENE {currentSceneIndex + 1} OF {lesson.scenes.length}
          </span>
          <h3 className="text-white font-semibold text-sm sm:text-base tracking-tight truncate max-w-[280px] sm:max-w-md">
            {currentScene.title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Scene Retry Button */}
          <button
            onClick={handleRetryScene}
            disabled={isRetryingScene}
            title="Rebuild/Retry this specific scene"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetryingScene ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">Retry Scene</span>
          </button>

          {/* Speed control */}
          <div className="flex items-center rounded-lg bg-slate-800/90 border border-slate-700/80 p-0.5 text-xs font-mono">
            {[1, 1.25, 1.5].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded ${
                  playbackSpeed === spd ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Educational Visual Viewport */}
      <div className="relative w-full aspect-video min-h-[380px] sm:min-h-[460px] bg-slate-950">
        {renderVisualComponent()}

        {/* Floating Subtitle / Narration Bar */}
        {showCaptions && (
          <div className="absolute bottom-4 inset-x-4 sm:inset-x-8 z-20 pointer-events-none">
            <div className="bg-slate-950/85 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700/80 shadow-2xl text-center">
              <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
                "{currentScene.narration}"
              </p>
            </div>
          </div>
        )}

        {/* Completion Overlay Banner */}
        {hasCompleted && (
          <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">Lesson Completed!</h4>
            <p className="text-slate-300 text-sm max-w-md mb-6">
              You've earned <strong className="text-emerald-400">+100 XP</strong> for completing this visual explanation. Ready to test yourself in the Quiz or play the educational games?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setCurrentSceneIndex(0);
                  setCurrentSecond(0);
                  setHasCompleted(false);
                  setIsPlaying(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
                Replay Lesson
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scrubber & Progress Bar */}
      <div className="px-4 pt-3 pb-1 bg-slate-950/90 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
          <span>
            {Math.floor(elapsedSeconds / 60)}:{('0' + (elapsedSeconds % 60)).slice(-2)}
          </span>
          <span className="text-indigo-400 font-bold">
            Scene {currentSceneIndex + 1}: {currentSecond}s / {currentScene.duration}s
          </span>
          <span>
            {Math.floor(totalLessonDuration / 60)}:{('0' + (totalLessonDuration % 60)).slice(-2)}
          </span>
        </div>
        <div
          className="relative w-full h-2 bg-slate-800 rounded-full cursor-pointer overflow-hidden"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            const targetSec = Math.floor(clickPos * totalLessonDuration);
            // find scene
            let accumulated = 0;
            for (let i = 0; i < lesson.scenes.length; i++) {
              if (accumulated + lesson.scenes[i].duration >= targetSec) {
                setCurrentSceneIndex(i);
                setCurrentSecond(targetSec - accumulated);
                break;
              }
              accumulated += lesson.scenes[i].duration;
            }
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="bg-slate-950 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Playback Transport */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevScene}
            disabled={currentSceneIndex === 0}
            className="p-2 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
            title="Previous Scene"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 transition-transform active:scale-95"
            title={isPlaying ? 'Pause' : 'Play Visual Lesson'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleNextScene}
            disabled={currentSceneIndex === lesson.scenes.length - 1}
            className="p-2 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
            title="Next Scene"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setCurrentSecond(0);
              speakNarration(currentScene.narration);
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white transition"
            title="Restart Scene"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Scene Selector Bubbles */}
        <div className="hidden md:flex items-center gap-1.5">
          {lesson.scenes.map((s, idx) => (
            <button
              key={s.id || idx}
              onClick={() => {
                setCurrentSceneIndex(idx);
                setCurrentSecond(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                currentSceneIndex === idx
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Scene {idx + 1}
            </button>
          ))}
        </div>

        {/* Audio & Accessibility Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-lg text-xs transition ${
              isMuted ? 'text-amber-400 bg-amber-950/40' : 'text-slate-400 hover:text-white'
            }`}
            title={isMuted ? 'Unmute voiceover' : 'Mute voiceover'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className={`p-2 rounded-lg text-xs transition ${
              showCaptions ? 'text-indigo-400 bg-indigo-950/50' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Subtitles"
          >
            <Subtitles className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
