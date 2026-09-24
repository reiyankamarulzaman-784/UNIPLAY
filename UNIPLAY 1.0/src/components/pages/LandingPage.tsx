import React from 'react';
import { Upload, Play, Brain, Gamepad2, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Zap, Flame, Trophy } from 'lucide-react';

interface LandingPageProps {
  onOpenUpload: () => void;
  onExploreLectures: () => void;
  onOpenPreset: (presetKey: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenUpload,
  onExploreLectures,
  onOpenPreset,
}) => {
  return (
    <div className="w-full flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Glow backdrop lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-600/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-blue-600/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider mb-6 animate-fadeIn">
            <Sparkles className="w-4 h-4" />
            <span>AI-POWERED UNIVERSITY LEARNING PLATFORM</span>
          </div>

          {/* Heading & Tagline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.08] mb-6">
            Turn your lectures into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              an experience.
            </span>
          </h1>

          <p className="text-lg sm:text-2xl text-indigo-200/90 font-medium mb-4">
            "Learn it. Play it. Master it."
          </p>

          <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your university lecture PDF. Watch it come alive through animated visual explanations, test yourself with verified quizzes, and play your way to exam mastery.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onOpenUpload}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Upload className="w-5 h-5" />
              <span>Upload a Lecture</span>
            </button>

            <button
              onClick={onExploreLectures}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-base border border-slate-700/80 transition-all"
            >
              <span>Explore Sample Lectures</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pipeline Visual Flow */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-6">
              The UNIPLAY Transformation Pipeline
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
              {[
                {
                  step: '01',
                  title: 'Upload Lecture',
                  desc: 'Drop your syllabus or slide PDF',
                  icon: Upload,
                  color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
                },
                {
                  step: '02',
                  title: 'Visual Lesson',
                  desc: 'Watch animated diagrams & curves',
                  icon: Play,
                  color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
                },
                {
                  step: '03',
                  title: 'Grounded Quiz',
                  desc: 'Zero-hallucination exam prep',
                  icon: Brain,
                  color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                },
                {
                  step: '04',
                  title: '8 Playable Games',
                  desc: 'Match, sort, calculate & beat the boss',
                  icon: Gamepad2,
                  color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-left flex flex-col justify-between relative group hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-xs font-bold text-slate-500">{item.step}</span>
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured University Subjects Showcase */}
      <section className="py-16 border-t border-slate-900 bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Tested Across Rigorous University Curriculums
            </h3>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              From anatomical hemodynamics to macroeconomics and Newtonian dynamics: real visual explanations grounded strictly in source content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Medicine / Biology */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 uppercase tracking-wider block w-fit mb-3">
                  MEDICINE & BIOLOGY
                </span>
                <h4 className="text-lg font-bold text-white mb-2">Human Anatomy & Circulatory Dynamics</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Full animated 4-chamber heart with active valves, dual systemic & pulmonary particle loops, and real-time hemodynamic formulas.
                </p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300 mb-4">
                  ✓ Synchronized cardiac cycle systole/diastole <br />
                  ✓ 8 educational games & Dr. Vance Boss Exam
                </div>
              </div>

              <button
                onClick={() => onOpenPreset('anatomy-circulatory-system')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-semibold text-xs transition"
              >
                Launch Anatomical Lesson ➔
              </button>
            </div>

            {/* Card 2: Economics */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase tracking-wider block w-fit mb-3">
                  MACROECONOMICS
                </span>
                <h4 className="text-lg font-bold text-white mb-2">Supply, Demand & Market Equilibrium</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Live Cartesian coordinate plane with animated supply and demand curves, dynamic demand shocks, price ceilings, and deadweight loss.
                </p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300 mb-4">
                  ✓ Real-time equilibrium solver (P*, Q*) <br />
                  ✓ Elasticity Formula Builder & Market Shocks
                </div>
              </div>

              <button
                onClick={() => onOpenPreset('economics-supply-demand')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-semibold text-xs transition"
              >
                Launch Economics Lesson ➔
              </button>
            </div>

            {/* Card 3: Physics */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 uppercase tracking-wider block w-fit mb-3">
                  PHYSICS & MECHANICS
                </span>
                <h4 className="text-lg font-bold text-white mb-2">Newton's Laws & Classical Dynamics</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Interactive vector force simulator: applied force vectors, kinetic friction opposition, normal forces, and acceleration calculation.
                </p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300 mb-4">
                  ✓ Live dynamic slider: F_net = m · a <br />
                  ✓ Sir Isaac Dynamics Boss Exam
                </div>
              </div>

              <button
                onClick={() => onOpenPreset('physics-newton-dynamics')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-semibold text-xs transition"
              >
                Launch Physics Lesson ➔
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Quality Constitution: "SHOW THE CONCEPT" */}
      <section className="py-16 border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-tr from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-900/60 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="max-w-2xl">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                UNIPLAY CORE PHILOSOPHY
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                "Show the concept, don't just say the concept."
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
                Most AI tools just read bullet points with moving subtitles. UNIPLAY compiles actual animated visual systems: chambers pumping fluid, curves shifting equilibrium coordinates, and vector arrows accelerating masses.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero Generic Hallucinations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>8 Playable Games</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>XP & Mastery Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <span className="text-indigo-400 font-black">UNIPLAY</span>
            <span>— "Learn it. Play it. Master it."</span>
          </div>
          <div>University-grade AI learning experience built for students.</div>
        </div>
      </footer>
    </div>
  );
};
