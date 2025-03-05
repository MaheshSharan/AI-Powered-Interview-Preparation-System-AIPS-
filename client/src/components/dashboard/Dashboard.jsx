import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 pt-10"
    >
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <span className="text-2xl font-semibold text-indigo-500">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Welcome back, {user?.name || 'User'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Dashboard content will go here */}
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Your Progress
            </h2>
            <div className="space-y-4">
              {/* Progress items will go here */}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;