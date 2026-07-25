import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  DialectMode,
  ConversationState,
  VoiceConfig,
  IdiomItem,
} from '../types';
import { PERSONAS } from '../data/idioms';
import { LiveAudioEngine } from '../lib/audio-live';
import { AudioVisualizer } from './AudioVisualizer';
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Radio,
} from 'lucide-react';

interface VoiceStudioProps {
  dialect: DialectMode;
  onSwitchDialect: (newDialect: DialectMode) => void;
  voiceConfig: VoiceConfig;
  onOpenGlossary: () => void;
  injectedIdiomPrompt?: IdiomItem | null;
  onClearInjectedIdiom?: () => void;
}

export const VoiceStudio: React.FC<VoiceStudioProps> = ({
  dialect,
  onSwitchDialect,
  voiceConfig,
  onOpenGlossary,
  injectedIdiomPrompt,
  onClearInjectedIdiom,
}) => {
  const persona = PERSONAS[dialect];

  const [conversationState, setConversationState] =
    useState<ConversationState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Engine Initialization Loading Modal State
  const [isInitializing, setIsInitializing] = useState(true);
  const [initStep, setInitStep] = useState(1);

  const wsRef = useRef<WebSocket | null>(null);
  const audioEngineRef = useRef<LiveAudioEngine | null>(null);

  // Handle Voice Engine Warm-Up Progress Sequence
  useEffect(() => {
    setIsInitializing(true);
    setInitStep(1);

    // Fallback safety timeout if AI response is delayed
    const safetyTimer = setTimeout(() => {
      setIsInitializing(false);
    }, 12000);

    return () => clearTimeout(safetyTimer);
  }, [dialect, voiceConfig.voiceName]);

  // Connect WebSocket & Audio Engine
  const startVoiceSession = useCallback(async () => {
    setConversationState('connecting');

    // Initialize Audio Engine
    if (!audioEngineRef.current) {
      audioEngineRef.current = new LiveAudioEngine();
    }
    const audioEngine = audioEngineRef.current;

    audioEngine.setVolumeCallback((vol, speaking) => {
      setMicVolume(vol);
      setIsAiSpeaking(speaking);
      if (speaking) {
        setConversationState('speaking');
      }
    });

    // Determine WebSocket protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to Live Voice Server');
        setInitStep(2);
        ws.send(
          JSON.stringify({
            type: 'init',
            dialect,
            voiceName: voiceConfig.voiceName,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'status' && msg.status === 'connected') {
            setConversationState('connected');
            setInitStep(3);
            audioEngine.startRecording((pcm16Base64) => {
              if (
                wsRef.current &&
                wsRef.current.readyState === WebSocket.OPEN &&
                !isMuted
              ) {
                wsRef.current.send(
                  JSON.stringify({
                    type: 'audio',
                    audio: pcm16Base64,
                  })
                );
              }
            });
          } else if (msg.type === 'audio' && msg.audio) {
            audioEngine.playAudioChunk(msg.audio);
            setConversationState('speaking');
            setInitStep(4);
            setIsInitializing(false); // Modal dismisses right as AI starts speaking
          } else if (msg.type === 'transcript' && msg.text) {
            if (msg.sender === 'ai') {
              setInitStep(4);
              setIsInitializing(false);
            }
          } else if (msg.type === 'interrupted') {
            audioEngine.interrupt();
            setConversationState('listening');
          } else if (msg.type === 'turn_complete') {
            setConversationState('listening');
          } else if (msg.type === 'error') {
            console.warn('Live WS error, relying on HTTP voice fallback');
            triggerHttpGreetingFallback();
          }
        } catch (err) {
          console.error('Error handling WS message:', err);
        }
      };

      ws.onerror = () => {
        console.warn('WebSocket live voice connection unready, active HTTP voice fallback mode enabled.');
        triggerHttpGreetingFallback();
      };

      ws.onclose = () => {
        setConversationState('listening');
      };
    } catch (e) {
      console.warn('Failed to create WebSocket, relying on HTTP voice fallback:', e);
      triggerHttpGreetingFallback();
    }
  }, [dialect, voiceConfig.voiceName, isMuted]);

  // Trigger initial greeting via HTTP fallback
  const triggerHttpGreetingFallback = async () => {
    setInitStep(3);
    setConversationState('connecting');
    try {
      const res = await fetch('/api/chat-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt:
            dialect === 'indian'
              ? 'Hello! Please greet me warmly in your charismatic urban Indian English voice in 1 short sentence.'
              : 'Hello! Please greet me warmly in your charming British voice in 1 short sentence.',
          dialect,
          voiceName: voiceConfig.voiceName,
        }),
      });

      const data = await res.json();
      if (data.text) {
        if (data.audio && audioEngineRef.current) {
          audioEngineRef.current.playAudioChunk(data.audio);
        }
      }
      setInitStep(4);
      setIsInitializing(false);
      setConversationState('listening');
    } catch (err) {
      console.error('HTTP greeting fallback error:', err);
      setIsInitializing(false);
      setConversationState('listening');
    }
  };

  // Clean up on unmount or dialect change
  useEffect(() => {
    startVoiceSession();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (audioEngineRef.current) {
        audioEngineRef.current.cleanup();
        audioEngineRef.current = null;
      }
    };
  }, [dialect, voiceConfig.voiceName]);

  // Trigger Spoken Voice Dialogue Turn
  const triggerVoicePrompt = async (prompt: string) => {
    if (!prompt.trim()) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text', text: prompt }));
      setConversationState('speaking');
    } else {
      // HTTP Voice Fallback
      setConversationState('connecting');
      try {
        const res = await fetch('/api/chat-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            dialect,
            voiceName: voiceConfig.voiceName,
          }),
        });

        const data = await res.json();
        if (data.text) {
          if (data.audio && audioEngineRef.current) {
            audioEngineRef.current.playAudioChunk(data.audio);
          }
        }
        setConversationState('listening');
      } catch (err) {
        console.error('HTTP fallback error:', err);
        setConversationState('error');
      }
    }
  };

  // Handle Injected Idiom Practice from Glossary Modal
  useEffect(() => {
    if (injectedIdiomPrompt) {
      triggerVoicePrompt(
        `Can you use the expression "${injectedIdiomPrompt.phrase}" in a natural sentence and explain it to me?`
      );
      if (onClearInjectedIdiom) onClearInjectedIdiom();
    }
  }, [injectedIdiomPrompt]);

  // Handle Interrupting AI
  const handleInterrupt = () => {
    if (audioEngineRef.current) {
      audioEngineRef.current.interrupt();
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text', text: '[Interrupt]' }));
    }
    setConversationState('listening');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 relative">
      {/* Voice Engine Initialization Overlay Modal */}
      {isInitializing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#FDFBF7] border border-[#E6E2D3] rounded-[32px] p-8 shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#E9EDC9] border border-[#CCD5AE] flex items-center justify-center relative shadow-inner">
              <Radio className="w-8 h-8 text-[#2D2926] animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-[#D4A373] animate-ping opacity-20" />
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-[#F5F2E9] text-[#2D2926] font-bold border border-[#E6E2D3]">
                AI Voice Connection
              </span>
              <h3 className="text-2xl font-serif font-bold text-[#2D2926] mt-3">
                Connecting Voice Engine
              </h3>
              <p className="text-xs text-[#6B6658] mt-1">
                Preparing real-time voice stream for {persona.name}...
              </p>
            </div>

            {/* Initialization Steps List */}
            <div className="bg-white p-4 rounded-2xl border border-[#E6E2D3] text-left space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#2D2926] font-medium flex items-center gap-2">
                  {initStep >= 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#D4A373]" />
                  )}
                  Connecting Audio & WebSocket Stream
                </span>
                <span className="text-[10px] font-bold text-[#9C9481]">
                  {initStep >= 1 ? 'Ready' : 'Connecting'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#2D2926] font-medium flex items-center gap-2">
                  {initStep >= 2 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#D4A373]" />
                  )}
                  Loading {dialect === 'indian' ? 'Indian' : 'UK'} Dialect Model ({voiceConfig.voiceName})
                </span>
                <span className="text-[10px] font-bold text-[#9C9481]">
                  {initStep >= 2 ? 'Ready' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#2D2926] font-medium flex items-center gap-2">
                  {initStep >= 3 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#D4A373]" />
                  )}
                  AI Companion is preparing initial greeting...
                </span>
                <span className="text-[10px] font-bold text-[#9C9481]">
                  {initStep >= 3 ? 'Speaking...' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#E6E2D3] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#2D2926] h-full transition-all duration-500"
                style={{ width: `${(initStep / 3) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#6B6658] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Modal will auto-dismiss when AI starts speaking</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar: Active Persona Header */}
      <div className="p-6 rounded-[32px] bg-white border border-[#E6E2D3] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div
            className={`w-16 h-16 rounded-full ${
              dialect === 'indian' ? 'bg-[#E9EDC9]' : 'bg-[#CCD5AE]'
            } flex items-center justify-center text-3xl shrink-0 shadow-inner`}
          >
            {persona.flag}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h2 className="text-2xl font-serif font-bold text-[#2D2926]">
                {persona.name}
              </h2>
              <span className="text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#F5F2E9] text-[#6B6658] font-bold border border-[#E6E2D3]">
                Voice: {voiceConfig.voiceName}
              </span>
            </div>
            <p className="text-xs text-[#6B6658] mt-1 max-w-lg leading-relaxed">
              {persona.description}
            </p>
          </div>
        </div>

        {/* Dialect Quick Toggle & Glossary Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenGlossary}
            className="px-4 py-2 rounded-full bg-[#F5F2E9] text-xs font-bold text-[#2D2926] hover:bg-[#E6E2D3] border border-[#E6E2D3] transition-colors flex items-center gap-2 uppercase tracking-wider shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#D4A373]" />
            <span>Idioms Glossary</span>
          </button>

          <div className="flex items-center gap-2 p-1.5 bg-[#F5F2E9] rounded-full border border-[#E6E2D3]">
            <button
              onClick={() => onSwitchDialect('indian')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                dialect === 'indian'
                  ? 'bg-[#2D2926] text-white shadow-sm'
                  : 'text-[#6B6658] hover:text-[#2D2926]'
              }`}
            >
              <span>🇮🇳 Indian Voice</span>
            </button>
            <button
              onClick={() => onSwitchDialect('uk')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                dialect === 'uk'
                  ? 'bg-[#2D2926] text-white shadow-sm'
                  : 'text-[#6B6658] hover:text-[#2D2926]'
              }`}
            >
              <span>🇬🇧 UK Voice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Area (Purely Centered Voice Experience) */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Audio Visualizer & Central Voice Orb */}
        <div className="space-y-6">
          <div className="p-8 rounded-[32px] bg-white border border-[#E6E2D3] shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden">
            {/* Background Warm Glow Ring */}
            <div
              className={`absolute w-64 h-64 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${
                isAiSpeaking
                  ? 'opacity-20 bg-[#D4A373]'
                  : 'opacity-15 bg-[#CCD5AE]'
              }`}
            />

            <div className="relative z-10 w-full space-y-6">
              {/* Central Voice Pulse Orb */}
              <div className="relative flex items-center justify-center my-4">
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isAiSpeaking
                      ? 'bg-[#D4A373] text-white scale-110 shadow-[#D4A373]/30'
                      : micVolume > 0.1
                      ? 'bg-[#CCD5AE] text-[#2D2926] scale-105 animate-pulse'
                      : 'bg-[#F5F2E9] border border-[#E6E2D3] text-[#6B6658]'
                  }`}
                >
                  <Mic
                    className={`w-12 h-12 transition-colors ${
                      isAiSpeaking
                        ? 'text-white animate-bounce'
                        : micVolume > 0.1
                        ? 'text-[#2D2926]'
                        : 'text-[#9C9481]'
                    }`}
                  />
                </div>
              </div>

              {/* Status Indicator Text */}
              <div>
                <p className="text-base font-serif font-bold text-[#2D2926]">
                  {isAiSpeaking
                    ? `${persona.name} is speaking...`
                    : isMuted
                    ? 'Microphone Muted'
                    : 'Listening to your voice...'}
                </p>
                <p className="text-xs text-[#6B6658] mt-1 tracking-wide">
                  Speak naturally in {dialect === 'indian' ? 'Indian' : 'UK'} English
                </p>
              </div>

              {/* Real-Time Waveform Visualizer */}
              <AudioVisualizer
                volume={micVolume}
                isAiSpeaking={isAiSpeaking}
                isListening={!isMuted && !isAiSpeaking}
                dialect={dialect}
              />

              {/* Interactive Control Deck */}
              <div className="flex items-center justify-center gap-3 pt-2">
                {/* Mute/Unmute Mic Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 border transition-all shadow-sm ${
                    isMuted
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-[#F5F2E9] text-[#2D2926] border-[#E6E2D3] hover:bg-[#E6E2D3]'
                  }`}
                  title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {isMuted ? (
                    <>
                      <MicOff className="w-4 h-4 text-rose-600" />
                      <span>Unmute</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-[#D4A373]" />
                      <span>Mic Active</span>
                    </>
                  )}
                </button>

                {/* Interrupt AI Button */}
                <button
                  onClick={handleInterrupt}
                  disabled={!isAiSpeaking}
                  className={`px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 border transition-all ${
                    isAiSpeaking
                      ? 'bg-[#2D2926] text-white border-[#2D2926] hover:bg-[#D4A373] shadow-md cursor-pointer'
                      : 'bg-[#F5F2E9] text-[#9C9481] border-[#E6E2D3] cursor-not-allowed opacity-60'
                  }`}
                  title="Interrupt AI speech"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Interrupt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
