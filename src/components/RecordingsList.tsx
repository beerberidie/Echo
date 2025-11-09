import React from 'react';
import { useAppContext } from '../context/AppContext';
import RecordingItem from './RecordingItem';

const RecordingsList: React.FC = () => {
  const { recordings } = useAppContext();

  if (recordings.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center text-gray-500">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
          <span className="text-xl">🎙️</span>
        </div>
        <h3 className="text-lg font-medium mb-1">No recordings yet</h3>
        <p className="text-sm max-w-xs">
          Click the record button above to create your first recording
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">Your Recordings</h2>
      <div className="space-y-3">
        {recordings.map(recording => (
          <RecordingItem key={recording.id} recording={recording} />
        ))}
      </div>
    </div>
  );
};

export default RecordingsList;