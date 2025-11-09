export interface User {
  name: string;
  isLoggedIn: boolean;
  email?: string;
  avatar?: string;
}

export interface Recording {
  id: string;
  title: string;
  duration: number; // in seconds
  timestamp: Date;
  audioUrl?: string;
  audioFileName?: string;
  audioFileSize?: number;
  audioFormat?: string;
  transcription?: string;
  transcriptionStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  transcriptionError?: string;
  hasSummary?: boolean;
  hasMeetingNotes?: boolean;
  sharePreferences?: {
    includeAudio: boolean;
    includeSummary: boolean;
    includeMeetingNotes: boolean;
  };
}

export interface EmailPreset {
  id: string;
  email: string;
}

export type ShareMethod = 'email' | 'share';

export interface Settings {
  emailPresets: EmailPreset[];
  theme: 'light' | 'dark' | 'system';
}