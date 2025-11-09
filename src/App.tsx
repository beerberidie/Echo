import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import RecordingInterface from './components/RecordingInterface';
import RecordingsList from './components/RecordingsList';

// Main App content
const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-2">
        <div className="max-w-2xl mx-auto">
          <RecordingInterface />
          <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
          <RecordingsList />
        </div>
      </main>
    </div>
  );
};

// Wrap the app with the context provider
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;