import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Mic, Settings, LogIn, LogOut } from 'lucide-react';
import SettingsMenu from './SettingsMenu';
import LoginForm from './LoginForm';

const Header: React.FC = () => {
  const { user, toggleSettings, isSettingsOpen, isAuthenticated } = useAppContext();
  const [showLoginForm, setShowLoginForm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <header className="bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <Mic size={24} className="text-pink-300" />
            <span className="ml-2 text-xl font-bold tracking-tight">
              echo<span className="text-pink-300 font-bold text-2xl">:</span>
            </span>
          </div>

          {user.isLoggedIn && (
            <div className="ml-4 opacity-80 text-sm">
              <span className="bg-black/20 px-3 py-1 rounded-full">
                Hi, {user.name}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {user.isLoggedIn ? (
            <>
              <button
                onClick={toggleSettings}
                className="flex items-center bg-black/20 hover:bg-black/30 text-white px-3 py-1.5 rounded-full text-sm transition-colors duration-200"
              >
                <Settings size={16} className="mr-1.5" />
                <span>Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center bg-black/20 hover:bg-black/30 text-white px-3 py-1.5 rounded-full text-sm transition-colors duration-200"
              >
                <LogOut size={16} className="mr-1.5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowLoginForm(true)}
              className="flex items-center bg-black/20 hover:bg-black/30 text-white px-3 py-1.5 rounded-full text-sm transition-colors duration-200"
            >
              <LogIn size={16} className="mr-1.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
      <div className="border-b border-white/10 mt-4"></div>

      {isSettingsOpen && <SettingsMenu />}
      {showLoginForm && <LoginForm onClose={() => setShowLoginForm(false)} />}
    </header>
  );
};

export default Header