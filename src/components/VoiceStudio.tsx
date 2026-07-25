import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  DialectMode,
  ConversationState,
  TranscriptItem,
  VoiceConfig,
  IdiomItem,
} from '../types';
import { PERSONAS, detectIdiomsInText } from '../data/idioms';
import { LiveAudioEngine } from '../lib/audio-live';
import { AudioVisualizer } from './AudioVisualizer';
import {
  Mic,
  MicOff,
  Square,
  Volume2,
  Sparkles,
  RefreshCw,
  Send,
  Trash2,
  Info,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  Lightbulb,
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
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [activeTooltipIdiom, setActiveTooltipIdiom] = useState<string | null>(
    null
  );

  const wsRef = useRef<WebSocket | null>(null);
  const audioEngineRef = useRef<LiveAudioEngine | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll transcript to bottom
  const scrollToBottom = () => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [transcripts]);

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
        // Send init message
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
            // Start recording mic audio
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
          } else if (msg.type === 'transcript' && msg.text) {
            const detected = detectIdiomsInText(msg.text, dialect);
            setTranscripts((prev) => [
              ...prev,
              {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
                sender: msg.sender || 'ai',
                text: msg.text,
                timestamp: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                dialect,
                detectedIdioms: detected,
              },
            ]);
          } else if (msg.type === 'interrupted') {
            audioEngine.interrupt();
            setConversationState('listening');
          } else if (msg.type === 'turn_complete') {
            setConversationState('listening');
          } else if (msg.type === 'error') {
            console.warn('Live WS error, relying on HTTP voice fallback');
            setConversationState('listening');
          }
        } catch (err) {
          console.error('Error handling WS message:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket live voice connection unready, active HTTP voice fallback mode enabled.');
        setConversationState('listening');
      };

      ws.onclose = () => {
        setConversationState('listening');
      };
    } catch (e) {
      console.warn('Failed to create WebSocket, relying on HTTP voice fallback:', e);
      setConversationState('listening');
    }
  }, [dialect, voiceConfig.voiceName, isMuted]);

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

  // Handle Injected Idiom Practice from Glossary Modal
  useEffect(() => {
    if (injectedIdiomPrompt) {
      handleSendTextMessage(
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

  // Send Text Input Message (or Fallback HTTP if WebSocket disconnected)
  const handleSendTextMessage = async (textToSend?: string) => {
    const prompt = textToSend || textInput;
    if (!prompt.trim()) return;

    // Add user turn to transcript
    const userItem: TranscriptItem = {
      id: Date.now().toString(),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      dialect,
    };
    setTranscripts((prev) => [...prev, userItem]);
    setTextInput('');

    // If WebSocket is open, send text
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text', text: prompt }));
      setConversationState('speaking');
    } else {
      // HTTP Fallback
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
          const detected = detectIdiomsInText(data.text, dialect);
          setTranscripts((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: 'ai',
              text: data.text,
              timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              dialect,
              detectedIdioms: detected,
            },
          ]);

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

  const quickPrompts =
    dialect === 'indian'
      ? [
          'What is your good name and where did you pass out from?',
          'Do one thing, explain how to prepone an important meeting.',
          'Tell me about your favorite time-pass activity!',
          'Can you kindly revert back regarding doing the needful?',
        ]
      : [
          'Right then, fancy a quick spot of tea?',
          'Tell me why you are proper chuffed to bits today!',
          'Is charging 5 quid for coffee taking the biscuit?',
          'How was your weekend? Everything sorted now?',
        ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
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

        {/* Dialect Quick Toggle Pill */}
        <div className="flex items-center gap-2 p-1.5 bg-[#F5F2E9] rounded-full border border-[#E6E2D3]">
          <button
            onClick={() => onSwitchDialect('indian')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              dialect === 'indian'
                ? 'bg-[#2D2926] text-white shadow-sm'
                : 'text-[#6B6658] hover:text-[#2D2926]'
            }`}
          >
            <span>🇮🇳 Indian</span>
          </button>
          <button
            onClick={() => onSwitchDialect('uk')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              dialect === 'uk'
                ? 'bg-[#2D2926] text-white shadow-sm'
                : 'text-[#6B6658] hover:text-[#2D2926]'
            }`}
          >
            <span>🇬🇧 UK</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left Live Voice Deck, Right Transcript */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Audio Visualizer & Central Voice Orb */}
        <div className="lg:col-span-5 space-y-6">
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
                    ? `${persona.name.split(' ')[0]} is speaking...`
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

          {/* Quick Dialect Prompts */}
          <div className="p-6 rounded-[32px] bg-white border border-[#E6E2D3] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2D2926] uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-[#D4A373]" />
              <span>Suggested Starter Prompts:</span>
            </div>

            <div className="space-y-2">
              {quickPrompts.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendTextMessage(promptText)}
                  className="w-full p-3.5 rounded-2xl bg-[#F5F2E9]/70 hover:bg-[#E6E2D3]/60 border border-[#E6E2D3] text-xs text-left text-[#2D2926] transition-all flex items-center justify-between group font-medium"
                >
                  <span>"{promptText}"</span>
                  <ChevronRight className="w-4 h-4 text-[#9C9481] group-hover:text-[#2D2926] group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Live Conversation Transcript */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-[32px] bg-white border border-[#E6E2D3] shadow-sm flex flex-col h-[600px]">
            {/* Transcript Top Bar */}
            <div className="pb-4 border-b border-[#E6E2D3] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#D4A373]" />
                <h3 className="text-base font-serif font-bold text-[#2D2926]">
                  Spoken Transcript
                </h3>
                <span className="text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#F5F2E9] text-[#6B6658] font-bold border border-[#E6E2D3]">
                  {transcripts.length} turns
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenGlossary}
                  className="px-3 py-1.5 rounded-full bg-[#F5F2E9] text-xs font-bold text-[#D4A373] hover:bg-[#E6E2D3] border border-[#E6E2D3] transition-colors flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Glossary</span>
                </button>

                <button
                  onClick={() => setTranscripts([])}
                  className="p-2 rounded-full text-[#6B6658] hover:text-[#2D2926] hover:bg-[#F5F2E9] transition-colors"
                  title="Clear Transcript"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Transcript Messages Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {transcripts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6B6658] space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#F5F2E9] flex items-center justify-center border border-[#E6E2D3] text-[#D4A373]">
                    <Mic className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-serif font-bold text-[#2D2926]">
                      Start speaking to begin your live dialogue!
                    </p>
                    <p className="text-xs text-[#6B6658] mt-1">
                      Speak into your microphone or choose one of the prompts.
                    </p>
                  </div>
                </div>
              ) : (
                transcripts.map((t) => (
                  <div
                    key={t.id}
                    className={`flex flex-col ${
                      t.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#9C9481]">
                        {t.sender === 'user'
                          ? 'You'
                          : `${persona.name} (${t.dialect === 'indian' ? '🇮🇳' : '🇬🇧'})`}
                      </span>
                      <span className="text-[10px] text-[#9C9481]">
                        {t.timestamp}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                        t.sender === 'user'
                          ? 'bg-[#2D2926] text-white rounded-tr-none shadow-sm'
                          : 'bg-[#F5F2E9] text-[#2D2926] border border-[#E6E2D3] rounded-tl-none'
                      }`}
                    >
                      <p>{t.text}</p>

                      {/* Detected Idioms Badges */}
                      {t.detectedIdioms && t.detectedIdioms.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-[#E6E2D3] space-y-1.5">
                          <p className="text-[10px] font-bold text-[#D4A373] flex items-center gap-1 uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" />
                            <span>Idioms Identified:</span>
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {t.detectedIdioms.map((item, idx) => (
                              <button
                                key={idx}
                                onClick={() =>
                                  setActiveTooltipIdiom(
                                    activeTooltipIdiom === item.idiom
                                      ? null
                                      : item.idiom
                                  )
                                }
                                className="px-2 py-0.5 rounded-full bg-[#E9EDC9] text-[#2D2926] border border-[#CCD5AE] text-[10px] font-bold hover:bg-[#CCD5AE] transition-colors"
                              >
                                "{item.idiom}"
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>

            {/* Bottom Text Fallback Bar */}
            <div className="pt-3 border-t border-[#E6E2D3] flex items-center gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendTextMessage()}
                placeholder={`Type a message in ${dialect === 'indian' ? 'Indian' : 'UK'} mode...`}
                className="flex-1 px-4 py-3 rounded-full bg-[#F5F2E9] border border-[#E6E2D3] text-xs text-[#2D2926] placeholder-[#9C9481] focus:outline-none focus:border-[#D4A373]"
              />
              <button
                onClick={() => handleSendTextMessage()}
                className="p-3 rounded-full bg-[#2D2926] text-white hover:bg-[#D4A373] transition-colors font-bold shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
