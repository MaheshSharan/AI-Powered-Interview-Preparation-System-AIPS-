import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import { create } from 'zustand';

// Landing Page Component
import HeroSection from './components/landing/HeroSection';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ServerStatusNotification from './components/common/ServerStatusNotification';

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
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Create a simple auth store
const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  loading: true,
  setAuth: (isAuthenticated, user) => set({ isAuthenticated, user }),
  logout: () => {
    localStorage.removeItem('token');
    set({ isAuthenticated: false, user: null });
  },
  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isAuthenticated: false, user: null, loading: false });
        return;
      }
      
      const res = await axios.get('/auth/me');
      set({ isAuthenticated: true, user: res.data.user, loading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ isAuthenticated: false, user: null, loading: false });
    }
  }
}));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  const { checkAuth, loading, isAuthenticated } = useAuthStore();
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

  if (!initialized && loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen w-full dark:bg-dark-primary dark:text-dark-text transition-colors duration-300">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="flex-grow w-full px-4 py-8">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/about" element={<AboutUs />} />
            
            <Route path="/" element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <HeroSection />
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
        <ServerStatusNotification />
      </div>
    </Router>
  );
}

export default App;
