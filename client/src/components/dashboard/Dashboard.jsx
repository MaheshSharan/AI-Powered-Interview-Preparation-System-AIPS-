import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import SidebarNav from './SidebarNav';
import Overview from './sections/Overview';
import CompanySelection from './sections/CompanySelection';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('overview');

  // Set active section based on URL path
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && path !== 'dashboard') {
      setActiveSection(path);
    } else {
      setActiveSection('overview');
    }
  }, [location.pathname]);

  // Render the appropriate section based on activeSection
  const renderSection = () => {
    switch (activeSection) {
      case 'company':
        return <CompanySelection />;
      case 'resume':
        return <div className="p-8"><h1 className="text-2xl font-semibold">Resume Analysis</h1><p>Coming soon...</p></div>;
      case 'technical':
        return <div className="p-8"><h1 className="text-2xl font-semibold">Technical Assessment</h1><p>Coming soon...</p></div>;
      case 'interview':
        return <div className="p-8"><h1 className="text-2xl font-semibold">Virtual Interview</h1><p>Coming soon...</p></div>;
      case 'analytics':
        return <div className="p-8"><h1 className="text-2xl font-semibold">Analytics</h1><p>Coming soon...</p></div>;
      case 'settings':
        return <div className="p-8"><h1 className="text-2xl font-semibold">Settings</h1><p>Coming soon...</p></div>;
      case 'support':
        return <div className="p-8"><h1 className="text-2xl font-semibold">Support</h1><p>Coming soon...</p></div>;
      case 'documentation':
        return <div className="p-8"><h1 className="text-2xl font-semibold">Documentation</h1><p>Coming soon...</p></div>;
      case 'overview':
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white">
      {/* Sidebar - with fixed position and no scroll */}
      <div className="hidden md:block w-64 flex-shrink-0 fixed h-screen overflow-hidden border-r border-gray-200 dark:border-slate-700">
        <SidebarNav activeSection={activeSection} setActiveSection={setActiveSection} />
      </div>

      {/* Main content - with left margin to accommodate fixed sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        {/* Mobile sidebar toggle */}
        <div className="md:hidden p-4 flex items-center justify-between bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <button
            className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={() => document.getElementById('mobile-sidebar').classList.toggle('hidden')}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-semibold">AIPS Dashboard</span>
        </div>

        {/* Mobile sidebar */}
        <div id="mobile-sidebar" className="md:hidden fixed inset-0 z-40 hidden">
          <div className="absolute inset-0 bg-gray-600 dark:bg-slate-900 opacity-75" onClick={() => document.getElementById('mobile-sidebar').classList.add('hidden')}></div>
          <div className="relative w-64 h-full border-r border-gray-200 dark:border-slate-700">
            <SidebarNav activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
