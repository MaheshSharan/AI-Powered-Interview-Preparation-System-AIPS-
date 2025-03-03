import { useState } from 'react';
import { create } from 'zustand';

// Use the auth store to check authentication status
const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  setAuth: (authState, userData) => set({ isAuthenticated: authState, user: userData }),
}));

// Mock data for modules progress
const initialModules = [
  { id: 1, name: 'Resume Analysis', completed: false, locked: false },
  { id: 2, name: 'Target Job Selection', completed: false, locked: true },
  { id: 3, name: 'Technical Assessment', completed: false, locked: true },
  { id: 4, name: 'Virtual Interview', completed: false, locked: true },
  { id: 5, name: 'Analytics', completed: false, locked: true },
];

const Dashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [modules, setModules] = useState(initialModules);
  const [showResumeUpload, setShowResumeUpload] = useState(true); // First-time user prompt
  
  // Mock function to handle module selection
  const handleModuleSelect = (moduleId) => {
    const selectedModule = modules.find(m => m.id === moduleId);
    if (selectedModule && !selectedModule.locked) {
      // Navigate to the selected module
      console.log(`Navigating to module: ${selectedModule.name}`);
      // TODO: Implement actual navigation
    }
  };

  // Mock function to handle resume upload
  const handleResumeUpload = (e) => {
    e.preventDefault();
    // TODO: Implement actual file upload and processing
    setShowResumeUpload(false);
    // Unlock the next module after resume upload
    setModules(modules.map(m => 
      m.id === 2 ? { ...m, locked: false } : m
    ));
  };

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    // TODO: Implement actual redirect
    return <div>Please log in to access the dashboard</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome message */}
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-4 bg-white">
            <h2 className="text-xl font-semibold">Welcome, {user?.name || 'User'}!</h2>
            <p className="mt-2 text-gray-600">
              Track your interview preparation progress and access all modules from this dashboard.
            </p>
          </div>
        </div>

        {/* First-time user resume upload prompt */}
        {showResumeUpload && (
          <div className="mt-6 px-4 sm:px-0">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  {/* Info icon */}
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    To get started, please upload your resume. This will help us personalize your interview preparation experience.
                  </p>
                  <div className="mt-4">
                    <button 
                      onClick={handleResumeUpload}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Upload Resume
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modules grid */}
        <div className="mt-8 px-4 sm:px-0">
          <h3 className="text-lg font-medium text-gray-900">Your Preparation Modules</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <div 
                key={module.id} 
                className={`relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 ${module.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => handleModuleSelect(module.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">{module.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {module.completed ? 'Completed' : module.locked ? 'Locked' : 'Available'}
                    </p>
                  </div>
                </div>
                {/* Status indicator */}
                <div>
                  {module.completed ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  ) : module.locked ? (
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Start
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress overview */}
        <div className="mt-8 px-4 sm:px-0">
          <h3 className="text-lg font-medium text-gray-900">Your Progress</h3>
          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${(modules.filter(m => m.completed).length / modules.length) * 100}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {modules.filter(m => m.completed).length} of {modules.length} modules completed
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;