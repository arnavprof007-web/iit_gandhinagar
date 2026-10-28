import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask anything about saving electricity, solar ROI, or Mission LiFE tips..."
        disabled={isLoading}
        className="w-full py-3 pl-4 pr-14 text-xs sm:text-sm bg-white rounded-2xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm placeholder-slate-400 disabled:bg-slate-50"
      />
      <button
        type="submit"
        disabled={!text.trim() || isLoading}
        className="absolute right-2 p-2 rounded-xl bg-emerald-600 text-white disabled:opacity-40 disabled:hover:bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
        aria-label="Send message"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </button>
    </form>
  );
};
