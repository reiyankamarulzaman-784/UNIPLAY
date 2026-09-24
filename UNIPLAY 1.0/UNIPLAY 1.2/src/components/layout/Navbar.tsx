import React, { useState } from 'react';
import { Sparkles, Flame, Trophy, Upload, Menu, X, BookOpen, Gamepad2, BarChart2, User, Home } from 'lucide-react';
import { UserStats } from '../../types/index.js';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenUpload: () => void;
  userStats: UserStats;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  navigate,
  onOpenUpload,
  userStats,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navLinks = [
    { label: 'Home', route: '/', icon: Home },
    { label: 'Dashboard', route: '/dashboard', icon: BookOpen },
    { label: 'Lectures', route: '/lectures', icon: BookOpen },
    { label: 'Game Hub', route: '/games', icon: Gamepad2 },
    { label: 'Progress', route: '/progress', icon: BarChart2 },
    { label: 'Profile', route: '/profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 group text-left transition"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white block leading-tight">
              UNI<span className="text-indigo-400">PLAY</span>
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider font-mono block leading-none">
              Learn it. Play it. Master it.
            </span>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
          {navLinks.map((link) => {
            const isActive =
              currentRoute === link.route ||
              (link.route !== '/' && currentRoute.startsWith(link.route));

            return (
              <button
                key={link.route}
                onClick={() => navigate(link.route)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* User Badges & Upload CTA */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Streak */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-950/40 border border-orange-900/60 text-xs font-mono">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="text-orange-300 font-bold">{userStats.streakDays}d</span>
          </div>

          {/* XP & Level */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-900/60 text-xs font-mono">
            <Trophy className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-300 font-bold">{userStats.xp.toLocaleString()} XP</span>
            <span className="text-indigo-400 font-extrabold ml-1">Lv.{userStats.level}</span>
          </div>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Lecture</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={onOpenUpload}
            className="p-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentRoute === link.route;
            return (
              <button
                key={link.route}
                onClick={() => {
                  navigate(link.route);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 text-indigo-400" />
                <span>{link.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono px-2 text-slate-400">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              Streak: {userStats.streakDays} days
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-indigo-400" />
              {userStats.xp} XP (Lv.{userStats.level})
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
