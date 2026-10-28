import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resourceService } from '../services/resourceService';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Sun,
  Bike,
  Leaf,
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const ResourcesPage: React.FC = () => {
  const { showToast } = useToast();
  const [resources, setResources] = useState(() => resourceService.getResources());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = resourceService.toggleBookmark(id);
    setResources(resourceService.getResources());
    if (updated) {
      showToast({
        title: updated.isBookmarked ? 'Article Bookmarked' : 'Bookmark Removed',
        message: updated.isBookmarked
          ? `Saved "${updated.title}" to reading list.`
          : `Removed "${updated.title}".`,
        type: updated.isBookmarked ? 'success' : 'info',
      });
    }
  };

  const filtered = resources.filter((res) => {
    if (selectedCategory !== 'all' && res.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        res.title.toLowerCase().includes(q) ||
        res.summary.toLowerCase().includes(q) ||
        res.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const featured = resources[0];

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Mission LiFE Knowledge Library
          </h2>
          <p className="text-xs text-slate-500">
            Educational guidelines, solar policies, and evidence-based sustainability strategies
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, policies, tags..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>

      {/* Featured Article Hero Card */}
      {featured && selectedCategory === 'all' && !searchQuery && (
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-emerald-800 to-teal-950 text-white shadow-xl overflow-hidden relative">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500 text-emerald-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Featured Mission LiFE Guide</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              {featured.title}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {featured.summary}
            </p>
            <div className="flex items-center gap-4 text-xs text-emerald-300 pt-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {featured.readTimeMinutes} min read
              </span>
              <span>•</span>
              <span>{formatDate(featured.publishedDate)}</span>
            </div>
            <div className="pt-2">
              <Link to={`/resources/${featured.slug}`}>
                <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Read Complete Guide
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'All Articles' },
          { key: 'mission_life', label: 'Mission LiFE Pillars' },
          { key: 'solar', label: 'Rooftop Solar & Subsidies' },
          { key: 'energy', label: 'Energy Efficiency' },
          { key: 'transport', label: 'Clean Mobility' },
        ].map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat.key
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white hover:bg-emerald-50 text-slate-600 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filtered.map((res) => (
          <Card key={res.id} hoverEffect className="p-6 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <Badge variant="emerald" className="capitalize text-[11px]">
                  {res.category.replace(/_/g, ' ')}
                </Badge>
                <button
                  onClick={(e) => handleToggleBookmark(res.id, e)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 transition-colors"
                  title={res.isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                  aria-label="Bookmark"
                >
                  {res.isBookmarked ? (
                    <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Title & Summary */}
              <Link to={`/resources/${res.slug}`}>
                <h4 className="font-bold text-slate-900 text-base mb-2 hover:text-emerald-700 transition-colors">
                  {res.title}
                </h4>
              </Link>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                {res.summary}
              </p>

              {/* Key Takeaways Preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1 mb-4">
                <span className="font-bold text-slate-800 block text-xs">Core takeaway:</span>
                <p>• {res.keyTakeaways[0]}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 text-[11px]">
                <Clock className="w-3.5 h-3.5" /> {res.readTimeMinutes} min read
              </span>
              <Link
                to={`/resources/${res.slug}`}
                className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 text-xs"
              >
                <span>Read Full</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
