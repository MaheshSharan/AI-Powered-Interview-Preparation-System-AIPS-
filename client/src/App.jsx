import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from './store/authStore';
import { AnimatePresence } from 'framer-motion';

// Landing Page Component
import HeroSection from './components/landing/HeroSection';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ServerStatusNotification from './components/common/ServerStatusNotification';
import LoadingScreen from './components/common/LoadingScreen';

// Auth Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './components/dashboard/Dashboard';

// About Component
import AboutUs from './components/about/AboutUs';

// Set default axios base URL
axios.defaults.baseURL = 'http://localhost:5000/api';

// Add auth token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? children : null;
};

function App() {
  const { checkAuth, loading } = useAuthStore();
  const [initialized, setInitialized] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  useEffect(() => {
    const initApp = async () => {
      await checkAuth();
      setInitialized(true);
    };
    
    initApp();
  }, [checkAuth]);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    let timeoutId;
    const mainContent = document.querySelector('main');

    const handleScroll = () => {
      if (mainContent) {
        // Show scrollbar
        mainContent.classList.add('is-scrolling');
        
        // Clear any existing timeout
        clearTimeout(timeoutId);
        
        // Hide scrollbar after 1 second of no scrolling
        timeoutId = setTimeout(() => {
          mainContent.classList.remove('is-scrolling');
        }, 1000);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  if (!initialized && loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="flex-1 w-full mt-16 custom-scrollbar">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HeroSection />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route 
                path="/dashboard/*" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/about" element={<AboutUs />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
        <ServerStatusNotification />
      </div>
    </Router>
  );
}

export default App;
