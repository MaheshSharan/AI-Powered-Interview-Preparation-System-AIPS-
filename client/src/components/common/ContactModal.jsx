import { motion, AnimatePresence } from 'framer-motion';
import { FaLinkedin, FaEnvelope, FaTimes } from 'react-icons/fa';

const ContactModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative transform overflow-hidden rounded-lg bg-slate-900 border border-slate-800 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
              >
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-2xl font-semibold leading-6 text-white mb-8">
                      Contact Me
                    </h3>
                    <div className="mt-4 space-y-6">
                      <a
                        href="https://www.linkedin.com/in/mahesh-sharan/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors duration-200"
                      >
                        <FaLinkedin className="h-8 w-8 text-[#0A66C2]" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-white">LinkedIn</p>
                          <p className="text-sm text-gray-400">Connect with me on LinkedIn</p>
                        </div>
                      </a>

                      <a
                        href="mailto:maheshsharan28@gmail.com"
                        className="flex items-center p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors duration-200"
                      >
                        <FaEnvelope className="h-8 w-8 text-[#EA4335]" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-white">Email</p>
                          <p className="text-sm text-gray-400">maheshsharan28@gmail.com</p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ContactModal;
