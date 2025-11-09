import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Recording, ShareMethod, Settings, EmailPreset } from '../types';
import { authAPI, recordingsAPI, settingsAPI, emailAPI } from '../services/api';

interface AppContextType {
  user: User;
  recordings: Recording[];
  settings: Settings;
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  isSettingsOpen: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  startRecording: () => void;
  pauseRecording: () => void;
  saveRecording: (audioData?: { audioData: string; audioFormat: string }) => Promise<void>;
  resumeRecording: () => void;
  deleteRecording: (id: string) => void;
  deleteAllRecordings: () => void;
  shareRecording: (id: string, method: ShareMethod, email?: string) => Promise<void>;
  summarizeRecording: (id: string) => void;
  createMeetingNotes: (id: string) => void;
  updateSharePreferences: (id: string, preferences: { includeAudio?: boolean; includeSummary?: boolean; includeMeetingNotes?: boolean }) => void;
  toggleSettings: () => void;
  closeSettings: () => void;
  updateSettings: (newSettings: Settings) => void;
}

const defaultUser: User = {
  name: 'Alex Smith',
  email: 'alex.smith@example.com',
  isLoggedIn: true,
};

const defaultSettings: Settings = {
  emailPresets: [],
  theme: 'light',
};

const mockRecordings: Recording[] = [
  {
    id: '1',
    title: 'Team Meeting',
    duration: 1845,
    timestamp: new Date(Date.now() - 86400000),
    transcription: 'In this team meeting, we discussed the upcoming product launch timeline. Marketing team will prepare social media assets by next Friday. Development team reported that all critical features are on track. We need to schedule a follow-up meeting with the QA team to review test results.',
    hasSummary: true,
    hasMeetingNotes: true,
    sharePreferences: {
      includeAudio: true,
      includeSummary: true,
      includeMeetingNotes: false
    }
  },
  {
    id: '2',
    title: 'Client Call',
    duration: 1220,
    timestamp: new Date(Date.now() - 172800000),
    transcription: 'Call with ABC Corp about their implementation concerns. They requested additional training for their staff. We agreed to provide two extra training sessions next month. They also mentioned interest in our premium support package.',
    hasSummary: true,
    hasMeetingNotes: false,
    sharePreferences: {
      includeAudio: true,
      includeSummary: false,
      includeMeetingNotes: false
    }
  },
  {
    id: '3',
    title: 'Project Brainstorm',
    duration: 2430,
    timestamp: new Date(Date.now() - 259200000),
    transcription: 'Brainstorming session for the new mobile app features. Team suggested adding voice commands, dark mode, and offline capabilities. We prioritized these features as: 1) Offline mode, 2) Dark mode, 3) Voice commands. Design team will create mockups by next week.',
    hasSummary: false,
    hasMeetingNotes: false,
    sharePreferences: {
      includeAudio: true,
      includeSummary: false,
      includeMeetingNotes: false
    }
  },
];

const defaultContextValue: AppContextType = {
  user: defaultUser,
  recordings: mockRecordings,
  settings: defaultSettings,
  isRecording: false,
  isPaused: false,
  recordingTime: 0,
  isSettingsOpen: false,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  startRecording: () => {},
  pauseRecording: () => {},
  saveRecording: () => {},
  resumeRecording: () => {},
  deleteRecording: () => {},
  deleteAllRecordings: () => {},
  shareRecording: async () => {},
  summarizeRecording: () => {},
  createMeetingNotes: () => {},
  updateSharePreferences: () => {},
  toggleSettings: () => {},
  closeSettings: () => {},
  updateSettings: () => {},
};

export const AppContext = createContext<AppContextType>(defaultContextValue);

export const useAppContext = () => useContext(AppContext);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User>(defaultUser);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
      // For demo purposes, we'll use the mock data if not authenticated
      setRecordings(mockRecordings);
    }
  }, []);

  // Fetch user data if authenticated
  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success) {
        setUser({
          name: response.data.name,
          email: response.data.email,
          avatar: response.data.avatar,
          isLoggedIn: true
        });
        setIsAuthenticated(true);
        fetchRecordings();
        fetchSettings();
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setRecordings(mockRecordings);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recordings from API
  const fetchRecordings = async () => {
    try {
      const response = await recordingsAPI.getRecordings();
      if (response.success) {
        // Convert string dates to Date objects
        const formattedRecordings = response.data.map((rec: any) => ({
          ...rec,
          timestamp: new Date(rec.timestamp)
        }));
        setRecordings(formattedRecordings);
      }
    } catch (err) {
      console.error('Error fetching recordings:', err);
      setError('Failed to load recordings');
    }
  };

  // Fetch user settings from API
  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  const startRecording = () => {
    // If we're paused, we should resume instead
    if (isPaused) {
      resumeRecording();
      return;
    }

    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);

    const interval = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    setTimerInterval(interval);
  };

  const pauseRecording = () => {
    setIsRecording(false);
    setIsPaused(true);

    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const resumeRecording = () => {
    setIsRecording(true);
    setIsPaused(false);

    const interval = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    setTimerInterval(interval);
  };

  const saveRecording = async (audioData?: { audioData: string; audioFormat: string }) => {
    if (recordingTime > 0) {
      // Create a new recording object
      const newRecording: Recording = {
        title: `Recording ${recordings.length + 1}`,
        duration: recordingTime,
        timestamp: new Date(),
        transcriptionStatus: 'pending',
        hasSummary: false,
        hasMeetingNotes: false,
        sharePreferences: {
          includeAudio: true,
          includeSummary: false,
          includeMeetingNotes: false
        }
      };

      // Add audio data if provided
      if (audioData) {
        newRecording.audioFormat = audioData.audioFormat;
      }

      try {
        if (isAuthenticated) {
          // Save to API if authenticated
          const recordingData = audioData
            ? { ...newRecording, audioData: audioData.audioData }
            : newRecording;

          const response = await recordingsAPI.createRecording(recordingData);

          if (response.success) {
            // Add the new recording with the ID from the server
            const savedRecording = {
              ...response.data,
              timestamp: new Date(response.data.timestamp)
            };
            setRecordings([savedRecording, ...recordings]);
          }
        } else {
          // For demo purposes, save locally if not authenticated
          const localRecording = {
            ...newRecording,
            id: Date.now().toString(),
            // For demo, set a fake transcription when not authenticated
            transcription: "This is a simulated transcription for demo purposes. In the real app, this would be generated by the backend transcription service.",
            transcriptionStatus: 'completed'
          };
          setRecordings([localRecording, ...recordings]);
        }
      } catch (err) {
        console.error('Error saving recording:', err);
        alert('Failed to save recording. Please try again.');
      }

      // Reset recording state
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
    }
  };

  const deleteRecording = async (id: string) => {
    try {
      if (isAuthenticated) {
        // Delete from API if authenticated
        const response = await recordingsAPI.deleteRecording(id);
        if (response.success) {
          setRecordings(recordings.filter(recording => recording.id !== id));
        }
      } else {
        // For demo purposes, delete locally if not authenticated
        setRecordings(recordings.filter(recording => recording.id !== id));
      }
    } catch (err) {
      console.error('Error deleting recording:', err);
      alert('Failed to delete recording. Please try again.');
    }
  };

  const deleteAllRecordings = async () => {
    try {
      if (isAuthenticated) {
        // Delete all from API if authenticated
        const response = await recordingsAPI.deleteAllRecordings();
        if (response.success) {
          setRecordings([]);
        }
      } else {
        // For demo purposes, delete all locally if not authenticated
        setRecordings([]);
      }
    } catch (err) {
      console.error('Error deleting all recordings:', err);
      alert('Failed to delete all recordings. Please try again.');
    }
  };

  const shareRecording = async (id: string, method: ShareMethod, email?: string) => {
    console.log(`Sharing recording ${id} via ${method}`);

    if (method === 'email' && email && isAuthenticated) {
      try {
        // First, validate SMTP configuration
        const configResponse = await emailAPI.validateSmtpConfig();

        if (!configResponse.configured) {
          alert(`Email sharing is not configured. Please set up SMTP settings in the server .env file.`);
          return;
        }

        // Send the email
        const response = await emailAPI.sendRecordingEmail(id, email);

        if (response.success) {
          alert(`Recording shared successfully via email to ${email}`);
        } else {
          alert(`Failed to share recording: ${response.error}`);
        }
      } catch (error) {
        console.error('Error sharing recording via email:', error);
        alert('Failed to share recording via email. Please try again.');
      }
    } else {
      // For other sharing methods or when not authenticated
      alert(`Sharing recording via ${method} (simulated)`);
    }
  };

  const summarizeRecording = async (id: string) => {
    console.log(`Summarizing recording ${id}`);

    try {
      if (isAuthenticated) {
        // Update in API if authenticated
        const recording = recordings.find(r => r.id === id);
        if (recording) {
          const updatedRecording = { ...recording, hasSummary: true };
          const response = await recordingsAPI.updateRecording(id, updatedRecording);
          if (response.success) {
            setRecordings(recordings.map(r =>
              r.id === id ? { ...r, hasSummary: true } : r
            ));
          }
        }
      } else {
        // For demo purposes, update locally if not authenticated
        setRecordings(recordings.map(recording =>
          recording.id === id
            ? { ...recording, hasSummary: true }
            : recording
        ));
      }
      alert(`Summarizing recording (simulated)`);
    } catch (err) {
      console.error('Error summarizing recording:', err);
      alert('Failed to summarize recording. Please try again.');
    }
  };

  const createMeetingNotes = async (id: string) => {
    console.log(`Creating meeting notes for recording ${id}`);

    try {
      if (isAuthenticated) {
        // Update in API if authenticated
        const recording = recordings.find(r => r.id === id);
        if (recording) {
          const updatedRecording = { ...recording, hasMeetingNotes: true };
          const response = await recordingsAPI.updateRecording(id, updatedRecording);
          if (response.success) {
            setRecordings(recordings.map(r =>
              r.id === id ? { ...r, hasMeetingNotes: true } : r
            ));
          }
        }
      } else {
        // For demo purposes, update locally if not authenticated
        setRecordings(recordings.map(recording =>
          recording.id === id
            ? { ...recording, hasMeetingNotes: true }
            : recording
        ));
      }
      alert(`Creating meeting notes (simulated)`);
    } catch (err) {
      console.error('Error creating meeting notes:', err);
      alert('Failed to create meeting notes. Please try again.');
    }
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const updateSharePreferences = async (id: string, preferences: { includeAudio?: boolean; includeSummary?: boolean; includeMeetingNotes?: boolean }) => {
    try {
      if (isAuthenticated) {
        // Get the current recording
        const recording = recordings.find(r => r.id === id);
        if (recording && recording.sharePreferences) {
          // Create updated recording with new preferences
          const updatedRecording = {
            ...recording,
            sharePreferences: {
              ...recording.sharePreferences,
              ...(preferences.includeAudio !== undefined && { includeAudio: preferences.includeAudio }),
              ...(preferences.includeSummary !== undefined && { includeSummary: preferences.includeSummary }),
              ...(preferences.includeMeetingNotes !== undefined && { includeMeetingNotes: preferences.includeMeetingNotes })
            }
          };

          // Update in API
          const response = await recordingsAPI.updateRecording(id, updatedRecording);
          if (response.success) {
            // Update local state
            setRecordings(recordings.map(r => r.id === id ? updatedRecording : r));
          }
        }
      } else {
        // For demo purposes, update locally if not authenticated
        setRecordings(recordings.map(recording => {
          if (recording.id === id && recording.sharePreferences) {
            return {
              ...recording,
              sharePreferences: {
                ...recording.sharePreferences,
                ...(preferences.includeAudio !== undefined && { includeAudio: preferences.includeAudio }),
                ...(preferences.includeSummary !== undefined && { includeSummary: preferences.includeSummary }),
                ...(preferences.includeMeetingNotes !== undefined && { includeMeetingNotes: preferences.includeMeetingNotes })
              }
            };
          }
          return recording;
        }));
      }
    } catch (err) {
      console.error('Error updating share preferences:', err);
    }
  };

  const updateSettings = async (newSettings: Settings) => {
    try {
      if (isAuthenticated) {
        // Update settings in API
        const response = await settingsAPI.updateSettings(newSettings);
        if (response.success) {
          setSettings(response.data);
        }
      } else {
        // For demo purposes, update locally if not authenticated
        setSettings(newSettings);
      }
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  const contextValue: AppContextType = {
    user,
    recordings,
    settings,
    isRecording,
    isPaused,
    recordingTime,
    isSettingsOpen,
    isLoading,
    isAuthenticated,
    error,
    startRecording,
    pauseRecording,
    saveRecording,
    resumeRecording,
    deleteRecording,
    deleteAllRecordings,
    shareRecording,
    summarizeRecording,
    createMeetingNotes,
    updateSharePreferences,
    toggleSettings,
    closeSettings,
    updateSettings,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};