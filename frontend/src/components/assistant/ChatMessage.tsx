import React from 'react';
import { Link } from 'react-router-dom';
import { ChatMessage as ChatMessageType } from '../../types';
import { Bot, User, ArrowRight, ExternalLink } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.sender === 'assistant';

  return (
    <div className={`flex gap-3 my-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-xl space-y-2.5 ${isAssistant ? 'text-left' : 'text-right'}`}>
        {/* Bubble */}
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
            isAssistant
              ? 'bg-white border border-emerald-100 text-slate-800 shadow-sm'
              : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
          }`}
        >
          {message.text}
        </div>

        {/* Embedded Context Card if provided by assistant */}
        {isAssistant && message.contextCard && (
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                {message.contextCard.title}
              </span>
              <span className="text-xs font-black text-emerald-700">
                {message.contextCard.metric}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">{message.contextCard.description}</p>
            <Link
              to={message.contextCard.linkUrl}
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              <span>Explore Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Quick Suggestion Links */}
        {isAssistant && message.quickLinks && message.quickLinks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {message.quickLinks.map((link, idx) => (
              <Link
                key={idx}
                to={link.url}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[11px] font-semibold text-emerald-800 border border-emerald-200 transition-colors"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            ))}
          </div>
        )}

        <span className="text-[10px] text-slate-400 block px-1">{message.timestamp}</span>
      </div>

      {!isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
