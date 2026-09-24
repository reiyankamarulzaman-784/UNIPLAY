import React, { useState, useEffect } from 'react';

export const PhysicsVisualizer: React.FC = () => {
  const [appliedForce, setAppliedForce] = useState<number>(35); // 0 to 60 N
  const mass = 5; // 5 kg
  const frictionForce = 10; // 10 N opposing
  const netForce = Math.max(0, appliedForce - frictionForce);
  const acceleration = (netForce / mass).toFixed(2);
  const [posX, setPosX] = useState<number>(100);

  useEffect(() => {
    if (netForce > 0) {
      const interval = setInterval(() => {
        setPosX((prev) => (prev > 340 ? 60 : prev + parseFloat(acceleration) * 2));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [netForce, acceleration]);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl overflow-hidden flex flex-col p-4 border border-slate-800 shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:18px_18px] opacity-30" />

      {/* Header telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 z-10 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
          <span className="text-xs uppercase tracking-wider font-mono font-bold text-slate-300">
            CLASSICAL DYNAMICS & FORCE VECTOR SIMULATOR
          </span>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="text-slate-400">Net Force (ΣF): <strong className="text-emerald-400 font-bold text-sm">{netForce} N</strong></span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Acceleration (a): <strong className="text-amber-400 font-bold text-sm">{acceleration} m/s²</strong></span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 w-full min-h-[250px] flex items-center justify-center">
        <svg viewBox="0 0 500 280" className="w-full h-full">
          <defs>
            <linearGradient id="metalBlock" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#312e81" />
            </linearGradient>
            <pattern id="floorPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="20" x2="20" y2="0" stroke="#475569" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Horizontal Floor Surface */}
          <line x1="20" y1="200" x2="480" y2="200" stroke="#94a3b8" strokeWidth="4" />
          <rect x="20" y="202" width="460" height="30" fill="url(#floorPattern)" opacity="0.6" />

          {/* Dynamic Mass Block */}
          <g transform={`translate(${posX}, 120)`}>
            {/* Box Body */}
            <rect x="0" y="0" width="80" height="80" rx="8" fill="url(#metalBlock)" stroke="#818cf8" strokeWidth="2.5" />
            <text x="40" y="38" fill="#e0e7ff" fontSize="13" fontWeight="bold" textAnchor="middle" className="font-mono">
              m = {mass} kg
            </text>
            <text x="40" y="55" fill="#a5b4fc" fontSize="10" textAnchor="middle" className="font-mono">
              Inertia
            </text>

            {/* Normal Force Arrow (Upwards) */}
            <line x1="40" y1="0" x2="40" y2="-45" stroke="#38bdf8" strokeWidth="3" markerEnd="url(#arrowUp)" />
            <text x="45" y="-30" fill="#38bdf8" fontSize="10" fontWeight="bold" className="font-mono">Fn = 49 N</text>

            {/* Gravity Force Arrow (Downwards) */}
            <line x1="40" y1="80" x2="40" y2="125" stroke="#38bdf8" strokeWidth="3" markerEnd="url(#arrowDown)" />
            <text x="45" y="115" fill="#38bdf8" fontSize="10" fontWeight="bold" className="font-mono">mg = 49 N</text>

            {/* Applied Force Arrow (Right) */}
            {appliedForce > 0 && (
              <g>
                <line x1="80" y1="40" x2={80 + appliedForce * 1.5} y2="40" stroke="#10b981" strokeWidth="4" />
                <polygon
                  points={`${80 + appliedForce * 1.5},35 ${80 + appliedForce * 1.5 + 10},40 ${80 + appliedForce * 1.5},45`}
                  fill="#10b981"
                />
                <text x={85 + appliedForce * 1.5} y="44" fill="#34d399" fontSize="11" fontWeight="bold" className="font-mono">
                  F_app = {appliedForce} N
                </text>
              </g>
            )}

            {/* Friction Force Arrow (Left) */}
            {frictionForce > 0 && (
              <g>
                <line x1="0" y1="78" x2={-frictionForce * 2.2} y2="78" stroke="#ef4444" strokeWidth="3.5" />
                <polygon
                  points={`${-frictionForce * 2.2},74 ${-frictionForce * 2.2 - 8},78 ${-frictionForce * 2.2},82`}
                  fill="#ef4444"
                />
                <text x={-frictionForce * 2.2 - 60} y="82" fill="#f87171" fontSize="10" fontWeight="bold" className="font-mono">
                  fk = {frictionForce} N
                </text>
              </g>
            )}
          </g>

          {/* Governing Formula Banner */}
          <rect x="150" y="20" width="200" height="36" rx="8" fill="#0f172a" stroke="#4338ca" strokeWidth="1.5" />
          <text x="250" y="44" fill="#a5b4fc" fontSize="13" fontWeight="bold" textAnchor="middle" className="font-mono">
            ΣF = m × a  ⟹  {netForce}N = 5kg × {acceleration}m/s²
          </text>
        </svg>
      </div>

      {/* Force Slider Controls */}
      <div className="z-10 mt-2 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-[240px]">
          <span className="text-xs font-semibold text-slate-300">Adjust Applied Force (F):</span>
          <input
            type="range"
            min="0"
            max="60"
            value={appliedForce}
            onChange={(e) => setAppliedForce(parseInt(e.target.value, 10))}
            className="flex-1 accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-xs font-bold text-indigo-400 w-12">{appliedForce} N</span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Threshold Friction: <span className="text-rose-400 font-bold">{frictionForce} N</span> (Static/Kinetic Resistance)
        </div>
      </div>
    </div>
  );
};
