import React, { useState } from 'react';
import { Home, User, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = ({ isAuthenticated, user, onBack, onProfile, onLogout, showBackButton }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme, isLight } = useTheme();

  return (
    <nav className="theme-bg-secondary theme-border-primary border-b sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <img
              src="/Winning Listing Logo/WinningListing Gradient.png"
              alt="Winning Listing"
              className="h-10 w-auto"
            />
            <span className="ml-4 text-2xl font-black theme-text-primary">
              Winning Listing
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle flex items-center justify-center"
              title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
            >
              {isLight ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-6 py-3 theme-text-secondary hover:theme-text-primary theme-bg-tertiary hover:theme-bg-secondary rounded-xl font-bold transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
            )}

            {isAuthenticated && user && (
              <div className="flex items-center space-x-6">
                <span className="theme-text-secondary font-medium">
                  Welcome, <span className="font-bold theme-text-primary">
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 
                     user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` :
                     user.firstName || user.first_name || user.name || 'User'}
                  </span>
                </span>
                
                <button
                  onClick={onProfile}
                  className="flex items-center space-x-2 px-6 py-3 theme-bg-tertiary hover:theme-bg-secondary theme-text-primary rounded-xl font-bold transition-all duration-200"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
            >
              {isLight ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="theme-text-secondary hover:theme-text-primary theme-bg-tertiary hover:theme-bg-secondary p-3 rounded-xl transition-all duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 theme-border-primary border-t mt-4 pt-6">
            <div className="space-y-3">
              {showBackButton && onBack && (
                <button
                  onClick={() => {
                    onBack();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-6 py-3 theme-text-secondary hover:theme-text-primary theme-bg-tertiary hover:theme-bg-secondary rounded-xl font-bold transition-all duration-200"
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </button>
              )}

              {isAuthenticated && user && (
                <>
                  <div className="px-6 py-3 theme-text-secondary">
                    Welcome, <span className="font-bold theme-text-primary">
                      {(() => {
                        const fullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 
                                       user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` :
                                       user.firstName || user.first_name || user.name || 'User';
                        return fullName;
                      })()}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      onProfile();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full px-6 py-3 theme-bg-tertiary hover:theme-bg-secondary theme-text-primary rounded-xl font-bold transition-all duration-200"
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      onLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 