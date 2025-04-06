import { motion } from 'framer-motion';
import { XMarkIcon, ShieldCheckIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const TermsModal = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
      >
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="h-6 w-6 text-indigo-500" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Terms & Privacy Notice</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Your Privacy is Important</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Before proceeding with the interview session, please be aware of how your data will be handled:
            </p>
            
            <ul className="mt-4 space-y-3">
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">
                  <strong>No Video/Audio Storage:</strong> Your camera and microphone streams are processed locally in your browser and are not recorded or stored on our servers.
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">
                  <strong>Local Processing:</strong> All behavioral analysis is performed on your device. No video or audio data leaves your computer.
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">
                  <strong>Results Only:</strong> Only the final results and analytics from your interview sessions are saved to help improve your performance.
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">
                  <strong>Your Data Control:</strong> You can delete your interview history and results at any time from your account settings.
                </span>
              </li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Interview Guidelines</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              For the best interview experience:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-indigo-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">
                  Find a quiet, well-lit environment with minimal distractions
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-indigo-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">
                  Position your camera at eye level and center yourself in the frame
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-indigo-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">
                  Test your microphone before starting to ensure clear audio
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-slate-700 p-4 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onAccept}
            className="flex items-center px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Accept & Continue
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsModal;
