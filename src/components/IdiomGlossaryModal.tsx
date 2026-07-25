import React, { useState } from 'react';
import { DialectMode, IdiomItem } from '../types';
import { IDIOMS_LIST } from '../data/idioms';
import { X, Search, Sparkles, BookOpen, Volume2, ArrowRight } from 'lucide-react';

interface IdiomGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIdiomForVoice: (idiom: IdiomItem) => void;
}

export const IdiomGlossaryModal: React.FC<IdiomGlossaryModalProps> = ({
  isOpen,
  onClose,
  onSelectIdiomForVoice,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'indian' | 'uk'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredIdioms = IDIOMS_LIST.filter((item) => {
    const matchesTab = activeTab === 'all' || item.dialect === activeTab;
    const matchesQuery =
      item.phrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#FDFBF7] border border-[#E6E2D3] rounded-[32px] shadow-2xl flex flex-col overflow-hidden text-[#2D2926]">
        {/* Header */}
        <div className="p-6 border-b border-[#E6E2D3] flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-[#D4A373] text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2D2926]">
                Dialect Idioms Glossary
              </h2>
              <p className="text-xs text-[#6B6658]">
                Authentic Indian English & UK British regional expressions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full text-[#6B6658] hover:text-[#2D2926] bg-[#F5F2E9] hover:bg-[#E6E2D3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar: Tabs & Search */}
        <div className="p-6 pb-4 border-b border-[#E6E2D3] flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#F5F2E9]/60">
          {/* Dialect Filter Tabs */}
          <div className="flex items-center bg-[#F5F2E9] p-1 rounded-full border border-[#E6E2D3] w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'all'
                  ? 'bg-[#2D2926] text-white shadow-sm'
                  : 'text-[#6B6658] hover:text-[#2D2926]'
              }`}
            >
              All (20)
            </button>
            <button
              onClick={() => setActiveTab('indian')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'indian'
                  ? 'bg-[#2D2926] text-white shadow-sm'
                  : 'text-[#6B6658] hover:text-[#2D2926]'
              }`}
            >
              <span>🇮🇳</span> Indian
            </button>
            <button
              onClick={() => setActiveTab('uk')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'uk'
                  ? 'bg-[#2D2926] text-white shadow-sm'
                  : 'text-[#6B6658] hover:text-[#2D2926]'
              }`}
            >
              <span>🇬🇧</span> UK
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9481]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expressions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#E6E2D3] text-xs text-[#2D2926] placeholder-[#9C9481] focus:outline-none focus:border-[#D4A373]"
            />
          </div>
        </div>

        {/* Idiom Cards Scroll List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {filteredIdioms.length === 0 ? (
            <div className="text-center py-12 text-[#6B6658]">
              <p className="text-sm font-medium">No idioms found matching "{searchQuery}"</p>
            </div>
          ) : (
            filteredIdioms.map((item) => (
              <div
                key={item.id}
                className="group p-5 rounded-2xl bg-white border border-[#E6E2D3] hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {item.dialect === 'indian' ? '🇮🇳' : '🇬🇧'}
                    </span>
                    <h4 className="text-lg font-serif font-bold text-[#2D2926]">
                      "{item.phrase}"
                    </h4>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E9EDC9] text-[#2D2926] font-bold border border-[#CCD5AE]">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-xs text-[#2D2926] leading-relaxed">
                    <strong className="text-[#6B6658]">Meaning:</strong> {item.meaning}
                  </p>

                  <p className="text-xs italic text-[#6B6658]">
                    <strong className="not-italic text-[#9C9481]">Example:</strong> "{item.example}"
                  </p>
                </div>

                {/* Try In Studio Button */}
                <button
                  onClick={() => {
                    onSelectIdiomForVoice(item);
                    onClose();
                  }}
                  className="shrink-0 py-2.5 px-4 rounded-full bg-[#2D2926] hover:bg-[#D4A373] text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Practice Voice</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E6E2D3] bg-[#F5F2E9] text-center text-xs text-[#6B6658] font-medium">
          Showing {filteredIdioms.length} expressions curated for Neural Voice Dialogue
        </div>
      </div>
    </div>
  );
};
