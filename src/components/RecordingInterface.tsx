import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Mic, Square, Save, Play, AlertCircle } from 'lucide-react';
import audioRecorderService from '../services/audioRecorderService';

const RecordingInterface: React.FC = () => {
  const {
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    pauseRecording,
    saveRecording: saveRecordingContext,
    resumeRecording
  } = useAppContext();

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [recordingSupported, setRecordingSupported] = useState(true);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Check if recording is supported
  useEffect(() => {
    setRecordingSupported(audioRecorderService.isRecordingSupported());
  }, []);

  // Format seconds into HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine the status text and indicator color
  const getStatusText = () => {
    if (isRecording) return "Recording...";
    if (isPaused) return "Recording paused";
    return "Ready to record";
  };

  // Handle saving the recording
  const handleSaveRecording = async () => {
    try {
      setRecordingError(null);

      // Stop the recording and get the audio blob
      const blob = await audioRecorderService.stopRecording();
      setAudioBlob(blob);

      // Convert blob to base64 for sending to the server
      const base64 = await audioRecorderService.blobToBase64(blob);
      setAudioBase64(base64);

      // Save the recording with the audio data
      await saveRecordingContext({
        audioData: base64,
        audioFormat: 'webm'
      });
    } catch (error) {
      console.error('Error saving recording:', error);
      setRecordingError('Failed to save recording');
    }
  };

  // Handle the main recording button click
  const handleRecordButtonClick = async () => {
    if (isRecording) {
      try {
        pauseRecording();
        // We don't stop the actual recording here, just pause it
      } catch (error) {
        console.error('Error pausing recording:', error);
        setRecordingError('Failed to pause recording');
      }
    } else {
      try {
        setRecordingError(null);

        if (isPaused) {
          // If we're paused, just resume
          resumeRecording();
          await audioRecorderService.resumeRecording();
        } else {
          // Start a new recording
          startRecording();
          await audioRecorderService.startRecording();
          setAudioBlob(null);
          setAudioBase64(null);
        }
      } catch (error) {
        console.error('Error starting recording:', error);
        setRecordingError('Failed to start recording. Please check microphone permissions.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center py-8">
      {/* Recording not supported warning */}
      {!recordingSupported && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md flex items-center">
          <AlertCircle size={18} className="mr-2" />
          <span>Audio recording is not supported in this browser. Please try using Chrome, Firefox, or Edge.</span>
        </div>
      )}

      {/* Recording error message */}
      {recordingError && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md flex items-center">
          <AlertCircle size={18} className="mr-2" />
          <span>{recordingError}</span>
        </div>
      )}

      {/* Status indicator */}
      <div className="mb-4 flex items-center space-x-2">
        {isRecording ? (
          <>
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-50"></div>
              <div className="relative h-3 w-3 bg-red-500 rounded-full"></div>
            </div>
            <span className="text-red-500 font-medium">{getStatusText()}</span>
          </>
        ) : isPaused ? (
          <>
            <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
            <span className="text-yellow-500 font-medium">{getStatusText()}</span>
          </>
        ) : (
          <>
            <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
            <span className="text-gray-500 font-medium">{getStatusText()}</span>
          </>
        )}
      </div>

      {/* Recording controls */}
      <div className="flex flex-col items-center">
        {/* Main recording button */}
        <button
          onClick={handleRecordButtonClick}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 shadow-lg scale-110'
              : isPaused
                ? 'bg-yellow-500 hover:bg-yellow-600 shadow-lg'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md'
          }`}
        >
          {isRecording ? (
            <Square
              size={32}
              className="text-white"
              fill="white"
            />
          ) : isPaused ? (
            <Play
              size={32}
              className="text-white ml-1"
              fill="white"
            />
          ) : (
            <Mic
              size={32}
              className="text-white"
            />
          )}
        </button>

        {/* Save button - only shown when recording is paused */}
        {isPaused && recordingTime > 0 && (
          <button
            onClick={handleSaveRecording}
            disabled={!recordingSupported || !!recordingError}
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center transition-all duration-200 shadow-md disabled:opacity-50 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            <Save size={18} className="mr-2" />
            <span>Save Recording</span>
          </button>
        )}
      </div>

      {/* Timer - always visible when recording or paused */}
      {(isRecording || isPaused) && recordingTime > 0 && (
        <div className="mt-6 font-mono text-2xl font-bold text-gray-700 dark:text-gray-200">
          {formatTime(recordingTime)}
        </div>
      )}
    </div>
  );
};

export default RecordingInterface