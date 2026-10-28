import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Heart, Shield, Globe, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-emerald-950 text-emerald-100/80 pt-16 pb-12 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-emerald-900/60">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-emerald-950 shadow-md">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                GreenPulse
              </span>
            </div>
            <p className="text-xs text-emerald-300/80 leading-relaxed">
              Empowering citizens to practice mindful, measurable environmental habits under the
              philosophy of Mission LiFE (Lifestyle for Environment).
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-800 text-[11px] text-emerald-300">
              <Award className="w-3.5 h-3.5" />
              <span>HackCult '26 • Track 1 Finalist</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Personal Dashboard
                </Link>
              </li>
              <li>
                <Link to="/footprint" className="hover:text-white transition-colors">
                  Carbon Footprint Tracker
                </Link>
              </li>
              <li>
                <Link to="/challenges" className="hover:text-white transition-colors">
                  Mission LiFE Challenges
                </Link>
              </li>
              <li>
                <Link to="/solar" className="hover:text-white transition-colors">
                  Rooftop Solar Feasibility
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-white transition-colors">
                  City Community Squads
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Insights */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Insights & Policies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/weather" className="hover:text-white transition-colors">
                  Weather-Aware Energy Advice
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-white transition-colors">
                  Mission LiFE 7 Pillars
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-white transition-colors">
                  PM Surya Ghar Guidelines
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-white transition-colors">
                  Smart Green Assistant
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Admin Analytics Simulation
                </Link>
              </li>
            </ul>
          </div>

          {/* Methodology & Transparency */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Transparency
            </h4>
            <p className="text-xs text-emerald-300/80 leading-relaxed mb-3">
              Emission factors are indicative calculations referenced from the Central Electricity
              Authority (CEA) India baseline and standard IPCC transport averages.
            </p>
            <div className="flex items-center gap-3 text-xs text-emerald-400">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> India Baseline
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Client-Side Demo
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-400/80 gap-4">
          <p>© 2026 GreenPulse Platform. Built for HackCult '26 Green Energy & Sustainability.</p>
          <div className="flex items-center gap-1 text-emerald-300">
            <span>Designed with</span>
            <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>for Mission LiFE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
