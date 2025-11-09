import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Mail, User, X, Plus, Trash2, Download, Clock, FileText, MessageSquare, AlertTriangle } from 'lucide-react';

const SettingsMenu: React.FC = () => {
  const { user, settings, recordings, updateSettings, closeSettings, deleteRecording, deleteAllRecordings } = useAppContext();
  const [newPreset, setNewPreset] = useState({ email: '' });
  const [activeTab, setActiveTab] = useState<'account' | 'email' | 'history'>('account');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const addEmailPreset = () => {
    if (newPreset.email) {
      updateSettings({
        ...settings,
        emailPresets: [...settings.emailPresets, {
          id: Date.now().toString(),
          email: newPreset.email
        }]
      });
      setNewPreset({ email: '' });
    }
  };

  const deleteEmailPreset = (id: string) => {
    updateSettings({
      ...settings,
      emailPresets: settings.emailPresets.filter(preset => preset.id !== id)
    });
  };

  // Format seconds into MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date to a readable string
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Handle downloading a recording as a text file
  const handleDownload = (recording: any) => {
    const content = `Title: ${recording.title}
Date: ${formatDate(recording.timestamp)}
Duration: ${formatDuration(recording.duration)}

TRANSCRIPTION:
${recording.transcription || "No transcription available."}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle emailing a recording
  const handleEmail = (recording: any) => {
    const subject = encodeURIComponent(`Echo Recording: ${recording.title}`);
    const body = encodeURIComponent(`Recording: ${recording.title}
Date: ${formatDate(recording.timestamp)}
Duration: ${formatDuration(recording.duration)}

TRANSCRIPTION:
${recording.transcription || "No transcription available."}`);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Delete all recordings with confirmation
  const handleDeleteAll = () => {
    if (showDeleteConfirm) {
      deleteAllRecordings();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
          <button
            onClick={closeSettings}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100 ${
              activeTab === 'account' ? 'border-b-2 border-purple-600' : ''
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100 ${
              activeTab === 'email' ? 'border-b-2 border-purple-600' : ''
            }`}
          >
            Email Presets
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100 ${
              activeTab === 'history' ? 'border-b-2 border-purple-600' : ''
            }`}
          >
            History
          </button>
        </div>

        <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 8rem)' }}>
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Recording History List */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Clock size={16} className="mr-2" />
                  Recording History
                </h3>

                {recordings.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No recordings found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recordings.map(recording => (
                      <div
                        key={recording.id}
                        className="bg-gray-800 rounded-lg overflow-hidden"
                        style={{ backgroundColor: '#1e1e2f' }}
                      >
                        {/* Recording header */}
                        <div className="p-3 border-b border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-100">{recording.title}</h4>
                              <p className="text-xs text-gray-400">
                                {formatDate(recording.timestamp)} • {formatDuration(recording.duration)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Tags and actions */}
                        <div className="p-3">
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {recording.transcription && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                                Dictation
                              </span>
                            )}
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                              Summary
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                              Meeting
                            </span>
                          </div>

                          {/* Action buttons */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDownload(recording)}
                              className="flex-1 flex items-center justify-center px-3 py-1.5 text-sm bg-indigo-600/20 text-indigo-400 rounded-md hover:bg-indigo-600/30 transition-colors"
                            >
                              <Download size={14} className="mr-1.5" />
                              <span>Download</span>
                            </button>
                            <button
                              onClick={() => handleEmail(recording)}
                              className="flex-1 flex items-center justify-center px-3 py-1.5 text-sm bg-blue-600/20 text-blue-400 rounded-md hover:bg-blue-600/30 transition-colors"
                            >
                              <Mail size={14} className="mr-1.5" />
                              <span>Email</span>
                            </button>
                            <button
                              onClick={() => deleteRecording(recording.id)}
                              className="flex items-center justify-center px-3 py-1.5 text-sm bg-red-600/20 text-red-400 rounded-md hover:bg-red-600/30 transition-colors"
                            >
                              <Trash2 size={14} className="mr-1.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="space-y-4">
                {settings.emailPresets.map(preset => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{preset.email}</p>
                    </div>
                    <button
                      onClick={() => deleteEmailPreset(preset.id)}
                      className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {settings.emailPresets.length < 5 && (
                <div className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={newPreset.email}
                      onChange={(e) => setNewPreset({ email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-white bg-white dark:bg-gray-700"
                    />
                  </div>
                  <button
                    onClick={addEmailPreset}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add Preset</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;