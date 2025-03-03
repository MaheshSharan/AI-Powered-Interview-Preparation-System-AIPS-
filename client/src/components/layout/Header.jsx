import { Link, useNavigate } from 'react-router-dom';
import { create } from 'zustand';
import { useEffect, useState } from 'react';

// Use the auth store from App.jsx
const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  loading: true,
  setAuth: (isAuthenticated, user) => set({ isAuthenticated, user }),
  logout: () => {
    localStorage.removeItem('token');
    set({ isAuthenticated: false, user: null });
  },
}));

const Header = ({ darkMode, setDarkMode }) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-indigo-600 dark:bg-dark-secondary text-white shadow-md transition-colors duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">AIPS</Link>
            <span className="ml-2 text-xs bg-indigo-500 px-2 py-1 rounded">Beta</span>
          </div>
          
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-4">
                <Link to="/" className="hover:text-indigo-200 transition-colors">Dashboard</Link>
                <Link to="/resume-analysis" className="hover:text-indigo-200 transition-colors">Resume</Link>
                <Link to="/job-selection" className="hover:text-indigo-200 transition-colors">Jobs</Link>
                <Link to="/technical-assessment" className="hover:text-indigo-200 transition-colors">Assessment</Link>
                <Link to="/virtual-interview" className="hover:text-indigo-200 transition-colors">Interview</Link>
                <Link to="/analytics" className="hover:text-indigo-200 transition-colors">Analytics</Link>
                <Link to="/about" className="hover:text-indigo-200 transition-colors">About Us</Link>
              </nav>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm">{user?.name || 'User'}</span>
                <button 
                  onClick={handleLogout}
                  className="bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded text-sm transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex space-x-4">
              <Link to="/about" className="hover:text-indigo-200 transition-colors mr-4">About Us</Link>
              <Link 
                to="#" 
                className="bg-indigo-700 hover:bg-indigo-800 px-3 py-2 rounded-full font-medium transition-colors flex items-center justify-center w-8 h-8"
                aria-label="Help"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            </div>
          )}
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-2">
            {isAuthenticated ? (
              <>
                <nav className="flex flex-col space-y-2">
                  <Link to="/" className="hover:text-indigo-200 transition-colors py-1">Dashboard</Link>
                  <Link to="/resume-analysis" className="hover:text-indigo-200 transition-colors py-1">Resume</Link>
                  <Link to="/job-selection" className="hover:text-indigo-200 transition-colors py-1">Jobs</Link>
                  <Link to="/technical-assessment" className="hover:text-indigo-200 transition-colors py-1">Assessment</Link>
                  <Link to="/virtual-interview" className="hover:text-indigo-200 transition-colors py-1">Interview</Link>
                  <Link to="/analytics" className="hover:text-indigo-200 transition-colors py-1">Analytics</Link>
                  <Link to="/about" className="hover:text-indigo-200 transition-colors py-1">About Us</Link>
                </nav>
                <div className="mt-4 pt-2 border-t border-indigo-500 flex justify-between items-center">
                  <span className="text-sm">{user?.name || 'User'}</span>
                  <button 
                    onClick={handleLogout}
                    className="bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded text-sm transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link to="/about" className="hover:text-indigo-200 transition-colors py-1">About Us</Link>
                <div className="flex justify-center mt-2">
                  <Link 
                    to="#" 
                    className="bg-indigo-700 hover:bg-indigo-800 px-3 py-2 rounded-full font-medium transition-colors flex items-center justify-center w-8 h-8"
                    aria-label="Help"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;