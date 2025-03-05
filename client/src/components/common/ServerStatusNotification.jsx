import { useState, useEffect } from 'react';
import { motion,AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ServerStatusNotification = () => {
  const [status, setStatus] = useState('checking');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        await axios.get('http://localhost:5000/health');
        setStatus('connected');
        // Auto-hide after 2 seconds if connected
        setTimeout(() => {
          setVisible(false);
        }, 2000);
      } catch (error) {
        setStatus('disconnected');
        setVisible(true); // Keep visible if disconnected
      }
    };

    checkServerStatus();
    const intervalId = setInterval(checkServerStatus, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className={`
            rounded-lg backdrop-blur-sm shadow-lg p-4 flex items-center space-x-3
            ${status === 'connected' 
              ? 'bg-slate-800/80 border border-[#646cff]/30' 
              : status === 'disconnected' 
                ? 'bg-slate-800/80 border border-red-500/30' 
                : 'bg-slate-800/80 border border-yellow-500/30'
            }
          `}>
            <div className="flex-shrink-0">
              <div className={`
                h-2 w-2 rounded-full
                ${status === 'connected' 
                  ? 'bg-[#646cff] animate-pulse' 
                  : status === 'disconnected' 
                    ? 'bg-red-500' 
                    : 'bg-yellow-500 animate-pulse'
                }
              `} />
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                {status === 'connected' 
                  ? 'Connected to server' 
                  : status === 'disconnected' 
                    ? 'Cannot connect to server' 
                    : 'Checking server connection...'}
              </p>
              <p className="text-xs text-gray-400">
                {status === 'connected' 
                  ? 'Backend is operational' 
                  : status === 'disconnected' 
                    ? 'Please check if the server is running' 
                    : 'Verifying connection...'}
              </p>
            </div>

            {status === 'disconnected' && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServerStatusNotification;