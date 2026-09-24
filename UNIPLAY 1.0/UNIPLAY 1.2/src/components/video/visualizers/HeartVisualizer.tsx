import React, { useEffect, useState } from 'react';

interface HeartVisualizerProps {
  currentSecond: number;
  highlightLabel?: string;
}

export const HeartVisualizer: React.FC<HeartVisualizerProps> = ({ currentSecond, highlightLabel }) => {
  const [beatPhase, setBeatPhase] = useState<'systole' | 'diastole'>('diastole');

  useEffect(() => {
    const interval = setInterval(() => {
      setBeatPhase((prev) => (prev === 'diastole' ? 'systole' : 'diastole'));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const isSystole = beatPhase === 'systole';
  const scale = isSystole ? 'scale-95' : 'scale-100';

  return (
    <div className="relative w-full h-full min-h-[380px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl overflow-hidden flex items-center justify-center p-4 border border-slate-800 shadow-2xl">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

      {/* Floating telemetry metrics */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-400 uppercase tracking-wider font-mono font-bold">CARDIAC SIMULATOR</span>
        </div>
        <div className="text-white font-mono text-sm">
          Phase: <span className={isSystole ? 'text-amber-400 font-bold' : 'text-sky-400 font-bold'}>{isSystole ? 'VENTRICULAR SYSTOLE (120 mmHg)' : 'VENTRICULAR DIASTOLE (80 mmHg)'}</span>
        </div>
        <div className="text-slate-400 font-mono text-[11px]">Heart Rate: 72 BPM | Stroke Volume: 70 mL</div>
      </div>

      {/* Circuit Legend */}
      <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/60 text-xs flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
          <span className="text-slate-300">Deoxygenated (Right Heart & Lungs)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
          <span className="text-slate-300">Oxygenated (Left Heart & Body)</span>
        </div>
      </div>

      {/* SVG Interactive Anatomical Heart */}
      <div className={`transition-transform duration-500 ease-in-out ${scale} relative max-w-[500px] w-full aspect-square`}>
        <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
          <defs>
            {/* Gradients */}
            <linearGradient id="blueBlood" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="redBlood" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#991b1b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <linearGradient id="myocardium" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#831843" />
              <stop offset="100%" stopColor="#500724" />
            </linearGradient>
            <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Vena Cava (Top Left returning blue blood) */}
          <path d="M 140 30 L 140 170 C 140 190 170 190 170 170 L 170 30 Z" fill="url(#blueBlood)" opacity="0.85" />
          <text x="110" y="25" fill="#93c5fd" fontSize="11" fontWeight="600" className="font-mono">SUPERIOR VENA CAVA</text>

          {/* Aorta Arch (Top Red surging to body) */}
          <path d="M 230 140 C 230 40 340 30 350 140 L 320 150 C 310 70 250 80 250 140 Z" fill="url(#redBlood)" filter="url(#glowRed)" />
          {/* Aorta Branch arteries */}
          <path d="M 270 65 L 265 20 M 295 65 L 295 20 M 320 75 L 330 25" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" />
          <text x="325" y="20" fill="#fca5a5" fontSize="11" fontWeight="600" className="font-mono">AORTA ARCH</text>

          {/* Pulmonary Artery (Blue to lungs) */}
          <path d="M 200 170 C 200 100 130 90 90 110 L 80 80 C 140 60 230 70 230 170 Z" fill="url(#blueBlood)" opacity="0.9" />
          <text x="25" y="95" fill="#93c5fd" fontSize="11" fontWeight="600" className="font-mono">PULMONARY TRUNK</text>

          {/* Outer Cardiac Muscle Walls (Myocardium) */}
          <path
            d="M 120 180 C 100 280 150 420 250 460 C 350 420 400 270 370 180 C 350 170 320 170 300 180 C 270 180 230 170 200 180 C 160 170 130 170 120 180 Z"
            fill="url(#myocardium)"
            stroke="#9d174d"
            strokeWidth="8"
          />

          {/* Right Atrium Chamber (Deoxygenated) */}
          <path
            d="M 140 180 C 120 210 130 250 160 260 C 180 260 190 230 190 200 C 190 180 160 170 140 180 Z"
            fill="#1e3a8a"
            stroke="#3b82f6"
            strokeWidth="3"
            opacity="0.9"
            className={isSystole ? '' : 'animate-pulse'}
          />

          {/* Left Atrium Chamber (Oxygenated) */}
          <path
            d="M 310 180 C 330 210 320 250 290 260 C 270 260 260 230 260 200 C 260 180 290 170 310 180 Z"
            fill="#991b1b"
            stroke="#ef4444"
            strokeWidth="3"
            opacity="0.9"
            className={isSystole ? '' : 'animate-pulse'}
          />

          {/* Interventricular Septum (Muscular Central Wall) */}
          <path d="M 230 270 C 230 330 235 410 250 450 C 255 410 260 330 260 270 Z" fill="#500724" stroke="#831843" strokeWidth="4" />
          <text x="215" y="380" fill="#fbcfe8" fontSize="10" className="font-mono">SEPTUM</text>

          {/* Right Ventricle Chamber (Blue) */}
          <path
            d="M 160 270 C 160 330 190 400 230 430 C 230 340 220 280 200 270 Z"
            fill="#1d4ed8"
            stroke="#60a5fa"
            strokeWidth="3"
            className={isSystole ? 'brightness-125' : ''}
          />

          {/* Left Ventricle Chamber (Red, Extra Thick Myocardium Wall) */}
          <path
            d="M 260 270 C 270 340 280 400 250 440 C 300 410 340 330 320 270 Z"
            fill="#b91c1c"
            stroke="#f87171"
            strokeWidth="4"
            className={isSystole ? 'brightness-125' : ''}
          />

          {/* Animated Valves */}
          {/* Tricuspid Valve (Right) */}
          <line
            x1="165"
            y1="265"
            x2="195"
            y2="265"
            stroke={isSystole ? '#94a3b8' : '#38bdf8'}
            strokeWidth="4"
            strokeDasharray={isSystole ? '' : '4 2'}
          />
          {/* Mitral Valve (Left) */}
          <line
            x1="265"
            y1="265"
            x2="295"
            y2="265"
            stroke={isSystole ? '#94a3b8' : '#fb7185'}
            strokeWidth="4"
            strokeDasharray={isSystole ? '' : '4 2'}
          />

          {/* Blood Flow Particles: Animated Moving Dots */}
          {/* Blue stream entering right heart */}
          <circle cx="155" cy="80" r="4.5" fill="#93c5fd" className="animate-bounce" />
          <circle cx="155" cy="140" r="4.5" fill="#60a5fa" className="animate-ping" />
          <circle cx="170" cy="220" r="5" fill="#3b82f6" />
          <circle cx="190" cy="330" r="5" fill="#2563eb" />
          <circle cx="215" cy="140" r="4.5" fill="#38bdf8" />

          {/* Red stream surging through left heart */}
          <circle cx="290" cy="220" r="5" fill="#ef4444" />
          <circle cx="280" cy="350" r="5.5" fill="#f87171" className="animate-ping" />
          <circle cx="280" cy="110" r="6" fill="#fca5a5" className="animate-bounce" />
          <circle cx="330" cy="80" r="6" fill="#f87171" />

          {/* Chamber Text Labels */}
          <g className="cursor-pointer">
            <rect x="135" y="205" width="45" height="20" rx="4" fill="#0f172a" fillOpacity="0.8" stroke="#3b82f6" strokeWidth="1" />
            <text x="142" y="220" fill="#93c5fd" fontSize="11" fontWeight="bold">RA</text>
          </g>

          <g className="cursor-pointer">
            <rect x="175" y="320" width="45" height="20" rx="4" fill="#0f172a" fillOpacity="0.8" stroke="#3b82f6" strokeWidth="1" />
            <text x="183" y="335" fill="#93c5fd" fontSize="11" fontWeight="bold">RV</text>
          </g>

          <g className="cursor-pointer">
            <rect x="280" y="205" width="45" height="20" rx="4" fill="#0f172a" fillOpacity="0.8" stroke="#ef4444" strokeWidth="1" />
            <text x="288" y="220" fill="#fca5a5" fontSize="11" fontWeight="bold">LA</text>
          </g>

          <g className="cursor-pointer">
            <rect x="270" y="320" width="45" height="20" rx="4" fill="#0f172a" fillOpacity="0.8" stroke="#ef4444" strokeWidth="1" />
            <text x="278" y="335" fill="#fca5a5" fontSize="11" fontWeight="bold">LV</text>
          </g>

          {/* Flow Direction Indicator Arrows */}
          <path d="M 155 100 L 155 130" stroke="#93c5fd" strokeWidth="2" markerEnd="url(#arrowBlue)" />
          <path d="M 195 380 Q 210 240 215 150" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="5 3" />
          <path d="M 280 370 Q 260 250 270 140" fill="none" stroke="#f87171" strokeWidth="3" strokeDasharray="5 3" />
        </svg>
      </div>

      {/* Bottom Subtitle / Concept Pill */}
      <div className="absolute bottom-3 inset-x-6 z-10 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/80 text-xs">
        <span className="text-slate-300 font-medium">
          {isSystole ? '🔴 Systole: Ventricles contract simultaneously, pushing blood into Aorta (120 mmHg) & Pulmonary Artery (25 mmHg)' : '🔵 Diastole: Ventricles relax and fill passively through open AV valves from Atria'}
        </span>
        <span className="hidden sm:inline-block font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800">
          CO = SV × HR = 5.0 L/min
        </span>
      </div>
    </div>
  );
};
