import React, { useState, useRef, useEffect } from 'react';
import { assistantService } from '../services/assistantService';
import { SUGGESTED_ASSISTANT_PROMPTS } from '../mocks/mockAssistantData';
import { ChatMessage } from '../components/assistant/ChatMessage';
import { ChatInput } from '../components/assistant/ChatInput';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { Bot, RotateCcw, Sparkles, MessageSquare } from 'lucide-react';

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState(() => assistantService.getChatHistory());
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    setIsLoading(true);
    // Optimistic UI updates from service
    const userMsg = {
      id: `msg_user_${Date.now()}`,
      sender: 'user' as const,
      text,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const reply = await assistantService.sendMessage(text);
      setMessages(assistantService.getChatHistory());
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    assistantService.clearChat();
    setMessages(assistantService.getChatHistory());
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Notice */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900">GreenPulse Smart Assistant</h2>
            <p className="text-[11px] text-slate-500">Mission LiFE Rule-Based Knowledge Engine (Frontend Demo)</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          Clear Chat
        </Button>
      </div>

      <Alert type="info">
        <strong>Demo Simulation Notice:</strong> This assistant demonstrates contextual responses and module deep-linking using a client-side rule responder. In a future phase, it can seamlessly bind to an LLM or FastAPI agent endpoint without altering the frontend UI.
      </Alert>

      {/* Chat Messages Scroll Container */}
      <Card className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col justify-between bg-white/90">
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 my-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-white border border-emerald-100 rounded-2xl shadow-sm inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </Card>

      {/* Suggested Prompts Pills */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium px-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Suggested queries:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          {SUGGESTED_ASSISTANT_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 transition-all text-left shadow-sm disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
};
