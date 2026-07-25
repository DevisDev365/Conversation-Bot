import React from 'react';
import { VoiceConfig } from '../types';
import { X, Settings, Gauge, ShieldCheck } from 'lucide-react';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: VoiceConfig;
  onChangeConfig: (newConfig: VoiceConfig) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#FDFBF7] border border-[#E6E2D3] rounded-[32px] shadow-2xl overflow-hidden text-[#2D2926]">
        {/* Header */}
        <div className="p-6 border-b border-[#E6E2D3] flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-[#D4A373] text-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#2D2926]">Audio Settings</h2>
              <p className="text-xs text-[#6B6658]">
                Adjust conversational speech cadence and rate speed
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Active Voice Info Card (Read-Only) */}
          <div className="p-4 rounded-2xl bg-white border border-[#E6E2D3] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[#9C9481] font-bold">
                Default Persona Voices
              </span>
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#E9EDC9] text-[#2D2926] font-bold border border-[#CCD5AE]">
                Locked Default
              </span>
            </div>
            <div className="text-xs text-[#2D2926] font-medium space-y-1">
              <p>🇮🇳 <span className="font-bold">Indian Persona:</span> Charon (Deep & Resonant)</p>
              <p>🇬🇧 <span className="font-bold">UK Persona:</span> Zephyr (Calm & Elegant)</p>
            </div>
          </div>

          {/* Speech Rate Speed Slider Only */}
          <div className="p-5 rounded-2xl bg-white border border-[#E6E2D3] space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#2D2926] uppercase tracking-wider flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#D4A373]" />
                <span>Speech Rate Speed</span>
              </label>
              <span className="text-sm font-serif font-bold text-[#D4A373] bg-[#F5F2E9] px-3 py-1 rounded-full border border-[#E6E2D3]">
                {config.speed}x
              </span>
            </div>

            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={config.speed}
              onChange={(e) =>
                onChangeConfig({ ...config, speed: parseFloat(e.target.value) })
              }
              className="w-full accent-[#D4A373] bg-[#E6E2D3] rounded-lg cursor-pointer h-2"
            />

            <div className="flex justify-between text-[10px] text-[#9C9481] font-semibold">
              <span>0.75x (Relaxed)</span>
              <span>1.0x (Normal)</span>
              <span>1.5x (Brisk)</span>
            </div>
          </div>

          {/* Auto Noise Cancellation Badge */}
          <div className="p-3.5 rounded-2xl bg-[#F5F2E9] border border-[#E6E2D3] flex items-center gap-2.5 text-xs text-[#6B6658]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Automatic microphone noise cancellation and echo suppression active</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E2D3] bg-[#F5F2E9] flex justify-end">
          <button
            onClick={onClose}
            className="py-3 px-6 rounded-full bg-[#2D2926] hover:bg-[#D4A373] text-white font-bold text-xs uppercase tracking-widest transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

