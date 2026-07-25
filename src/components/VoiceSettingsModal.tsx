import React from 'react';
import { VoiceConfig, VoiceName } from '../types';
import { X, Settings, Mic, Volume2, Check } from 'lucide-react';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: VoiceConfig;
  onChangeConfig: (newConfig: VoiceConfig) => void;
}

const VOICES: { name: VoiceName; label: string; gender: 'female' | 'male'; desc: string }[] = [
  { name: 'Kore', label: 'Kore (Warm & Friendly)', gender: 'female', desc: 'Recommended default for Indian English persona' },
  { name: 'Zephyr', label: 'Zephyr (Calm & Elegant)', gender: 'female', desc: 'Recommended default for UK British persona' },
  { name: 'Puck', label: 'Puck (Lively & Energetic)', gender: 'male', desc: 'Dynamic male voice with expressive pitch' },
  { name: 'Charon', label: 'Charon (Deep & Resonant)', gender: 'male', desc: 'Rich, smooth male voice tone' },
  { name: 'Fenrir', label: 'Fenrir (Strong & Confident)', gender: 'male', desc: 'Clear, authoritative male voice' },
];

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FDFBF7] border border-[#E6E2D3] rounded-[32px] shadow-2xl overflow-hidden text-[#2D2926]">
        {/* Header */}
        <div className="p-6 border-b border-[#E6E2D3] flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-[#D4A373] text-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2D2926]">Voice Settings</h2>
              <p className="text-xs text-[#6B6658]">
                Customize AI voice synthesis character & speech preferences
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
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Voice Character Selection */}
          <div>
            <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-3">
              AI Voice Persona Character:
            </label>
            <div className="space-y-2.5">
              {VOICES.map((v) => {
                const isSelected = config.voiceName === v.name;
                return (
                  <button
                    key={v.name}
                    onClick={() =>
                      onChangeConfig({
                        ...config,
                        voiceName: v.name,
                        gender: v.gender,
                      })
                    }
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#F5F2E9] border-[#D4A373] shadow-sm'
                        : 'bg-white border-[#E6E2D3] hover:border-[#CCD5AE]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-serif font-bold text-[#2D2926]">
                          {v.label}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E9EDC9] text-[#2D2926] font-bold border border-[#CCD5AE]">
                          {v.gender}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B6658] mt-1">{v.desc}</p>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#2D2926] flex items-center justify-center text-white shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Speech Speed Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-[#2D2926] uppercase tracking-wider">
                Speech Rate Speed:
              </label>
              <span className="text-xs font-bold text-[#D4A373]">
                {config.speed}x
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={config.speed}
              onChange={(e) =>
                onChangeConfig({ ...config, speed: parseFloat(e.target.value) })
              }
              className="w-full accent-[#D4A373] bg-[#E6E2D3] rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[10px] text-[#9C9481] mt-1 font-semibold">
              <span>0.8x (Relaxed)</span>
              <span>1.0x (Normal)</span>
              <span>1.3x (Brisk)</span>
            </div>
          </div>

          {/* Mic Info */}
          <div className="p-4 rounded-2xl bg-[#F5F2E9] border border-[#E6E2D3] flex items-center gap-3">
            <Mic className="w-5 h-5 text-[#D4A373] shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-[#2D2926]">Microphone Optimization</p>
              <p className="text-[#6B6658]">Auto noise suppression & echo cancellation enabled</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E2D3] bg-[#F5F2E9] flex justify-end">
          <button
            onClick={onClose}
            className="py-3 px-6 rounded-full bg-[#2D2926] hover:bg-[#D4A373] text-white font-bold text-xs uppercase tracking-widest transition-colors shadow-sm"
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
