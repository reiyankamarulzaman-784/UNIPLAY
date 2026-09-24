import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { DiagramGameData, DiagramHotspot } from '../../types/index.js';
import { Target, CheckCircle2, RotateCcw } from 'lucide-react';
import { HeartVisualizer } from '../video/visualizers/HeartVisualizer.js';
import { EconomicsVisualizer } from '../video/visualizers/EconomicsVisualizer.js';

interface DiagramLabelerGameProps {
  data: DiagramGameData;
  title?: string;
  instructions?: string;
  onGameComplete?: (score: number) => void;
}

export const DiagramLabelerGame: React.FC<DiagramLabelerGameProps> = ({
  data,
  title = 'Interactive Diagram Labeler',
  instructions = 'Click a label from the tray, then pin it onto the corresponding anatomical or graphical hotspot.',
  onGameComplete,
}) => {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [placedHotspots, setPlacedHotspots] = useState<{ [spotId: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const availableLabels = data.hotspots
    .map((h) => h.label)
    .filter((l) => !Object.values(placedHotspots).includes(l));

  const handleHotspotClick = (spot: DiagramHotspot) => {
    if (!selectedLabel || isSubmitted) return;
    setPlacedHotspots((prev) => ({
      ...prev,
      [spot.id]: selectedLabel,
    }));
    setSelectedLabel(null);
  };

  const handleRemovePin = (spotId: string) => {
    if (isSubmitted) return;
    setPlacedHotspots((prev) => {
      const copy = { ...prev };
      delete copy[spotId];
      return copy;
    });
  };

  const handleSubmit = () => {
    let correct = 0;
    data.hotspots.forEach((h) => {
      if (placedHotspots[h.id] === h.label) {
        correct += 1;
      }
    });

    const calculatedScore = Math.round((correct / data.hotspots.length) * 500);
    setScore(calculatedScore);
    setIsSubmitted(true);

    if (correct === data.hotspots.length) {
      confetti({ particleCount: 75, spread: 70 });
    }
    onGameComplete?.(calculatedScore);
  };

  const restartGame = () => {
    setPlacedHotspots({});
    setSelectedLabel(null);
    setIsSubmitted(false);
    setScore(0);
  };

  const allPinned = Object.keys(placedHotspots).length === data.hotspots.length;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{instructions}</p>
        </div>

        {isSubmitted && (
          <div className="flex items-center gap-2 font-mono text-sm px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400">
            <span>Accuracy:</span>
            <strong>{score} / 500</strong>
          </div>
        )}
      </div>

      {/* Label Tray */}
      {!isSubmitted && (
        <div className="mb-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-2">
            Labels Tray (Tap label, then tap matching target hotspot):
          </span>
          <div className="flex flex-wrap gap-2">
            {availableLabels.map((lbl) => {
              const isSelected = selectedLabel === lbl;
              return (
                <button
                  key={lbl}
                  onClick={() => setSelectedLabel(isSelected ? null : lbl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600 text-slate-200'
                  }`}
                >
                  {lbl}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Diagram Canvas with Interactive Hotspots Overlaid */}
      <div className="relative w-full aspect-video min-h-[360px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
        {/* Render base diagram graphic */}
        {data.diagramType === 'circulatory_system' ? (
          <HeartVisualizer currentSecond={0} />
        ) : (
          <EconomicsVisualizer />
        )}

        {/* Hotspots Overlay */}
        {data.hotspots.map((h) => {
          const placed = placedHotspots[h.id];
          const isCorrect = isSubmitted && placed === h.label;
          const isWrong = isSubmitted && placed !== h.label;

          return (
            <div
              key={h.id}
              onClick={() => handleHotspotClick(h)}
              style={{ left: `${h.targetX}%`, top: `${h.targetY}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group`}
            >
              {placed ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePin(h.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-xl border flex items-center gap-1 transition ${
                    isSubmitted
                      ? isCorrect
                        ? 'bg-emerald-900 border-emerald-400 text-emerald-200'
                        : 'bg-rose-900 border-rose-400 text-rose-200'
                      : 'bg-indigo-600 border-indigo-300 text-white hover:bg-rose-600'
                  }`}
                >
                  <span>{placed}</span>
                  {!isSubmitted && <span className="opacity-60 text-[10px]">×</span>}
                  {isSubmitted && isCorrect && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
              ) : (
                <div className="relative flex items-center justify-center">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/80 border-2 border-white flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-lg animate-pulse" />
                  <span className="absolute -top-6 whitespace-nowrap opacity-0 group-hover:opacity-100 transition bg-slate-900 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700 pointer-events-none">
                    {h.description}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={restartGame}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear All Pins</span>
        </button>

        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!allPinned}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition"
          >
            Validate Hotspots
          </button>
        ) : (
          <button
            onClick={restartGame}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition"
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
};
