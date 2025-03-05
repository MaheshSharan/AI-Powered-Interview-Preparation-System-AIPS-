import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import { FaHome, FaEnvelope, FaInfoCircle, FaUser, FaSignOutAlt, FaCog, FaUserEdit, FaBars, FaTimes } from 'react-icons/fa';
import ContactModal from '../common/ContactModal';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  const isDashboard = location.pathname === '/dashboard';

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

  const toggleSettingsDropdown = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
  };

  const isActive = (path) => location.pathname === path;

  const baseClasses = "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-white hover:text-white/80";
  const activeClasses = "bg-white/10";
  const dropdownClasses = "flex items-center space-x-2 w-full text-white hover:text-white/80 px-4 py-2 transition-all duration-200";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-11xl mx-auto">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center pl-5">
              <div className="relative">
                <span className="text-3xl font-bold bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] text-transparent bg-clip-text font-outfit tracking-tight">
                  AIPS
                </span>
                <span className="absolute -top-1 -right-9.5 text-[10px] font-bold text-white bg-gradient-to-r from-indigo-600/80 to-purple-600/80 px-1.5 py-0.5 rounded-sm tracking-wider font-outfit">
                  BETA
                </span>
              </div>
            </Link>

            {/* Mobile menu button */}
            <div className="md:hidden pr-2">
              <button 
                onClick={toggleMenu}
                className="text-white hover:text-white/80 focus:outline-none"
              >
                {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center pr-2 space-x-1">
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
              ) : (
                <div className="flex items-center space-x-1">
                  <Link
                    to="#"
                    className={`${baseClasses} ${activeClasses}`}
                  >
                    <FaUser className="w-4 h-4 text-white" />
                    <span className="text-white font-outfit">Hi, {user?.name || 'User'}</span>
                  </Link>

                  <div className="relative">
                    <Link
                      onClick={toggleSettingsDropdown}
                      className={`${baseClasses} ${showSettingsDropdown ? activeClasses : ''}`}
                    >
                      <FaCog className="w-4 h-4 text-white" />
                      <span className="text-white font-outfit">Settings</span>
                    </Link>
                    {showSettingsDropdown && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                          <Link
                            to="/update-profile"
                            className={dropdownClasses}
                          >
                            <FaUserEdit className="w-4 h-4" />
                            <span>Update Profile</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    onClick={handleLogout}
                    className={baseClasses}
                  >
                    <FaSignOutAlt className="w-4 h-4 text-white" />
                    <span className="text-white font-outfit">Sign Out</span>
                  </Link>
                </div>
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
                  ) : (
                    <>
                      <Link
                        to="#"
                        className={`${baseClasses} ${activeClasses}`}
                      >
                        <FaUser className="w-4 h-4 text-white" />
                        <span className="text-white font-outfit">Hi, {user?.name || 'User'}</span>
                      </Link>

                      <div className="space-y-2">
                        <Link
                          onClick={toggleSettingsDropdown}
                          className={`${baseClasses} ${showSettingsDropdown ? activeClasses : ''}`}
                        >
                          <FaCog className="w-4 h-4 text-white" />
                          <span className="text-white font-outfit">Settings</span>
                        </Link>
                        {showSettingsDropdown && (
                          <div className="ml-4 space-y-2">
                            <Link
                              to="/update-profile"
                              className={dropdownClasses}
                              onClick={() => setShowMobileMenu(false)}
                            >
                              <FaUserEdit className="w-4 h-4" />
                              <span>Update Profile</span>
                            </Link>
                          </div>
                        )}
                      </div>

                      <Link
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className={baseClasses}
                      >
                        <FaSignOutAlt className="w-4 h-4 text-white" />
                        <span className="text-white font-outfit">Sign Out</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
    </>
  );
};

export default Header;