export type DialectMode = 'indian' | 'uk';

export type VoiceName = 'Kore' | 'Zephyr' | 'Puck' | 'Charon' | 'Fenrir';

export type Gender = 'female' | 'male';

export type ConversationState = 
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'listening'
  | 'speaking'
  | 'interrupted'
  | 'error';

export interface DetectedIdiom {
  idiom: string;
  meaning: string;
  dialect: DialectMode;
}

export interface TranscriptItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  dialect: DialectMode;
  detectedIdioms?: DetectedIdiom[];
}

export interface IdiomItem {
  id: string;
  phrase: string;
  meaning: string;
  example: string;
  dialect: DialectMode;
  category: string;
}

export interface VoiceConfig {
  voiceName: VoiceName;
  gender: Gender;
  speed: number;
  pitch: number;
}

export interface PersonaDetails {
  id: DialectMode;
  name: string;
  tagline: string;
  description: string;
  flag: string;
  accentTitle: string;
  defaultVoice: VoiceName;
  avatarBg: string;
  samplePhrases: string[];
  keyIdioms: { phrase: string; meaning: string }[];
  culturalNotes: string[];
}
