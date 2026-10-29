import React from 'react';
import Link from 'next/link';
import { Building2, Calendar } from 'lucide-react';
import { SupportedLanguageCode, SUPPORTED_LANGUAGES } from '@/lib/languages';

interface TopBarProps {
  currentLanguage: SupportedLanguageCode;
  onLanguageChange: (lang: SupportedLanguageCode) => void;
  onOpenScheduler: () => void;
  onOpenDiagnostics: () => void;
  onNavigateSection: (section: 'chat' | 'catalog') => void;
  activeSection: 'chat' | 'catalog';
}

export default function TopBar({
  currentLanguage,
  onLanguageChange,
  onOpenScheduler,
  onOpenDiagnostics,
  onNavigateSection,
  activeSection,
}: TopBarProps) {
  const langConfig = SUPPORTED_LANGUAGES[currentLanguage];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/15 bg-[#0A0F1D]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark (Single text element with monogram, whitespace-nowrap) */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-base sm:text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#0A0F1D] font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-4 h-4" />
          </span>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-slate-100 group-hover:text-amber-300 transition-colors">
              SHEGER PRIME
            </span>
          </div>
        </Link>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigateSection('chat')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'chat'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {langConfig.ui.voiceAgent}
          </button>
          <button
            onClick={() => onNavigateSection('catalog')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'catalog'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {langConfig.ui.exploreProperties}
          </button>
          <button
            onClick={onOpenScheduler}
            className="text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            {langConfig.ui.scheduleViewing}
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenScheduler}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg hover:from-amber-300 hover:to-amber-400 transition-all shadow-sm shadow-amber-500/20 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>{langConfig.ui.scheduleViewing}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
