import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  PlusCircle,
  RotateCcw,
  User,
  LogOut,
  ExternalLink,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';

export const TopBar: React.FC = () => {
  const {
    user,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    resetAllDemo,
    setIsMobileNavOpen,
  } = useApp();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute page title and breadcrumb from pathname
  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    '/dashboard': { title: 'Personal Sustainability Dashboard', subtitle: 'Overview of consumption, footprint & active goals' },
    '/footprint': { title: 'Carbon Footprint Tracker', subtitle: 'Transparent household energy & travel emissions calculation' },
    '/challenges': { title: 'Green Challenges & Rewards', subtitle: 'Gamified micro-actions rooted in the Mission LiFE philosophy' },
    '/solar': { title: 'Rooftop Solar Feasibility Calculator', subtitle: 'Estimate generation capacity, capital cost, and payback period' },
    '/community': { title: 'Community & Local Impact', subtitle: 'Collaborate with city squads, compare leaderboards & attend events' },
    '/assistant': { title: 'Smart Green Assistant', subtitle: 'Interactive guidance for sustainable lifestyle questions' },
    '/weather': { title: 'Weather & Energy Insights', subtitle: 'Weather-aware recommendations to optimize solar & cooling' },
    '/resources': { title: 'Learn & Resources Library', subtitle: 'Verified articles, guidelines, and Mission LiFE themes' },
    '/progress': { title: 'My Progress & Historical Impact', subtitle: 'Long-term trendlines for energy conservation and avoided CO₂' },
    '/settings': { title: 'Profile & Platform Settings', subtitle: 'Configure household parameters and manage demo simulation' },
    '/admin': { title: 'Citizen Engagement Admin Dashboard', subtitle: 'Aggregate city statistics, campaign management & moderation' },
  };

  const currentMeta = pageTitles[location.pathname] || {
    title: 'GreenPulse Platform',
    subtitle: 'Mission LiFE Sustainability Platform',
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo state to pristine initial sample data?')) {
      resetAllDemo();
      showToast({
        title: 'Demo Data Reset',
        message: 'All local sample activities, points, and challenges restored to default.',
        type: 'info',
      });
      setIsUserMenuOpen(false);
    }
  };

  const handleSignOut = () => {
    showToast({
      title: 'Demo Session Ended',
      message: 'Signed out from simulated profile. Redirecting to landing page.',
      type: 'info',
    });
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-emerald-100 flex items-center justify-between px-4 lg:px-8">
      {/* Left: Hamburger & Titles */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate font-display">
            {currentMeta.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 truncate -mt-0.5">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Log Action */}
        <Link to="/footprint" className="hidden md:inline-flex">
          <Button size="sm" variant="secondary" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Log Activity
          </Button>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Notifications ({unreadNotificationsCount})
                </span>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationAsRead(notif.id);
                      if (notif.link) {
                        navigate(notif.link);
                        setIsNotifOpen(false);
                      }
                    }}
                    className={`p-3.5 hover:bg-emerald-50/50 cursor-pointer transition-colors ${
                      !notif.read ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-emerald-50 transition-colors"
            aria-label="User account menu"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
              <p className="text-[10px] text-emerald-600 font-medium">Level {user.level} Citizen</p>
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in-50 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                <div className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span>{user.city}, {user.state}</span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Profile & Preferences
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  Admin Simulation
                </Link>
                <button
                  onClick={handleReset}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  Reset Demo State
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out (Demo)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
