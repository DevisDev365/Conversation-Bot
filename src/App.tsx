import React, { useState } from 'react';
import { DialectMode, ConversationState, VoiceConfig, IdiomItem } from './types';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { VoiceStudio } from './components/VoiceStudio';
import { IdiomGlossaryModal } from './components/IdiomGlossaryModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';

export default function App() {
  const [currentDialect, setCurrentDialect] = useState<DialectMode>('indian');
  const [isInStudio, setIsInStudio] = useState<boolean>(false);
  const [conversationState, setConversationState] = useState<ConversationState>('idle');

  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
    voiceName: 'Kore',
    gender: 'female',
    speed: 1.0,
    pitch: 1.0,
  });

  const [injectedIdiomPrompt, setInjectedIdiomPrompt] = useState<IdiomItem | null>(null);

  const handleStartConversation = (selectedDialect: DialectMode) => {
    setCurrentDialect(selectedDialect);
    // Set default voice character for dialect
    if (selectedDialect === 'indian') {
      setVoiceConfig((prev) => ({ ...prev, voiceName: 'Kore' }));
    } else {
      setVoiceConfig((prev) => ({ ...prev, voiceName: 'Zephyr' }));
    }
    setIsInStudio(true);
  };

  const handleSelectDialectInStudio = (newDialect: DialectMode) => {
    setCurrentDialect(newDialect);
    if (newDialect === 'indian') {
      setVoiceConfig((prev) => ({ ...prev, voiceName: 'Kore' }));
    } else {
      setVoiceConfig((prev) => ({ ...prev, voiceName: 'Zephyr' }));
    }
  };

  const handleSelectIdiomForVoice = (idiom: IdiomItem) => {
    setCurrentDialect(idiom.dialect);
    setInjectedIdiomPrompt(idiom);
    setIsInStudio(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D2926] flex flex-col font-sans selection:bg-[#D4A373] selection:text-white">
      {/* Header */}
      <Header
        currentDialect={currentDialect}
        onSelectDialect={handleSelectDialectInStudio}
        conversationState={conversationState}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onGoHome={() => setIsInStudio(false)}
        isInStudio={isInStudio}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {!isInStudio ? (
          <LandingPage
            onStartConversation={handleStartConversation}
            onOpenGlossary={() => setIsGlossaryOpen(true)}
          />
        ) : (
          <VoiceStudio
            dialect={currentDialect}
            onSwitchDialect={handleSelectDialectInStudio}
            voiceConfig={voiceConfig}
            onOpenGlossary={() => setIsGlossaryOpen(true)}
            injectedIdiomPrompt={injectedIdiomPrompt}
            onClearInjectedIdiom={() => setInjectedIdiomPrompt(null)}
          />
        )}
      </main>

      {/* Modals */}
      <IdiomGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        onSelectIdiomForVoice={handleSelectIdiomForVoice}
      />

      <VoiceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={voiceConfig}
        onChangeConfig={setVoiceConfig}
      />
    </div>
  );
}
