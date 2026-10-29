'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import TopBar from '@/components/TopBar';
import ChatTranscript, { MessageItem } from '@/components/ChatTranscript';
import VoiceBar from '@/components/VoiceBar';
import PropertyCatalog from '@/components/PropertyCatalog';
import TourSchedulerModal from '@/components/TourSchedulerModal';
import ValuationModal from '@/components/ValuationModal';
import DiagnosticsDrawer from '@/components/DiagnosticsDrawer';
import { SupportedLanguageCode, SUPPORTED_LANGUAGES } from '@/lib/languages';
import { PropertyListing } from '@/lib/properties';

export default function HomePage() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguageCode>('am');
  const [activeSection, setActiveSection] = useState<'chat' | 'catalog'>('chat');
  const [isProcessing, setIsProcessing] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);

  // Modals and drawers
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isValuationOpen, setIsValuationOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [selectedPropertyForTour, setSelectedPropertyForTour] = useState<PropertyListing | null>(null);

  // Audio player reference
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeBlobUrlRef = useRef<string | null>(null);
  const playRequestIdRef = useRef<number>(0);

  const langConfig = SUPPORTED_LANGUAGES[currentLanguage];

  // Stop audio playback handler (declared first to avoid reference errors)
  const stopAudioPlayback = useCallback(() => {
    playRequestIdRef.current++;
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch {
        // Ignore normal pause interruption
      }
      currentAudioRef.current = null;
    }
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setActivePlayingId(null);
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudioPlayback();
    };
  }, [stopAudioPlayback]);

  // Initial welcome greeting state (deterministic timestamp avoids hydration mismatch)
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome-0',
      role: 'assistant',
      content: `${SUPPORTED_LANGUAGES.am.welcomeGreeting} ${SUPPORTED_LANGUAGES.am.welcomeSub}`,
      timestamp: 'Just now',
      provider: 'Sheger Prime Concierge',
    },
  ]);

  const handleLanguageChange = (newLang: SupportedLanguageCode) => {
    setCurrentLanguage(newLang);
    stopAudioPlayback();
    const config = SUPPORTED_LANGUAGES[newLang];
    const switchGreeting: MessageItem = {
      id: `lang-switch-${Date.now()}`,
      role: 'assistant',
      content: `${config.welcomeGreeting} ${config.welcomeSub}`,
      timestamp: 'Just now',
      provider: 'Sheger Prime Concierge',
    };
    setMessages((prev) => [...prev, switchGreeting]);
  };

  const playAudioForMessage = async (msg: MessageItem) => {
    stopAudioPlayback();
    const requestId = ++playRequestIdRef.current;
    setActivePlayingId(msg.id);
    setIsSpeaking(true);

    try {
      // 1. If audio is already cached on the message, play immediately
      if (msg.audioBase64 || (msg as any).audioUrl) {
        const audioSrc =
          (msg as any).audioUrl ||
          (msg.audioBase64!.startsWith('data:')
            ? msg.audioBase64!
            : `data:${msg.mimeType || 'audio/mpeg'};base64,${msg.audioBase64}`);
        const audio = new Audio(audioSrc);
        currentAudioRef.current = audio;

        audio.onended = () => {
          if (playRequestIdRef.current === requestId) {
            setIsSpeaking(false);
            setActivePlayingId(null);
          }
        };
        audio.onerror = () => {
          if (playRequestIdRef.current === requestId) {
            setIsSpeaking(false);
            setActivePlayingId(null);
          }
        };

        try {
          await audio.play();
        } catch (playErr: any) {
          if (playErr.name === 'AbortError') return;
          throw playErr;
        }
        return;
      }

      // 2. Direct Low-Latency Progressive Audio Stream (Addis Voices 2 Tewodros)
      const streamUrl = `/api/tts?text=${encodeURIComponent(msg.content)}&language=am&voice=am-tewodros&id=${encodeURIComponent(msg.id)}`;

      try {
        const streamAudio = new Audio(streamUrl);
        currentAudioRef.current = streamAudio;

        streamAudio.onended = () => {
          if (playRequestIdRef.current === requestId) {
            setIsSpeaking(false);
            setActivePlayingId(null);
          }
        };

        await new Promise<void>((resolve, reject) => {
          streamAudio.onplaying = () => {
            (msg as any).audioUrl = streamUrl;
            resolve();
          };
          streamAudio.onerror = (e) => {
            reject(e);
          };
          // Start stream playback immediately as first MP3 chunks arrive
          streamAudio.play().catch(reject);
        });

        return;
      } catch (streamErr: any) {
        if (streamErr?.name === 'AbortError') return;
        console.warn('Low-latency stream notice, using unary synthesis:', streamErr?.message || streamErr);
      }

      if (playRequestIdRef.current !== requestId) return;

      // 3. Fallback: Unary POST to /api/tts
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: msg.content,
          language: 'am',
          voice: 'am-tewodros',
        }),
      });

      if (playRequestIdRef.current !== requestId) return;
      if (!res.ok) throw new Error('TTS response error');

      const data = await res.json();
      if (playRequestIdRef.current !== requestId) return;

      if (data.audioBase64) {
        const mime = data.mimeType || 'audio/mpeg';
        msg.audioBase64 = data.audioBase64;
        msg.mimeType = mime;
        const audioSrc = data.audioBase64.startsWith('data:')
          ? data.audioBase64
          : `data:${mime};base64,${data.audioBase64}`;
        const audio = new Audio(data.audioUrl || audioSrc);
        currentAudioRef.current = audio;

        audio.onended = () => {
          if (playRequestIdRef.current === requestId) {
            setIsSpeaking(false);
            setActivePlayingId(null);
          }
        };
        audio.onerror = () => {
          if (playRequestIdRef.current === requestId) {
            setIsSpeaking(false);
            setActivePlayingId(null);
          }
        };
        await audio.play();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Audio playback status:', err?.message || err);
      }
      if (playRequestIdRef.current === requestId) {
        setIsSpeaking(false);
        setActivePlayingId(null);
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    // Stop existing audio before generating new reply
    stopAudioPlayback();

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      // Build conversation history for context
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history,
          language: currentLanguage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to receive reply');
      }

      const assistantMsg: MessageItem = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: data.provider === 'addis' ? 'Addis Assistant' : 'Gemini 3.8 Flash',
        matchedPropertyIds: data.matchedPropertyIds || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If spoken audio responses are enabled, play aloud automatically
      if (speakEnabled) {
        await playAudioForMessage(assistantMsg);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: MessageItem = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'ይቅርታ፣ ጥያቄዎን በማስተናገድ ላይ ጊዜያዊ ችግር አጋጥሟል። እባክዎ እንደገና ይሞክሩ። (A temporary error occurred. Please try again.)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectQuickPrompt = (query: string) => {
    handleSendMessage(query);
  };

  const handleOpenSchedulerWithProperty = (property: PropertyListing) => {
    setSelectedPropertyForTour(property);
    setIsSchedulerOpen(true);
  };

  const handleAskAboutProperty = (property: PropertyListing) => {
    setActiveSection('chat');
    const prompt =
      currentLanguage === 'am'
        ? `ስለ ${property.title_am} በ${property.neighborhood} የሚገኘውን አፓርታማ ዝርዝር መረጃ፣ የካርታ ሁኔታ እና የክፍያ አማራጮችን አስረዱኝ?`
        : `Tell me all the details about ${property.title} in ${property.neighborhood}, including title carte verification, generator backup, and pricing.`;
    handleSendMessage(prompt);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070B14] text-slate-100">
      {/* 3-Zone Compliant Top Navigation Bar */}
      <TopBar
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        onOpenScheduler={() => {
          setSelectedPropertyForTour(null);
          setIsSchedulerOpen(true);
        }}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onNavigateSection={(sec) => setActiveSection(sec)}
        activeSection={activeSection}
      />

      {/* Hero Concierge Strip */}
      <div className="border-b border-amber-500/15 bg-gradient-to-r from-[#0A0F1D] via-[#0E172E] to-[#0A0F1D] py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-200">
                Sheger Prime Voice Concierge Active
              </span>
              <span className="text-slate-400 hidden sm:inline">·</span>
              <span className="text-slate-400 hidden sm:inline">
                Addis Ababa Luxury Real Estate Advisory
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <button
              onClick={() => setIsValuationOpen(true)}
              className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <span>{langConfig.ui.requestValuation}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {activeSection === 'chat' ? (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Conversation Transcript */}
            <ChatTranscript
              messages={messages}
              currentLanguage={currentLanguage}
              onSelectQuickPrompt={handleSelectQuickPrompt}
              onPlayAudio={playAudioForMessage}
              onStopAudio={stopAudioPlayback}
              activePlayingId={activePlayingId}
              isProcessing={isProcessing}
              onOpenSchedulerWithProperty={handleOpenSchedulerWithProperty}
            />

            {/* Sticky Real-Time Voice & Text Control Bar */}
            <VoiceBar
              currentLanguage={currentLanguage}
              onSendMessage={handleSendMessage}
              isProcessing={isProcessing}
              speakEnabled={speakEnabled}
              onToggleSpeak={() => setSpeakEnabled(!speakEnabled)}
              isSpeaking={isSpeaking}
              onStopAudio={stopAudioPlayback}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <PropertyCatalog
              currentLanguage={currentLanguage}
              onAskAboutProperty={handleAskAboutProperty}
              onScheduleTour={handleOpenSchedulerWithProperty}
            />
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <TourSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        preSelectedProperty={selectedPropertyForTour}
        currentLanguage={currentLanguage}
      />

      <ValuationModal
        isOpen={isValuationOpen}
        onClose={() => setIsValuationOpen(false)}
        currentLanguage={currentLanguage}
      />

      <DiagnosticsDrawer
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}
