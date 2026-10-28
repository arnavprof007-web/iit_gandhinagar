import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-extrabold text-xl text-emerald-950 tracking-tight leading-none block">
                GreenPulse
              </span>
              <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">
                Mission LiFE
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-emerald-700 transition-colors">
              Features
            </a>
            <a href="#solar" className="hover:text-emerald-700 transition-colors">
              Rooftop Solar
            </a>
            <a href="#community" className="hover:text-emerald-700 transition-colors">
              Community
            </a>
            <Link to="/resources" className="hover:text-emerald-700 transition-colors">
              Resources
            </Link>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button size="sm" variant="ghost">
                Sign In
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Platform
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-emerald-800 hover:bg-emerald-50"
            aria-label="Toggle mobile menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-b border-emerald-100 bg-white px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            <a
              href="#how-it-works"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-emerald-50"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-emerald-50"
            >
              Features
            </a>
            <a
              href="#solar"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-emerald-50"
            >
              Rooftop Solar
            </a>
            <a
              href="#community"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-emerald-50"
            >
              Community
            </a>
            <Link
              to="/resources"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-emerald-50"
            >
              Resources
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link to="/login" onClick={() => setIsOpen(false)}>
              <Button size="sm" variant="outline" className="w-full justify-center">
                Sign In
              </Button>
            </Link>
            <Link to="/dashboard" onClick={() => setIsOpen(false)}>
              <Button size="sm" variant="primary" className="w-full justify-center">
                Explore Platform
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
