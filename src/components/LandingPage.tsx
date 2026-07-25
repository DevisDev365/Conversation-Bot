import React from 'react';
import { DialectMode } from '../types';
import { PERSONAS } from '../data/idioms';
import { Mic, Sparkles, Volume2, ArrowRight, Zap, Globe2, ShieldCheck, Heart } from 'lucide-react';

interface LandingPageProps {
  onStartConversation: (dialect: DialectMode) => void;
  onOpenGlossary: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartConversation,
  onOpenGlossary,
}) => {
  const indianPersona = PERSONAS.indian;
  const ukPersona = PERSONAS.uk;

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden bg-[#FDFBF7] text-[#2D2926]">
      {/* Background Subtle Warm Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#E9EDC9]/30 via-[#D4A373]/10 to-[#CCD5AE]/30 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-10 pb-16 relative z-10 w-full flex-1 flex flex-col justify-center">
        {/* Hero Top Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5F2E9] border border-[#E6E2D3] text-[#2D2926] text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>Real-time Voice AI Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif mb-4 italic text-[#2D2926] leading-tight">
            Choose your persona.
          </h1>

          <p className="text-[#6B6658] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Experience hyper-realistic voice interaction with distinct regional dialects, authentic cultural idioms, and native phrasal structures.
          </p>
        </div>

        {/* 2 Primary Dialect Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full mb-16">
          {/* UK English Card */}
          <div className="group relative bg-white border border-[#E6E2D3] rounded-[40px] p-8 sm:p-10 cursor-pointer hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center justify-between">
            <div className="w-full flex flex-col items-center">
              <div className="w-24 h-24 mb-6 bg-[#CCD5AE]/60 rounded-full flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                <span className="text-4xl">🇬🇧</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-widest text-[#9C9481] font-bold">UK Persona</span>
              </div>

              <h2 className="text-3xl font-serif text-[#2D2926] mb-3">The Londoner</h2>

              <p className="text-[#6B6658] text-sm mb-6 leading-relaxed italic bg-[#F5F2E9]/60 p-4 rounded-2xl border border-[#E6E2D3]/60 w-full">
                "{ukPersona.samplePhrases[0]}"
              </p>

              {/* Key Features Bullet List */}
              <ul className="text-xs uppercase tracking-widest text-[#9C9481] font-semibold space-y-2 mb-8 text-center">
                <li className="flex items-center justify-center gap-1.5">• British UK Idioms & Slang</li>
                <li className="flex items-center justify-center gap-1.5">• Authentic Spelling & Vocabulary</li>
                <li className="flex items-center justify-center gap-1.5">• Received Pronunciation Voice</li>
              </ul>
            </div>

            <button
              onClick={() => onStartConversation('uk')}
              className="w-full py-4 bg-[#2D2926] text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#D4A373] transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span>Select UK Voice 🇬🇧</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Indian English Card */}
          <div className="group relative bg-white border border-[#E6E2D3] rounded-[40px] p-8 sm:p-10 cursor-pointer hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center justify-between">
            <div className="w-full flex flex-col items-center">
              <div className="w-24 h-24 mb-6 bg-[#E9EDC9] rounded-full flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                <span className="text-4xl">🇮🇳</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-widest text-[#9C9481] font-bold">Desi Persona</span>
              </div>

              <h2 className="text-3xl font-serif text-[#2D2926] mb-3">The Mumbaikar</h2>

              <p className="text-[#6B6658] text-sm mb-6 leading-relaxed italic bg-[#F5F2E9]/60 p-4 rounded-2xl border border-[#E6E2D3]/60 w-full">
                "{indianPersona.samplePhrases[0]}"
              </p>

              {/* Key Features Bullet List */}
              <ul className="text-xs uppercase tracking-widest text-[#9C9481] font-semibold space-y-2 mb-8 text-center">
                <li className="flex items-center justify-center gap-1.5">• Indian Dialects & Phrasal Verbs</li>
                <li className="flex items-center justify-center gap-1.5">• Conversational Desi Phrases</li>
                <li className="flex items-center justify-center gap-1.5">• Polite & Warm Indian Tone</li>
              </ul>
            </div>

            <button
              onClick={() => onStartConversation('indian')}
              className="w-full py-4 bg-[#2D2926] text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#D4A373] transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span>Select Indian Voice 🇮🇳</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visualizer Footer Bar */}
        <div className="bg-[#F5F2E9] border border-[#E6E2D3] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-4xl mx-auto w-full shadow-sm">
          <div className="flex gap-1.5 items-end h-10">
            <div className="w-1.5 h-4 bg-[#D4A373] rounded-full opacity-40"></div>
            <div className="w-1.5 h-7 bg-[#D4A373] rounded-full opacity-60"></div>
            <div className="w-1.5 h-10 bg-[#D4A373] rounded-full"></div>
            <div className="w-1.5 h-6 bg-[#D4A373] rounded-full opacity-50"></div>
            <div className="w-1.5 h-8 bg-[#D4A373] rounded-full opacity-80"></div>
            <div className="w-1.5 h-5 bg-[#D4A373] rounded-full opacity-30"></div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={onOpenGlossary}
              className="text-xs uppercase tracking-widest font-bold text-[#D4A373] hover:text-[#2D2926] underline transition-colors"
            >
              Explore 20+ Regional Idioms →
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#9C9481] font-bold">Neural Engine</p>
              <p className="text-xs font-semibold text-[#2D2926]">Low-Latency Audio Ready</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
