import React from 'react';
import { DialectMode, ConversationState } from '../types';
import { Mic, Globe, BookOpen, Settings, Volume2, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  currentDialect: DialectMode;
  onSelectDialect: (dialect: DialectMode) => void;
  conversationState: ConversationState;
  onOpenGlossary: () => void;
  onOpenSettings: () => void;
  onGoHome: () => void;
  isInStudio: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDialect,
  onSelectDialect,
  conversationState,
  onOpenGlossary,
  onOpenSettings,
  onGoHome,
  isInStudio,
}) => {
  const getStatusBadge = () => {
    switch (conversationState) {
      case 'connected':
      case 'listening':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E9EDC9] text-[#2D2926] border border-[#CCD5AE]">
            <span className="w-2 h-2 rounded-full bg-[#588157] animate-pulse" />
            Live Connected
          </span>
        );
      case 'speaking':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D4A373]/20 text-[#2D2926] border border-[#D4A373]/40">
            <Volume2 className="w-3.5 h-3.5 text-[#D4A373] animate-bounce" />
            AI Speaking
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAEDCD] text-[#6B6658] border border-[#E6E2D3]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4A373]" />
            Connecting...
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            HTTP Fallback
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5F2E9] text-[#6B6658] border border-[#E6E2D3]">
            <span className="w-2 h-2 rounded-full bg-[#9C9481]" />
            Voice Ready
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E6E2D3] bg-[#FDFBF7]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-3.5 group text-left focus:outline-none"
        >
          <div className="w-11 h-11 rounded-full bg-[#D4A373] flex items-center justify-center shadow-sm group-hover:bg-[#2D2926] transition-colors duration-200">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-xl tracking-tight text-[#2D2926] group-hover:text-[#D4A373] transition-colors">
                Linguis.AI
              </span>
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#E9EDC9] text-[#2D2926] font-bold border border-[#CCD5AE]">
                Natural Voice
              </span>
            </div>
            <p className="text-[11px] text-[#6B6658] hidden sm:block tracking-wide">
              Dialect & Phrasal Conversational Engine
            </p>
          </div>
        </button>

        {/* Center: Mode Switcher (Visible in studio) */}
        {isInStudio && (
          <div className="hidden md:flex items-center bg-[#F5F2E9] p-1.5 rounded-full border border-[#E6E2D3]">
            <button
              onClick={() => onSelectDialect('indian')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                currentDialect === 'indian'
                  ? 'bg-[#2D2926] text-white shadow-sm'
                  : 'text-[#6B6658] hover:text-[#2D2926] hover:bg-[#E6E2D3]/50'
              }`}
            >
              <span>🇮🇳</span>
              <span>Indian English</span>
            </button>
            <button
              onClick={() => onSelectDialect('uk')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                currentDialect === 'uk'
                  ? 'bg-[#2D2926] text-white shadow-sm'
                  : 'text-[#6B6658] hover:text-[#2D2926] hover:bg-[#E6E2D3]/50'
              }`}
            >
              <span>🇬🇧</span>
              <span>UK English</span>
            </button>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isInStudio && getStatusBadge()}

          <button
            onClick={onOpenGlossary}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-[#2D2926] bg-[#F5F2E9] hover:bg-[#E6E2D3] border border-[#E6E2D3] transition-colors shadow-sm"
            title="Open Idioms & Phrases Glossary"
          >
            <BookOpen className="w-4 h-4 text-[#D4A373]" />
            <span className="hidden sm:inline">Glossary</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-full text-[#2D2926] bg-[#F5F2E9] hover:bg-[#E6E2D3] border border-[#E6E2D3] transition-colors shadow-sm"
            title="Voice Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
