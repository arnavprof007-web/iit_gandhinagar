import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  Leaf,
  ArrowRight,
  Sun,
  Zap,
  TrendingDown,
  Trophy,
  Users,
  ShieldCheck,
  CheckCircle2,
  LineChart,
  Globe2,
  Sparkles,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Pitch */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mission LiFE • Track 1 Green Energy & Sustainability</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 font-display tracking-tight leading-[1.15]">
                Small actions.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  Measurable impact.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                GreenPulse is India's dedicated citizen sustainability platform. Monitor household electricity consumption, track your estimated carbon footprint, complete rewarding Mission LiFE challenges, and discover rooftop solar savings.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link to="/onboarding" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="primary"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    className="w-full sm:w-auto justify-center text-base py-3 px-6 shadow-lg shadow-emerald-600/25"
                  >
                    Start My Green Journey
                  </Button>
                </Link>
                <Link to="/solar" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    leftIcon={<Sun className="w-5 h-5 text-amber-500" />}
                    className="w-full sm:w-auto justify-center text-base py-3 px-6"
                  >
                    Explore Rooftop Solar
                  </Button>
                </Link>
              </div>

              {/* Sample Indicator Disclaimer */}
              <p className="text-[11px] text-slate-400">
                * Note: Platform displays illustrative sample data for hackathon presentation and demonstration purposes.
              </p>
            </div>

            {/* Right Column: Dynamic Interactive UI Mockup */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Glow Backdrop */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-3xl blur-xl opacity-30 animate-pulse" />

                {/* Main Floating Glass Card */}
                <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-emerald-100 shadow-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <Leaf className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Household Footprint</h4>
                        <p className="text-[11px] text-slate-400">Gandhinagar • October 2026</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      -32.1% CO₂e
                    </span>
                  </div>

                  {/* Circular Dial & Savings */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-center">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                        Current Emissions
                      </span>
                      <span className="text-xl font-black text-emerald-900 font-display">
                        247.8 kg
                      </span>
                      <span className="text-[10px] text-emerald-700 block mt-0.5">
                        Down from 365 kg
                      </span>
                    </div>

                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100 text-center">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                        Electricity Saved
                      </span>
                      <span className="text-xl font-black text-amber-900 font-display">
                        62 kWh
                      </span>
                      <span className="text-[10px] text-amber-700 block mt-0.5">
                        Saved ₹472 this month
                      </span>
                    </div>
                  </div>

                  {/* Mini Challenge Preview */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">
                        AC 24°C Comfort Standard
                      </span>
                    </div>
                    <span className="text-emerald-700 font-bold text-xs">+25 pts</span>
                  </div>

                  {/* Quick CTAs */}
                  <Link to="/dashboard" className="block w-full">
                    <Button variant="primary" size="sm" className="w-full justify-center">
                      Launch Demo Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Aggregate Demo Statistics Banner */}
      <section className="py-12 bg-white border-y border-emerald-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-950 font-display">4,890+</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Active Citizen Households</p>
              <span className="text-[10px] text-slate-400 block mt-0.5">(Sample Demo Metric)</span>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-display">142.8 t</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Est. CO₂e Avoided</p>
              <span className="text-[10px] text-slate-400 block mt-0.5">(Sample Demo Metric)</span>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-display">318 MWh</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Rooftop Solar Modeled</p>
              <span className="text-[10px] text-slate-400 block mt-0.5">(Sample Demo Metric)</span>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-teal-600 font-display">16,400+</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Green Challenges Completed</p>
              <span className="text-[10px] text-slate-400 block mt-0.5">(Sample Demo Metric)</span>
            </div>
          </div>
        </div>
      </section>

      {/* "How It Works" Section: Measure, Improve, Earn, Inspire */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              The Mission LiFE Framework
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
              A 4-Step Cycle for Conscious Living
            </h2>
            <p className="text-sm text-slate-600">
              Transforming abstract climate statistics into actionable, habit-forming daily practices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <Card className="p-6 text-center space-y-3 border-emerald-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-lg flex items-center justify-center mx-auto">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900">Measure</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log household electricity consumption, commute mileage, and cooking gas to calculate transparent CO₂ equivalent emissions.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="p-6 text-center space-y-3 border-emerald-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 font-extrabold text-lg flex items-center justify-center mx-auto">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900">Improve</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive personalized energy-efficiency advice: set AC at 24°C, switch to BLDC fans, and evaluate rooftop solar feasibility.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="p-6 text-center space-y-3 border-emerald-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 font-extrabold text-lg flex items-center justify-center mx-auto">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900">Earn</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete daily and weekly green challenges to collect Green Points, advance through citizen tiers, and unlock sustainability badges.
              </p>
            </Card>

            {/* Step 4 */}
            <Card className="p-6 text-center space-y-3 border-emerald-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-800 font-extrabold text-lg flex items-center justify-center mx-auto">
                4
              </div>
              <h3 className="font-bold text-base text-slate-900">Inspire</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Form city squads with college campuses, workplaces, or neighbourhoods to compete on leaderboards and attend local eco workshops.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Features Section */}
      <section id="features" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
              Built for Real Indian Households
            </h2>
            <p className="text-sm text-slate-600">
              Every calculator and insight is calibrated to Indian electrical tariffs, weather patterns, and the national PM Surya Ghar rooftop solar initiative.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Transparent Carbon Math</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clear emission constants based on CEA India's 0.716 kg CO₂e/kWh baseline. No hidden assumptions or ambiguous claims.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <Sun className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Rooftop Solar Simulator</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluate generation potential, capital outlay, DBT central subsidies of up to ₹78,000, and 25-year financial returns.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Community Squads</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect with neighbours across Gandhinagar and Indian cities. Share solar experiences, carpool, and attend green events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-emerald-800 to-teal-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Ready to track your household impact?
          </h2>
          <p className="text-sm text-emerald-100 max-w-xl mx-auto">
            Experience the complete Mission LiFE prototype with live calculators, interactive charts, and community leaderboards.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="bg-white text-emerald-900 hover:bg-emerald-50">
                Open Personal Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
