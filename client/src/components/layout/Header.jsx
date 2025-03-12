import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import ContactModal from '../common/ContactModal';
import { 
  BellIcon,
  Cog6ToothIcon as SettingsIcon,
  ArrowRightOnRectangleIcon as SignOutIcon,
  ChevronDownIcon,
  Bars3Icon as MenuIcon
} from '@heroicons/react/24/outline';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Handle clicks outside of dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isMainPage = location.pathname === '/';
  const showMainNav = isMainPage || !isAuthenticated;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b-2 border-slate-800/80">
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
            <div className="hidden lg:block h-8 w-px bg-slate-800"></div>

            {/* Mobile menu button */}
            <div className="md:hidden pr-2" ref={mobileMenuRef}>
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center pr-2 space-x-1 flex-1 justify-end">
              {showMainNav ? (
                <>
                  <Link
                    to="/"
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      location.pathname === '/' 
                        ? 'bg-white/10 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Home
                  </Link>

                  <Link
                    to="/about"
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      location.pathname === '/about' 
                        ? 'bg-white/10 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    About Us
                  </Link>

                  <Link
                    onClick={() => setShowContactModal(true)}
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    Contact
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-1">
                  {/* Notification Icon */}
                  <div className="relative" ref={notificationRef}>
                    <Link
                      to="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowNotifications(!showNotifications);
                      }}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        showNotifications 
                          ? 'bg-white/10 text-white' 
                          : 'text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <BellIcon className="w-5 h-5" />
                      <span className="absolute top-2 right-3 w-2 h-2 bg-purple-500 rounded-full"></span>
                    </Link>
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-slate-900 rounded-lg shadow-lg border border-slate-800 py-2">
                        <div className="px-4 py-2 border-b border-slate-800">
                          <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        </div>
                        <div className="px-4 py-2 text-sm text-slate-400">
                          No new notifications
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Menu */}
                  <div className="relative" ref={dropdownRef}>
                    <Link
                      to="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDropdown(!showDropdown);
                      }}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        showDropdown 
                          ? 'bg-white/10 text-white' 
                          : 'text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>Hi, {user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : 'User'}</span>
                      <ChevronDownIcon className={`ml-2 w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                    </Link>
                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-slate-900 rounded-lg shadow-lg border border-slate-800 py-2">
                        <Link
                          to="/dashboard/settings"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/10"
                        >
                          <SettingsIcon className="w-5 h-5 mr-3" />
                          <span>Settings</span>
                        </Link>
                        <Link
                          to="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowDropdown(false);
                            handleLogout();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/10"
                        >
                          <SignOutIcon className="w-5 h-5 mr-3" />
                          <span>Sign Out</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </nav>

            {/* Mobile menu */}
            {showMobileMenu && (
              <div className="absolute top-16 left-0 right-0 bg-slate-900 border-t border-slate-800 md:hidden py-4">
                <div className="px-4 space-y-1">
                  {showMainNav ? (
                    <>
                      <Link
                        to="/"
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          location.pathname === '/' 
                            ? 'bg-white/10 text-white' 
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Home
                      </Link>
                      <Link
                        to="/about"
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          location.pathname === '/about' 
                            ? 'bg-white/10 text-white' 
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        About Us
                      </Link>
                      <button
                        onClick={() => setShowContactModal(true)}
                        className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        Contact
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowNotifications(!showNotifications);
                        }}
                        className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        <BellIcon className="w-5 h-5 mr-3" />
                        <span>Notifications</span>
                      </Link>
                      {showNotifications && (
                        <div className="mt-2 mx-4 p-3 bg-white/5 rounded-lg">
                          <div className="text-sm text-slate-400">
                            No new notifications
                          </div>
                        </div>
                      )}
                      <Link
                        to="/dashboard/settings"
                        className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        <SettingsIcon className="w-5 h-5 mr-3" />
                        <span>Settings</span>
                      </Link>
                      <Link
                        to="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleLogout();
                        }}
                        className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        <SignOutIcon className="w-5 h-5 mr-3" />
                        <span>Sign Out</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ContactModal 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)} 
      />
    </>
  );
};

export default Header;