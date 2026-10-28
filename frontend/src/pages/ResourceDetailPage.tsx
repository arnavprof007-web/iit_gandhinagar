import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { resourceService } from '../services/resourceService';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Share2,
  BookOpen,
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const ResourceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const resource = resourceService.getResourceBySlug(slug || '');

  if (!resource) {
    return (
      <div className="text-center py-20 space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Article Not Found</h3>
        <p className="text-xs text-slate-500">
          The requested educational resource could not be found.
        </p>
        <Link to="/resources">
          <Button variant="primary" size="sm">
            Back to Library
          </Button>
        </Link>
      </div>
    );
  }

  const handleToggleBookmark = () => {
    resourceService.toggleBookmark(resource.id);
    showToast({
      title: !resource.isBookmarked ? 'Article Bookmarked' : 'Bookmark Removed',
      message: !resource.isBookmarked
        ? 'Saved to reading list.'
        : 'Removed from bookmarks.',
      type: 'info',
    });
  };

  const handleShare = () => {
    showToast({
      title: 'Link Copied',
      message: 'Article link copied to clipboard.',
      type: 'success',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/resources"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Knowledge Library</span>
        </Link>
      </div>

      {/* Main Article Container */}
      <Card className="p-6 sm:p-10 bg-white">
        {/* Category & Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <Badge variant="emerald" className="capitalize">
            {resource.category.replace(/_/g, ' ')}
          </Badge>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              title="Share Article"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleToggleBookmark}
              className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
              title="Bookmark Article"
            >
              {resource.isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="py-6 space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight leading-tight">
            {resource.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {resource.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(resource.publishedDate)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {resource.readTimeMinutes} min read
            </span>
          </div>
        </div>

        {/* Key Takeaways Callout Box */}
        <div className="p-5 my-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Key Mission LiFE Takeaways
          </h3>
          <ul className="space-y-2">
            {resource.keyTakeaways.map((item, idx) => (
              <li key={idx} className="text-xs text-emerald-900 leading-relaxed flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Content Body */}
        <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 space-y-4 whitespace-pre-line border-t border-slate-100 pt-6">
          {resource.content}
        </div>

        {/* Tags */}
        <div className="pt-8 mt-8 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Tags:</span>
          {resource.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg"
            >
              #{tag}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
};
