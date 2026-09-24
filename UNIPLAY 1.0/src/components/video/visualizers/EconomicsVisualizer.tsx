import React, { useState } from 'react';

interface EconomicsVisualizerProps {
  currentSecond?: number;
}

export const EconomicsVisualizer: React.FC<EconomicsVisualizerProps> = () => {
  const [demandShift, setDemandShift] = useState<number>(0); // -40 to +40 shift
  const [supplyShift, setSupplyShift] = useState<number>(0);

  // Equilibrium calculations
  // P = 200 - Qd, P = 20 + Qs
  // With shifts:
  // D: P = (200 + demandShift) - Q
  // S: P = (20 - supplyShift) + Q
  // Equil: (200 + demandShift) - Q = (20 - supplyShift) + Q
  // 2Q = 180 + demandShift + supplyShift
  const eqQ = Math.round((180 + demandShift + supplyShift) / 2);
  const eqP = Math.round(200 + demandShift - eqQ);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl overflow-hidden flex flex-col p-4 border border-slate-800 shadow-2xl">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />

      {/* Top Header Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 z-10 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs uppercase tracking-wider font-mono font-bold text-slate-300">
            MARKET EQUILIBRIUM COORDINATE PLANE
          </span>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="text-slate-400">Equilibrium Price (P*): <strong className="text-emerald-400 font-bold text-sm">${eqP}</strong></span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Equilibrium Quantity (Q*): <strong className="text-sky-400 font-bold text-sm">{eqQ} units</strong></span>
        </div>
      </div>

      {/* Interactive Graph Canvas */}
      <div className="relative flex-1 w-full min-h-[260px] flex items-center justify-center">
        <svg viewBox="0 0 500 320" className="w-full h-full max-h-[340px]">
          <defs>
            <linearGradient id="surplusArea" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="prodSurplus" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Coordinate Axes */}
          {/* Y Axis (Price) */}
          <line x1="70" y1="280" x2="70" y2="30" stroke="#64748b" strokeWidth="2.5" markerEnd="url(#arrowY)" />
          {/* X Axis (Quantity) */}
          <line x1="70" y1="280" x2="470" y2="280" stroke="#64748b" strokeWidth="2.5" markerEnd="url(#arrowX)" />

          {/* Axis Labels */}
          <text x="35" y="45" fill="#94a3b8" fontSize="12" fontWeight="bold" className="font-mono">Price ($)</text>
          <text x="420" y="305" fill="#94a3b8" fontSize="12" fontWeight="bold" className="font-mono">Quantity (Q)</text>

          {/* Grid ticks */}
          <line x1="65" y1="90" x2="70" y2="90" stroke="#94a3b8" strokeWidth="2" />
          <text x="40" y="94" fill="#64748b" fontSize="10">$150</text>
          <line x1="65" y1="180" x2="70" y2="180" stroke="#94a3b8" strokeWidth="2" />
          <text x="40" y="184" fill="#64748b" fontSize="10">$100</text>

          {/* Equilibrium Mapping Coordinates */}
          {/* Map eqQ (70-110) to SVG X (120-420), eqP (80-140) to SVG Y (70-230) */}
          {(() => {
            const svgX = 70 + (eqQ / 160) * 360;
            const svgY = 280 - (eqP / 180) * 230;

            // Demand curve endpoints:
            const dY1 = 40;
            const dX1 = 70 + ((200 + demandShift - 160) / 160) * 360;
            const dY2 = 270;
            const dX2 = 70 + ((200 + demandShift - 20) / 160) * 360;

            // Supply curve endpoints:
            const sY1 = 270;
            const sX1 = 70 + ((20 - supplyShift) / 160) * 360;
            const sY2 = 40;
            const sX2 = 70 + ((160 - (20 - supplyShift)) / 160) * 360;

            return (
              <g>
                {/* Consumer Surplus Shaded Area */}
                <polygon
                  points={`70,${svgY} ${svgX},${svgY} 70,${280 - ((200 + demandShift) / 180) * 230}`}
                  fill="url(#surplusArea)"
                />

                {/* Producer Surplus Shaded Area */}
                <polygon
                  points={`70,${svgY} ${svgX},${svgY} 70,${280 - ((20 - supplyShift) / 180) * 230}`}
                  fill="url(#prodSurplus)"
                />

                {/* Dashed projections from Equilibrium */}
                <line x1="70" y1={svgY} x2={svgX} y2={svgY} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 3" />
                <line x1={svgX} y1={svgY} x2={svgX} y2="280" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 3" />

                {/* Demand Line (D) */}
                <line
                  x1={Math.max(80, dX1)}
                  y1={dY1}
                  x2={Math.min(460, dX2)}
                  y2={dY2}
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <text x={Math.min(435, dX2 - 20)} y={dY2 - 10} fill="#60a5fa" fontSize="14" fontWeight="bold">D</text>

                {/* Supply Line (S) */}
                <line
                  x1={Math.max(80, sX1)}
                  y1={sY1}
                  x2={Math.min(460, sX2)}
                  y2={sY2}
                  stroke="#f97316"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <text x={Math.min(435, sX2 - 10)} y={sY2 + 20} fill="#fb923c" fontSize="14" fontWeight="bold">S</text>

                {/* Equilibrium Node Marker */}
                <circle cx={svgX} cy={svgY} r="7" fill="#10b981" stroke="#ecfdf5" strokeWidth="2.5" className="animate-pulse" />
                <circle cx={svgX} cy={svgY} r="14" fill="#10b981" fillOpacity="0.25" />

                {/* Equilibrium Floating Tag */}
                <rect x={svgX + 12} y={svgY - 26} width="110" height="24" rx="4" fill="#064e3b" stroke="#10b981" strokeWidth="1.2" />
                <text x={svgX + 18} y={svgY - 10} fill="#6ee7b7" fontSize="11" fontWeight="bold">
                  E* (${eqP}, {eqQ}u)
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Interactive Controls Panel */}
      <div className="z-10 mt-2 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">Simulate Shocks:</span>
          <button
            onClick={() => setDemandShift((prev) => (prev === 30 ? 0 : 30))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              demandShift === 30 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {demandShift === 30 ? '✓ Demand Spike (D2)' : '+ Demand Shock'}
          </button>
          <button
            onClick={() => setSupplyShift((prev) => (prev === -30 ? 0 : -30))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              supplyShift === -30 ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {supplyShift === -30 ? '✓ Supply Shortage' : '- Supply Shock'}
          </button>
          <button
            onClick={() => {
              setDemandShift(0);
              setSupplyShift(0);
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700"
          >
            Reset
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Law of Demand: <span className="text-blue-400 font-bold">Inverse slope</span> | Law of Supply: <span className="text-amber-400 font-bold">Positive slope</span>
        </div>
      </div>
    </div>
  );
};
