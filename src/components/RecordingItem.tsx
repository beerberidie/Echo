import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Recording, ShareMethod, EmailPreset } from '../types';
import { ChevronDown, ChevronUp, Play, Trash2, FileText, MessageSquare, Mail, Share2, Edit2, Check, Circle, Clock, AlertCircle, CheckCircle, Loader, RefreshCw } from 'lucide-react';
import { recordingsAPI } from '../services/api';

interface RecordingItemProps {
  recording: Recording;
}

const RecordingItem: React.FC<RecordingItemProps> = ({ recording }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(recording.title);
  const [isEmailDropdownOpen, setIsEmailDropdownOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailPreset | null>(null);
  const emailDropdownRef = useRef<HTMLDivElement>(null);
  const { deleteRecording, shareRecording, summarizeRecording, createMeetingNotes, updateSharePreferences, settings, isAuthenticated } = useAppContext();
  const [isRetryingTranscription, setIsRetryingTranscription] = useState(false);
  const [localTranscriptionStatus, setLocalTranscriptionStatus] = useState(recording.transcriptionStatus);

  // Function to retry transcription
  const handleRetryTranscription = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!recording.id || !isAuthenticated) return;

    try {
      setIsRetryingTranscription(true);
      setLocalTranscriptionStatus('pending');

      const response = await recordingsAPI.retryTranscription(recording.id);

      if (response.success) {
        console.log('Transcription retry initiated');
      }
    } catch (error) {
      console.error('Error retrying transcription:', error);
      setLocalTranscriptionStatus('failed');
    } finally {
      setIsRetryingTranscription(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleShare = (method: ShareMethod) => {
    shareRecording(recording.id, method);
  };

  const handleSave = () => {
    // In a real app, this would update the recording title in the database
    setIsEditing(false);
  };

  // Handle email selection from dropdown
  const handleEmailSelect = (preset: EmailPreset) => {
    setSelectedEmail(preset);
    setIsEmailDropdownOpen(false);
    // In a real app, you might want to immediately share after selection
    // or update some state to indicate which email is selected
  };

  // Handle email sharing with selected email
  const handleEmailShare = async () => {
    if (selectedEmail) {
      try {
        await shareRecording(recording.id, 'email', selectedEmail.email);
      } catch (error) {
        console.error('Error sharing via email:', error);
      }
    } else {
      alert('Please select an email address first');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emailDropdownRef.current && !emailDropdownRef.current.contains(event.target as Node)) {
        setIsEmailDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check transcription status periodically if it's pending or processing
  useEffect(() => {
    // Only check status if authenticated, expanded, and status is pending or processing
    if (!isAuthenticated || !isExpanded ||
        !(localTranscriptionStatus === 'pending' || localTranscriptionStatus === 'processing') ||
        !recording.id) {
      return;
    }

    let intervalId: NodeJS.Timeout;

    const checkTranscriptionStatus = async () => {
      try {
        const response = await recordingsAPI.getTranscriptionStatus(recording.id);

        if (response.success) {
          const newStatus = response.data.transcriptionStatus;
          setLocalTranscriptionStatus(newStatus);

          // If transcription is complete or failed, stop checking
          if (newStatus === 'completed' || newStatus === 'failed') {
            clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error('Error checking transcription status:', error);
      }
    };

    // Check immediately
    checkTranscriptionStatus();

    // Then check every 5 seconds
    intervalId = setInterval(checkTranscriptionStatus, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, isExpanded, localTranscriptionStatus, recording.id]);

  return (
    <div
      className={`mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-all duration-300 overflow-hidden ${
        isExpanded ? 'shadow-md' : 'hover:shadow-md'
      }`}
    >
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <Play size={18} fill="white" className="ml-1" />
          </div>
          <div>
            <div className="flex items-center">
              {isEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-2 py-1 border rounded text-black dark:text-white bg-transparent"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  onBlur={handleSave}
                />
              ) : (
                <>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">{title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                </>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatDuration(recording.duration)} • {formatDate(recording.timestamp)}
            </div>
          </div>
        </div>
        <div className="text-gray-500">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-700">
          {/* Transcription section */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center justify-between">
              <span>Transcription</span>
              {(localTranscriptionStatus || recording.transcriptionStatus) && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {localTranscriptionStatus === 'pending' && (
                      <div className="flex items-center text-yellow-500 text-xs">
                        <Clock size={12} className="mr-1" />
                        <span>Pending</span>
                      </div>
                    )}
                    {localTranscriptionStatus === 'processing' && (
                      <div className="flex items-center text-blue-500 text-xs">
                        <Loader size={12} className="mr-1 animate-spin" />
                        <span>Processing</span>
                      </div>
                    )}
                    {localTranscriptionStatus === 'completed' && (
                      <div className="flex items-center text-green-500 text-xs">
                        <CheckCircle size={12} className="mr-1" />
                        <span>Completed</span>
                      </div>
                    )}
                    {localTranscriptionStatus === 'failed' && (
                      <div className="flex items-center text-red-500 text-xs">
                        <AlertCircle size={12} className="mr-1" />
                        <span>Failed</span>
                      </div>
                    )}
                  </div>

                  {/* Retry button for failed transcriptions */}
                  {(localTranscriptionStatus === 'failed' || recording.transcriptionStatus === 'failed') && isAuthenticated && (
                    <button
                      onClick={handleRetryTranscription}
                      disabled={isRetryingTranscription}
                      className="flex items-center text-blue-500 hover:text-blue-600 text-xs"
                    >
                      <RefreshCw size={12} className={`mr-1 ${isRetryingTranscription ? 'animate-spin' : ''}`} />
                      <span>Retry</span>
                    </button>
                  )}
                </div>
              )}
            </h4>

            {recording.transcription ? (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                {recording.transcription}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-500 dark:text-gray-400 italic">
                {localTranscriptionStatus === 'pending' && "Transcription is pending. It will start processing soon."}
                {localTranscriptionStatus === 'processing' && "Transcription is currently being processed..."}
                {localTranscriptionStatus === 'failed' && "Transcription failed. Please try again."}
                {!localTranscriptionStatus && !recording.transcriptionStatus && "No transcription available."}
              </div>
            )}

            {recording.transcriptionError && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-300">
                Error: {recording.transcriptionError}
              </div>
            )}
          </div>

          {/* Audio player - only shown if audio URL is available */}
          {recording.audioUrl && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Audio Recording</h4>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <audio
                  controls
                  className="w-full"
                  src={recording.audioUrl}
                >
                  Your browser does not support the audio element.
                </audio>
                {recording.audioFileSize && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    File size: {(recording.audioFileSize / 1024 / 1024).toFixed(2)} MB
                    {recording.audioFormat && ` • Format: ${recording.audioFormat}`}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left column - Analysis actions */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Analysis</h4>
              <div className="space-y-2">
                <button
                  onClick={() => summarizeRecording(recording.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  <div className="flex items-center">
                    <FileText size={16} className="mr-2" />
                    <span>Summarize</span>
                  </div>
                  <div className="flex items-center">
                    {recording.hasSummary ? (
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gray-700 opacity-50"></div>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => createMeetingNotes(recording.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                >
                  <div className="flex items-center">
                    <MessageSquare size={16} className="mr-2" />
                    <span>Meeting Notes</span>
                  </div>
                  <div className="flex items-center">
                    {recording.hasMeetingNotes ? (
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gray-700 opacity-50"></div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Right column - Sharing actions */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Share</h4>

              {/* Share content selection */}
              <div className="mb-3 p-2 bg-gray-800/50 rounded-md">
                <p className="text-xs text-gray-400 mb-2">Include in shares:</p>
                <div className="flex space-x-3">
                  <div className="flex items-center">
                    <button
                      onClick={() => updateSharePreferences(recording.id, {
                        includeAudio: !recording.sharePreferences?.includeAudio
                      })}
                      className={`w-5 h-5 rounded flex items-center justify-center mr-1.5 ${
                        recording.sharePreferences?.includeAudio
                          ? 'bg-blue-600'
                          : 'bg-gray-700'
                      }`}
                    >
                      {recording.sharePreferences?.includeAudio && <Check size={12} className="text-white" />}
                    </button>
                    <span className="text-xs text-gray-300">Audio</span>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => updateSharePreferences(recording.id, {
                        includeSummary: !recording.sharePreferences?.includeSummary
                      })}
                      className={`w-5 h-5 rounded flex items-center justify-center mr-1.5 ${
                        recording.sharePreferences?.includeSummary
                          ? 'bg-blue-600'
                          : 'bg-gray-700'
                      } ${!recording.hasSummary ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!recording.hasSummary}
                    >
                      {recording.sharePreferences?.includeSummary && <Check size={12} className="text-white" />}
                    </button>
                    <span className={`text-xs ${!recording.hasSummary ? 'text-gray-500' : 'text-gray-300'}`}>Summary</span>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => updateSharePreferences(recording.id, {
                        includeMeetingNotes: !recording.sharePreferences?.includeMeetingNotes
                      })}
                      className={`w-5 h-5 rounded flex items-center justify-center mr-1.5 ${
                        recording.sharePreferences?.includeMeetingNotes
                          ? 'bg-blue-600'
                          : 'bg-gray-700'
                      } ${!recording.hasMeetingNotes ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!recording.hasMeetingNotes}
                    >
                      {recording.sharePreferences?.includeMeetingNotes && <Check size={12} className="text-white" />}
                    </button>
                    <span className={`text-xs ${!recording.hasMeetingNotes ? 'text-gray-500' : 'text-gray-300'}`}>Notes</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {/* Email dropdown */}
                <div className="relative" ref={emailDropdownRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEmailDropdownOpen(!isEmailDropdownOpen);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <div className="flex items-center">
                      <Mail size={16} className="mr-2" />
                      <span>
                        {selectedEmail ? selectedEmail.email : 'Email'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {recording.sharePreferences?.includeAudio && (
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        )}
                        {recording.sharePreferences?.includeSummary && recording.hasSummary && (
                          <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                        )}
                        {recording.sharePreferences?.includeMeetingNotes && recording.hasMeetingNotes && (
                          <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                        )}
                      </div>
                      <ChevronDown size={14} className={`transition-transform ${isEmailDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Dropdown menu */}
                  {isEmailDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 max-h-48 overflow-y-auto">
                      {settings.emailPresets.length > 0 ? (
                        settings.emailPresets.map(preset => (
                          <button
                            key={preset.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEmailSelect(preset);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              selectedEmail?.id === preset.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                            }`}
                          >
                            {preset.email}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          No email presets available
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Send email button - only shown when an email is selected */}
                {selectedEmail && (
                  <button
                    onClick={handleEmailShare}
                    className="w-full flex items-center justify-center px-3 py-2 text-sm rounded-md bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                  >
                    <span>Send Email</span>
                  </button>
                )}
                <button
                  onClick={() => handleShare('share')}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  <div className="flex items-center">
                    <Share2 size={16} className="mr-2" />
                    <span>Share</span>
                  </div>
                  <div className="flex space-x-1">
                    {recording.sharePreferences?.includeAudio && (
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    )}
                    {recording.sharePreferences?.includeSummary && recording.hasSummary && (
                      <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                    )}
                    {recording.sharePreferences?.includeMeetingNotes && recording.hasMeetingNotes && (
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Delete button at the bottom */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => deleteRecording(recording.id)}
              className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center"
            >
              <Trash2 size={14} className="mr-1.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingItem;