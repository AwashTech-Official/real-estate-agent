'use client';

import React, { useEffect, useRef } from 'react';
import { Volume2, Square, RotateCcw, Building2, Calendar, CheckCircle2, Bot, User } from 'lucide-react';
import { SupportedLanguageCode, SUPPORTED_LANGUAGES } from '@/lib/languages';
import { SHEGER_PROPERTIES, PropertyListing, formatPriceETB, formatPriceUSD } from '@/lib/properties';

export interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  provider?: string;
  audioBase64?: string | null;
  mimeType?: string;
  matchedPropertyIds?: string[];
  isError?: boolean;
}

interface ChatTranscriptProps {
  messages: MessageItem[];
  currentLanguage: SupportedLanguageCode;
  onSelectQuickPrompt: (query: string) => void;
  onPlayAudio: (msg: MessageItem) => void;
  onStopAudio: () => void;
  activePlayingId: string | null;
  isProcessing: boolean;
  onOpenSchedulerWithProperty?: (property: PropertyListing) => void;
}

export default function ChatTranscript({
  messages,
  currentLanguage,
  onSelectQuickPrompt,
  onPlayAudio,
  onStopAudio,
  activePlayingId,
  isProcessing,
  onOpenSchedulerWithProperty,
}: ChatTranscriptProps) {
  const langConfig = SUPPORTED_LANGUAGES[currentLanguage];
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-4xl mx-auto w-full"
    >
      {/* Welcome Card & Quick Prompts if thread has only 1 or 0 messages */}
      {messages.length <= 1 && (
        <div className="bg-gradient-to-b from-[#111A2E] to-[#0A0F1D] border border-amber-500/20 rounded-2xl p-5 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-start gap-3.5">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 shrink-0">
              <Building2 className="w-5 h-5" />
            </span>
            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                {langConfig.welcomeGreeting}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {langConfig.welcomeSub}
              </p>
            </div>
          </div>

          {/* Quick Prompts List */}
          <div className="pt-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-amber-400/90 mb-2 block">
              የተጠቆሙ ጥያቄዎች (Suggested Inquiries)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {langConfig.quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectQuickPrompt(item.query)}
                  className="text-left text-xs p-3 rounded-xl border border-slate-700/80 bg-slate-800/40 hover:bg-slate-800/90 hover:border-amber-500/40 text-slate-200 transition-all flex items-start gap-2 group"
                >
                  <span className="text-amber-400 font-medium group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                  <span className="line-clamp-2">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Message Thread */}
      {messages.map((msg) => {
        const isAssistant = msg.role === 'assistant';
        const isPlaying = activePlayingId === msg.id;

        // Resolve matched property objects
        const matchedProperties = (msg.matchedPropertyIds || [])
          .map((id) => SHEGER_PROPERTIES.find((p) => p.id === id))
          .filter(Boolean) as PropertyListing[];

        return (
          <div
            key={msg.id}
            className={`flex gap-3 sm:gap-4 ${
              isAssistant ? 'items-start' : 'items-start flex-row-reverse'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                isAssistant
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-sm shadow-amber-500/20'
                  : 'bg-slate-700 text-slate-200 border border-slate-600'
              }`}
            >
              {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>

            {/* Bubble Body */}
            <div
              className={`max-w-[85%] sm:max-w-[78%] space-y-2.5 ${
                isAssistant ? 'text-left' : 'text-right'
              }`}
            >
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isAssistant
                    ? msg.isError
                      ? 'bg-rose-950/40 border border-rose-500/40 text-rose-200'
                      : 'bg-[#121B30] border border-slate-700/70 text-slate-100 shadow-md'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium shadow-md shadow-amber-500/10'
                }`}
              >
                {/* Paragraphs */}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Assistant Controls (Listen/Replay, Provider info) */}
                {isAssistant && !msg.isError && (
                  <div className="pt-3 mt-2 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      {isPlaying ? (
                        <button
                          onClick={onStopAudio}
                          className="flex items-center gap-1 text-amber-300 font-semibold hover:text-white px-2 py-1 rounded bg-amber-500/15 border border-amber-500/30 transition-colors"
                        >
                          <Square className="w-3 h-3 fill-current" />
                          <span>{langConfig.ui.stopAudio}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onPlayAudio(msg)}
                          className="flex items-center gap-1 text-slate-300 hover:text-amber-300 font-medium px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
                        >
                          <Volume2 className="w-3 h-3 text-amber-400" />
                          <span>{langConfig.ui.replay}</span>
                        </button>
                      )}

                      {/* Speaking Pulse */}
                      {isPlaying && (
                        <span className="flex items-center gap-1 text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          <span className="text-[10px]">{langConfig.ui.speaking}</span>
                        </span>
                      )}
                    </div>

                    {/* Clean Message Timestamp */}
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                      <span suppressHydrationWarning className="font-mono tabular-nums">{msg.timestamp}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Matched Property Cards (if referenced in assistant reply) */}
              {isAssistant && matchedProperties.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 block">
                    Referenced Residences ({matchedProperties.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {matchedProperties.map((prop) => (
                      <div
                        key={prop.id}
                        className="bg-[#0D1527] border border-amber-500/20 rounded-xl overflow-hidden shadow-lg p-3 space-y-2 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-amber-400 font-medium mb-1">
                            <span>{prop.neighborhood}</span>
                            <span className="text-slate-400">{prop.propertyType}</span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-1">
                            {prop.title}
                          </h4>
                          <div className="text-xs font-mono font-semibold text-amber-300 mt-1 tabular-nums">
                            {formatPriceETB(prop.price_etb)}{' '}
                            <span className="text-slate-400 font-normal">
                              ({formatPriceUSD(prop.price_usd)})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{prop.carte_status}</span>
                          </div>
                        </div>

                        {onOpenSchedulerWithProperty && (
                          <button
                            onClick={() => onOpenSchedulerWithProperty(prop)}
                            className="w-full mt-2 py-1.5 px-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{langConfig.ui.scheduleViewing}</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Processing State Bubble */}
      {isProcessing && (
        <div className="flex gap-3 sm:gap-4 items-start">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0 shadow-sm shadow-amber-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div className="p-3.5 rounded-2xl bg-[#121B30] border border-slate-700/70 text-slate-300 text-xs flex items-center gap-2 shadow-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{langConfig.ui.processing}</span>
          </div>
        </div>
      )}
    </div>
  );
}
