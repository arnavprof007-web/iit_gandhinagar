import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Footprints,
  Trophy,
  Sun,
  Users,
  Bot,
  CloudSun,
  BookOpen,
  LineChart,
  Settings,
  ShieldCheck,
  Leaf,
  Flame,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { user, isMobileNavOpen, setIsMobileNavOpen } = useApp();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/footprint', label: 'My Footprint', icon: Footprints },
    { to: '/challenges', label: 'Green Challenges', icon: Trophy },
    { to: '/solar', label: 'Solar Calculator', icon: Sun },
    { to: '/community', label: 'Community', icon: Users },
    { to: '/assistant', label: 'Smart Assistant', icon: Bot },
    { to: '/weather', label: 'Weather & Energy', icon: CloudSun },
    { to: '/resources', label: 'Learn & Resources', icon: BookOpen },
    { to: '/progress', label: 'My Progress', icon: LineChart },
    { to: '/settings', label: 'Profile & Settings', icon: Settings },
  ];

  const adminItem = { to: '/admin', label: 'Admin Dashboard', icon: ShieldCheck };

  const closeMobileNav = () => setIsMobileNavOpen(false);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={closeMobileNav}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-xl border-r border-emerald-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-emerald-100/70">
          <NavLink to="/" onClick={closeMobileNav} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-emerald-950 tracking-tight leading-none block">
                GreenPulse
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 tracking-wider uppercase">
                Mission LiFE
              </span>
            </div>
          </NavLink>
          <button
            onClick={closeMobileNav}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Mini Stat Pill */}
        <div className="mx-4 my-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border border-emerald-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Score: {user.greenScore}/100</span>
            </div>
            <div className="flex items-center gap-1 text-amber-700 font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{user.streakDays}d streak</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>Level {user.level} Citizen</span>
            <span className="font-semibold text-emerald-700">{user.greenPoints} pts</span>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobileNav}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 font-bold'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/70'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-3 mt-3 border-t border-slate-100">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Demo Administration
            </p>
            <NavLink
              to={adminItem.to}
              onClick={closeMobileNav}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <adminItem.icon className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span>{adminItem.label}</span>
            </NavLink>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-3 border-t border-emerald-100/60 bg-emerald-50/30 text-center">
          <p className="text-[10px] text-slate-400">
            Track 1: Green Energy & Sustainability
          </p>
          <p className="text-[10px] font-medium text-emerald-700 mt-0.5">
            HackCult '26 • Frontend Prototype
          </p>
        </div>
      </aside>
    </>
  );
};
