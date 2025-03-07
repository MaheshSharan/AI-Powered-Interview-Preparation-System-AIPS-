import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import { FaHome, FaEnvelope, FaInfoCircle, FaUser, FaSignOutAlt, FaBars, FaTimes, FaBell, FaCog } from 'react-icons/fa';
import ContactModal from '../common/ContactModal';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isDashboard = location.pathname.includes('/dashboard');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const isActive = (path) => location.pathname === path;

  const baseClasses = "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-white hover:text-white/80 hover:bg-white/10";
  const activeClasses = "bg-white/10";
  const dropdownClasses = "flex items-center space-x-2 w-full text-white hover:text-white/80 px-4 py-2 transition-all duration-200 hover:bg-white/10";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm">
        <div className="max-w-11xl mx-auto">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="w-64 flex justify-center items-center">
              <Link to="/" className="flex items-center">
                <div className="relative">
                  <span className="text-3xl font-bold bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] text-transparent bg-clip-text font-outfit tracking-tight">
                    AIPS
                  </span>
                  <span className="absolute -top-1 -right-9.5 text-[10px] font-bold text-white bg-gradient-to-r from-indigo-600/80 to-purple-600/80 px-1.5 py-0.5 rounded-sm tracking-wider font-outfit">
                    BETA
                  </span>
                </div>
              </Link>
            </div>

            {/* Vertical separator line */}
            <div className="hidden lg:block h-8 w-px bg-slate-700 dark:bg-slate-700"></div>

            {/* Mobile menu button */}
            <div className="md:hidden pr-2">
              <button 
                onClick={toggleMenu}
                className="text-white hover:text-white/80 focus:outline-none transition-all duration-200"
              >
                {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center pr-2 space-x-1 flex-1 justify-end">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/"
                    className={`${baseClasses} ${isActive('/') ? activeClasses : ''}`}
                  >
                    <FaHome className="w-4 h-4 text-white" />
                    <span className="text-white font-outfit">Home</span>
                  </Link>

                  <Link
                    onClick={() => setShowContactModal(true)}
                    className={baseClasses}
                  >
                    <FaEnvelope className="w-4 h-4 text-white" />
                    <span className="text-white font-outfit">Contact</span>
                  </Link>

                  <Link
                    to="/about"
                    className={`${baseClasses} ${isActive('/about') ? activeClasses : ''}`}
                  >
                    <FaInfoCircle className="w-4 h-4 text-white" />
                    <span className="text-white font-outfit">About Us</span>
                  </Link>
                </>
              ) : isDashboard ? (
                <div className="flex items-center space-x-1">
                  <Link
                    to="#"
                    onClick={toggleNotifications}
                    className={`${baseClasses} ${showNotifications ? activeClasses : ''}`}
                  >
                    <div className="relative">
                      <FaBell className="w-4 h-4 text-white" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500"></span>
                    </div>
                  </Link>

                  <div className="relative">
                    <Link
                      to="#"
                      onClick={toggleProfileDropdown}
                      className={`${baseClasses} ${showProfileDropdown ? activeClasses : ''}`}
                    >
                      <FaUser className="w-4 h-4 text-white" />
                      <span className="text-white font-outfit">Hi, {user?.name || 'User'}</span>
                    </Link>
                    
                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <Link 
                            to="/dashboard/settings" 
                            className={dropdownClasses}
                          >
                            <FaCog className="w-4 h-4 text-white" />
                            <span className="text-white font-outfit">Settings</span>
                          </Link>
                          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-1 opacity-50"></div>
                          <Link 
                            onClick={handleLogout}
                            className={dropdownClasses}
                          >
                            <FaSignOutAlt className="w-4 h-4 text-white" />
                            <span className="text-white font-outfit">Sign Out</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    to="/"
                    className={`${baseClasses} ${isActive('/') ? activeClasses : ''}`}
                  >
                    <FaHome className="w-4 h-4 text-white" />
                    <span className="text-white font-outfit">Home</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    className={`${baseClasses} ${location.pathname.includes('/dashboard') ? activeClasses : ''}`}
                  >
                    <FaUser className="w-4 h-4 text-white" />
                    <span className="text-white font-outfit">Dashboard</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile menu */}
            {isMenuOpen && (
              <div className="md:hidden py-4 px-6">
                <div className="flex flex-col space-y-2">
                  {!isAuthenticated ? (
                    <>
                      <Link
                        to="/"
                        className={`${baseClasses} ${isActive('/') ? activeClasses : ''}`}
                      >
                        <FaHome className="w-4 h-4 text-white" />
                        <span className="text-white font-outfit">Home</span>
                      </Link>

                      <button
                        onClick={() => setShowContactModal(true)}
                        className={baseClasses}
                      >
                        <FaEnvelope className="w-4 h-4 text-white" />
                        <span className="text-white font-outfit">Contact</span>
                      </button>

                      <Link
                        to="/about"
                        className={`${baseClasses} ${isActive('/about') ? activeClasses : ''}`}
                      >
                        <FaInfoCircle className="w-4 h-4 text-white" />
                        <span className="text-white font-outfit">About Us</span>
                      </Link>
                    </>
                  ) : isDashboard ? (
                    <>
                      <div className="flex items-center justify-between">
                        <Link
                          to="#"
                          onClick={toggleNotifications}
                          className={`${baseClasses} ${showNotifications ? activeClasses : ''}`}
                        >
                          <div className="relative">
                            <FaBell className="w-4 h-4 text-white" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500"></span>
                          </div>
                        </Link>
                        
                        <Link
                          to="#"
                          onClick={toggleProfileDropdown}
                          className={`flex-1 ${baseClasses} ${showProfileDropdown ? activeClasses : ''}`}
                        >
                          <FaUser className="w-4 h-4 text-white" />
                          <span className="text-white font-outfit">Hi, {user?.name || 'User'}</span>
                        </Link>
                      </div>

                      {showProfileDropdown && (
                        <div className="ml-4 space-y-2 bg-slate-800/50 p-3 rounded-lg">
                          <Link 
                            to="/dashboard/settings" 
                            className="flex items-center space-x-2 py-2 text-white"
                          >
                            <FaCog className="w-4 h-4 text-white" />
                            <span className="text-white font-outfit">Settings</span>
                          </Link>
                          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-1 opacity-50"></div>
                          <Link 
                            onClick={handleLogout}
                            className="flex items-center space-x-2 py-2 text-white"
                          >
                            <FaSignOutAlt className="w-4 h-4 text-white" />
                            <span className="text-white font-outfit">Sign Out</span>
                          </Link>
                        </div>
                      )}

                      {showNotifications && (
                        <div className="ml-4 space-y-2 bg-slate-800/50 p-3 rounded-lg">
                          <h3 className="text-sm font-medium text-white mb-2">Recent Notifications</h3>
                          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-2 opacity-50"></div>
                          <p className="text-sm text-gray-300 py-2">No new notifications</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Link
                        to="/"
                        className={`${baseClasses} ${isActive('/') ? activeClasses : ''}`}
                      >
                        <FaHome className="w-4 h-4 text-white" />
                        <span className="text-white font-outfit">Home</span>
                      </Link>

                      <Link
                        to="/dashboard"
                        className={`${baseClasses} ${location.pathname.includes('/dashboard') ? activeClasses : ''}`}
                      >
                        <FaUser className="w-4 h-4 text-white" />
                        <span className="text-white font-outfit">Dashboard</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="h-px bg-slate-700 dark:bg-slate-700"></div>
      </header>
      {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}
    </>
  );
};

export default Header;