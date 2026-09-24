import React, { useEffect, useState } from 'react';
import { Scene } from '../../../types/index.js';

interface UniversalConceptVisualizerProps {
  scene: Scene;
  currentSecond: number;
}

export const UniversalConceptVisualizer: React.FC<UniversalConceptVisualizerProps> = ({ scene, currentSecond }) => {
  const [pulseTick, setPulseTick] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => setPulseTick((t) => (t + 1) % 60), 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl overflow-hidden flex flex-col p-4 border border-slate-800 shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

      {/* Visual Type Badge */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
        <span className="font-mono text-slate-300 uppercase tracking-wider font-semibold">
          {scene.visualType.replace('_', ' ')}
        </span>
      </div>

      {/* Center Dynamic SVG Canvas */}
      <div className="relative flex-1 w-full min-h-[260px] flex items-center justify-center">
        <svg viewBox="0 0 500 300" className="w-full h-full max-h-[340px]">
          <defs>
            <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connective Flow Lines */}
          <path
            d="M 120 150 C 200 80 300 220 380 150"
            fill="none"
            stroke="#475569"
            strokeWidth="3"
            strokeDasharray="6 4"
          />

          {/* Animated Flow Particles */}
          {scene.elements?.map((el, idx) => {
            const svgX = (el.x / 100) * 440 + 30;
            const svgY = (el.y / 100) * 220 + 40;
            const color = el.color || '#6366f1';

            if (el.type === 'node') {
              return (
                <g key={el.id || idx} className="transition-all duration-300">
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r={el.animation === 'pulse' ? 24 + (pulseTick % 6) : 22}
                    fill={color}
                    fillOpacity="0.2"
                    stroke={color}
                    strokeWidth="2.5"
                    filter="url(#nodeGlow)"
                  />
                  <circle cx={svgX} cy={svgY} r="8" fill={color} />
                  <rect
                    x={svgX - 55}
                    y={svgY + 28}
                    width="110"
                    height="22"
                    rx="4"
                    fill="#0f172a"
                    fillOpacity="0.9"
                    stroke={color}
                    strokeWidth="1"
                  />
                  <text
                    x={svgX}
                    y={svgY + 43}
                    fill="#e2e8f0"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {el.label?.substring(0, 16) || `Node ${idx + 1}`}
                  </text>
                </g>
              );
            }

            if (el.type === 'arrow') {
              return (
                <g key={el.id || idx}>
                  <line
                    x1={svgX - 30}
                    y1={svgY}
                    x2={svgX + 30}
                    y2={svgY}
                    stroke={color}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <polygon
                    points={`${svgX + 30},${svgY - 5} ${svgX + 42},${svgY} ${svgX + 30},${svgY + 5}`}
                    fill={color}
                  />
                  {el.label && (
                    <text x={svgX} y={svgY - 10} fill="#94a3b8" fontSize="10" textAnchor="middle" className="font-mono">
                      {el.label}
                    </text>
                  )}
                </g>
              );
            }

            if (el.type === 'formula') {
              return (
                <g key={el.id || idx}>
                  <rect
                    x={svgX - 90}
                    y={svgY - 20}
                    width="180"
                    height="38"
                    rx="8"
                    fill="#0f172a"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                  />
                  <text
                    x={svgX}
                    y={svgY + 4}
                    fill="#fef08a"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {el.label || 'Equation'}
                  </text>
                </g>
              );
            }

            if (el.type === 'particle_stream') {
              return (
                <g key={el.id || idx}>
                  <circle cx={svgX - 20} cy={svgY} r="4" fill={color} className="animate-ping" />
                  <circle cx={svgX} cy={svgY} r="5" fill={color} />
                  <circle cx={svgX + 20} cy={svgY} r="4" fill={color} className="animate-ping" />
                </g>
              );
            }

            // Default Box
            return (
              <g key={el.id || idx}>
                <rect
                  x={svgX - 45}
                  y={svgY - 25}
                  width="90"
                  height="50"
                  rx="6"
                  fill="#1e293b"
                  stroke={color}
                  strokeWidth="2"
                />
                <text x={svgX} y={svgY + 5} fill="#f1f5f9" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {el.label?.substring(0, 14) || 'Module'}
                </text>
              </g>
            );
          })}

          {/* Labels & Callouts */}
          {scene.labels?.map((lbl, i) => (
            <g key={i}>
              <rect
                x={(lbl.x / 100) * 440 + 15}
                y={(lbl.y / 100) * 220 + 25}
                width={lbl.text.length * 7 + 16}
                height="22"
                rx="4"
                fill={lbl.highlight ? '#1e1b4b' : '#0f172a'}
                stroke={lbl.highlight ? '#a855f7' : '#475569'}
                strokeWidth="1.2"
              />
              <text
                x={(lbl.x / 100) * 440 + 23}
                y={(lbl.y / 100) * 220 + 40}
                fill={lbl.highlight ? '#d8b4fe' : '#94a3b8'}
                fontSize="10"
                fontWeight={lbl.highlight ? 'bold' : 'normal'}
              >
                {lbl.text}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Storyboard Action Description Bottom Bar */}
      <div className="z-10 mt-2 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-indigo-400 font-semibold font-mono">SCENE ACTION:</span>
          <span>{scene.visualDescription}</span>
        </div>
        <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800 hidden md:inline-block">
          Key Takeaway: {scene.keyTakeaway}
        </span>
      </div>
    </div>
  );
};
