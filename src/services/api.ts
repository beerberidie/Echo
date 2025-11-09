import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (userData: { email: string; password: string }) => {
    const response = await api.post('/auth/login', userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Recordings API
export const recordingsAPI = {
  getRecordings: async () => {
    const response = await api.get('/recordings');
    return response.data;
  },
  getRecording: async (id: string) => {
    const response = await api.get(`/recordings/${id}`);
    return response.data;
  },
  createRecording: async (recordingData: any) => {
    const response = await api.post('/recordings', recordingData);
    return response.data;
  },
  updateRecording: async (id: string, recordingData: any) => {
    const response = await api.put(`/recordings/${id}`, recordingData);
    return response.data;
  },
  deleteRecording: async (id: string) => {
    const response = await api.delete(`/recordings/${id}`);
    return response.data;
  },
  deleteAllRecordings: async () => {
    const response = await api.delete('/recordings');
    return response.data;
  },
  getTranscriptionStatus: async (id: string) => {
    const response = await api.get(`/recordings/${id}/transcription`);
    return response.data;
  },
  retryTranscription: async (id: string) => {
    const response = await api.post(`/recordings/${id}/transcription/retry`);
    return response.data;
  },
};

// Email API
export const emailAPI = {
  sendRecordingEmail: async (recordingId: string, email: string) => {
    const response = await api.post(`/email/recording/${recordingId}`, { email });
    return response.data;
  },
  validateSmtpConfig: async () => {
    const response = await api.get('/email/validate-config');
    return response.data;
  },
};

// Settings API
export const settingsAPI = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  updateSettings: async (settingsData: any) => {
    const response = await api.put('/settings', settingsData);
    return response.data;
  },
  addEmailPreset: async (email: string) => {
    const response = await api.post('/settings/email-presets', { email });
    return response.data;
  },
  removeEmailPreset: async (id: string) => {
    const response = await api.delete(`/settings/email-presets/${id}`);
    return response.data;
  },
};

export default api;
