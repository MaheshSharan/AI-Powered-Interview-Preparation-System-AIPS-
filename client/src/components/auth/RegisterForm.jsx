import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import LoadingScreen from '../common/LoadingScreen';

const RegisterForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info (Step 1)
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Profile Details (Step 2)
    educationStatus: 'student',
    university: '',
    graduationYear: '',
    major: '',
    workStatus: 'seeking',
    experience: 0,
    targetRole: '',
    linkedinUrl: '',
    githubUrl: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.university || !formData.graduationYear || !formData.major || !formData.targetRole) {
      setError('Please fill in all required fields');
      return false;
    }
    const currentYear = new Date().getFullYear();
    const gradYear = parseInt(formData.graduationYear);
    if (isNaN(gradYear) || gradYear < currentYear - 50 || gradYear > currentYear + 10) {
      setError('Please enter a valid graduation year');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateStep2()) {
      setLoading(false);
      return;
    }

    try {
      await axios.post('/auth/register', formData);
      setSuccess(true);
      setLoading(false);
      // Wait 2 seconds before redirecting
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (validateStep1()) {
      setError('');
      setStep(2);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={(e) => {
          setFormData({ ...formData, name: e.target.value });
          setError('');
        }}
        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email address"
        value={formData.email}
        onChange={(e) => {
          setFormData({ ...formData, email: e.target.value });
          setError('');
        }}
        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => {
          setFormData({ ...formData, password: e.target.value });
          setError('');
        }}
        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
        required
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={(e) => {
          setFormData({ ...formData, confirmPassword: e.target.value });
          setError('');
        }}
        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
        required
      />
      <button 
        type="button" 
        onClick={handleProceed}
        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-300"
      >
        Proceed
      </button>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      <select
        name="educationStatus"
        value={formData.educationStatus}
        onChange={(e) => {
          setFormData({ ...formData, educationStatus: e.target.value });
          setError('');
        }}
        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
      >
        <option value="student">Student</option>
        <option value="graduate">Graduate</option>
      </select>
      <input
        type="text"
        name="university"
        placeholder="University"
        value={formData.university}
        onChange={(e) => {
          setFormData({ ...formData, university: e.target.value });
          setError('');
        }}
        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
        required
      />
      <input
        type="text"
        name="graduationYear"
        placeholder="Graduation Year"
        value={formData.graduationYear}
        onChange={(e) => {
          setFormData({ ...formData, graduationYear: e.target.value });
          setError('');
        }}
        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
        required
      />
      <input
        type="text"
        name="major"
        placeholder="Major"
        value={formData.major}
        onChange={(e) => {
          setFormData({ ...formData, major: e.target.value });
          setError('');
        }}
        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
        required
      />
      <select
        name="workStatus"
        value={formData.workStatus}
        onChange={(e) => {
          setFormData({ ...formData, workStatus: e.target.value });
          setError('');
        }}
        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
      >
        <option value="seeking">Seeking</option>
        <option value="employed">Employed</option>
      </select>
      <input
        type="number"
        name="experience"
        placeholder="Experience (years)"
        value={formData.experience}
        onChange={(e) => {
          setFormData({ ...formData, experience: e.target.value });
          setError('');
        }}
        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
      />
      <input
        type="text"
        name="targetRole"
        placeholder="Target Role"
        value={formData.targetRole}
        onChange={(e) => {
          setFormData({ ...formData, targetRole: e.target.value });
          setError('');
        }}
        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
        required
      />
      <button 
        type="submit" 
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Account...
          </span>
        ) : 'Create Account'}
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-indigo-500/30"
      />
      
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className="rounded-lg backdrop-blur-sm shadow-lg p-4 flex items-center space-x-3 bg-slate-800/80 border border-[#646cff]/30">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 rounded-full bg-[#646cff] animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Registration successful!</p>
                <p className="text-xs text-gray-400">Redirecting to login...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && <LoadingScreen />}
      <div className="w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-slate-700/50"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-2">Create Account</h2>
          <p className="text-slate-400 text-center mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in here
            </Link>
          </p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-lg backdrop-blur-sm shadow-lg p-4 flex items-center space-x-3 bg-slate-800/80 border border-red-500/30 mb-4"
              >
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 ? renderStep1() : renderStep2()}
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterForm;