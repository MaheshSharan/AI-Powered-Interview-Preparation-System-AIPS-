import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarNav from './SidebarNav';
import { 
  ArrowLeftIcon,
  ChartBarIcon,
  CodeBracketIcon as CodeIcon,
  VideoCameraIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

const companies = [
  { id: 'amazon', name: 'Amazon', logo: '/logos/amazon.svg' },
  { id: 'apple', name: 'Apple', logo: '/logos/apple.svg' },
  { id: 'meta', name: 'Meta', logo: '/logos/meta.svg' },
  { id: 'microsoft', name: 'Microsoft', logo: '/logos/microsoft.svg' },
  { id: 'netflix', name: 'Netflix', logo: '/logos/netflix.svg' },
];

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');

  // Set active section based on URL path
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && path !== 'dashboard') {
      setActiveSection(path);
    } else {
      setActiveSection('overview');
    }
  }, [location.pathname]);

  // Determine current step based on selections
  const currentStep = !selectedCompany ? 1 : (!selectedRole ? 2 : (!experienceLevel ? 3 : 4));

  const renderCompanySelection = () => (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center"
      >
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Select Company
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Choose your target company to get personalized interview preparation
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Step {currentStep} of 3
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <motion.button
            key={company.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelectedCompany(company.id)}
            className={`relative flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-lg border ${
              selectedCompany === company.id 
                ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20' 
                : 'border-gray-100 dark:border-slate-700'
            } shadow-sm hover:shadow-md transition-all duration-300 group`}
          >
            <div className="w-24 h-24 mb-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center transition-colors duration-200 group-hover:bg-gray-100 dark:group-hover:bg-slate-700">
              <img 
                src={company.logo} 
                alt={`${company.name} logo`} 
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {company.name}
            </h3>
          </motion.button>
        ))}
      </div>

      {selectedCompany && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8 space-y-6"
        >
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Select Role
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Software Engineer', 'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer', 'DevOps Engineer', 'Mobile Engineer'].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedRole === role
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Experience Level
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Entry Level', 'Mid Level', 'Senior Level'].map((level) => (
                <button
                  key={level}
                  onClick={() => setExperienceLevel(level)}
                  className={`p-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    experienceLevel === level
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setActiveSection('resume');
                navigate('/dashboard/resume');
              }}
              disabled={!selectedRole || !experienceLevel}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors duration-200"
            >
              Continue
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderOverviewStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Progress</p>
            <h3 className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">10%</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <ChartBarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500 dark:text-gray-400">Progress</span>
            <span className="text-gray-700 dark:text-gray-300">10/100</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '10%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-indigo-600 rounded-full" 
            />
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Practice Tests</p>
            <h3 className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">0</h3>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CodeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="mt-4">
          <button 
            onClick={() => setActiveSection('technical')}
            className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
          >
            Start Practice Test
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mock Interviews</p>
            <h3 className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">0</h3>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <VideoCameraIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="mt-4">
          <button 
            onClick={() => setActiveSection('interview')}
            className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
          >
            Schedule Interview
          </button>
        </div>
      </motion.div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'company':
        return renderCompanySelection();
      case 'overview':
        return (
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Here's an overview of your interview preparation progress
                </p>
              </div>
            </motion.div>
            {renderOverviewStats()}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Next Steps
                  </h2>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveSection('company')}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                        Select Target Company
                      </span>
                    </div>
                    <ArrowLeftIcon className="w-5 h-5 text-gray-400 rotate-180 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                  <button 
                    onClick={() => setActiveSection('resume')}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                        Upload Resume
                      </span>
                    </div>
                    <ArrowLeftIcon className="w-5 h-5 text-gray-400 rotate-180 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                  <button 
                    onClick={() => setActiveSection('technical')}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                        Start Technical Practice
                      </span>
                    </div>
                    <ArrowLeftIcon className="w-5 h-5 text-gray-400 rotate-180 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </h2>
                </div>
                <div className="text-sm text-center text-gray-500 dark:text-gray-400 py-8">
                  No recent activity to show
                </div>
              </motion.div>
            </div>
          </div>
        );
      default:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center h-full"
          >
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">
              Coming Soon...
            </h2>
          </motion.div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div className="hidden lg:block w-64 border-r border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800">
        <SidebarNav activeSection={activeSection} setActiveSection={setActiveSection} />
      </div>

      {/* Vertical separator line */}
      <div className="hidden lg:block w-px bg-slate-700"></div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {renderContent()}
          </div>
        </main>
        <div className="h-px bg-slate-700"></div>
      </div>
    </div>
  );
};

export default Dashboard;
