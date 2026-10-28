import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Leaf, Home, LayoutDashboard } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6 shadow-md shadow-emerald-600/10">
        <Leaf className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-3">
        404 Page Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight mb-2">
        Off the Green Path
      </h1>

      <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
        The sustainability module or route you are looking for does not exist or has been relocated within the GreenPulse platform.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="outline" size="sm" leftIcon={<Home className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="primary" size="sm" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
            Open Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
