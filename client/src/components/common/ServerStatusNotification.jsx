import { useState, useEffect } from 'react';
import axios from 'axios';

const ServerStatusNotification = () => {
  const [status, setStatus] = useState('checking');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Use the full URL to the health endpoint instead of the relative path
        // since the health endpoint is not under /api
        await axios.get('http://localhost:5000/health');
        setStatus('connected');
      } catch (error) {
        setStatus('disconnected');
      }
    };

    // Check immediately on component mount
    checkServerStatus();

    // Set up interval to check periodically
    const intervalId = setInterval(checkServerStatus, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className={`
          rounded-lg shadow-lg p-4 flex items-center space-x-2
          transition-all duration-300 transform
          ${status === 'connected' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 
            status === 'disconnected' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' : 
            'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500'}
        `}
      >
        <div className="flex-shrink-0">
          {status === 'connected' ? (
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
          ) : status === 'disconnected' ? (
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
          ) : (
            <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse"></div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {status === 'connected' ? 'Connected to server' : 
             status === 'disconnected' ? 'Cannot connect to server' : 
             'Checking server connection...'}
          </p>
          <p className="text-xs opacity-75">
            {status === 'connected' ? 'Backend is operational' : 
             status === 'disconnected' ? 'Please check if the server is running' : 
             'Verifying connection...'}
          </p>
        </div>
        <button 
          onClick={handleClose}
          className="flex-shrink-0 ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ServerStatusNotification;