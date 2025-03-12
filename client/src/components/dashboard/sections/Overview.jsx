import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  CodeBracketIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../../store/authStore';
import useProgressStore from '../../../store/progressStore';
import useCompanyStore from '../../../store/companyStore';
import LoadingScreen from '../../common/LoadingScreen';

const Overview = () => {
  const { user } = useAuthStore();
  const { 
    companySelection, 
    resumeAnalysis, 
    technicalAssessment, 
    virtualInterview, 
    overallCompletion,
    getNextStep 
  } = useProgressStore();
  const { selectedCompany, selectedRole } = useCompanyStore();
  const [loading, setLoading] = useState(true);
  
  // Determine next step
  const nextStep = getNextStep();
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const renderWelcomeCard = () => (
    <motion.div 
      variants={itemVariants}
      className="col-span-12 lg:col-span-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg overflow-hidden"
    >
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {user?.name ? user.name.split(' ')[0] : 'User'}!
            </h2>
            <p className="mt-2 text-indigo-100">
              Continue your interview preparation journey
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-800/40 text-white">
              <ClockIcon className="w-4 h-4 mr-1" />
              Last login: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-white/20">
                <BuildingOfficeIcon className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-indigo-100">Target Company</p>
                <p className="text-sm font-semibold text-white">
                  {selectedCompany ? 
                    (selectedCompany.charAt(0).toUpperCase() + selectedCompany.slice(1)) : 
                    'Not Selected'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-white/20">
                <DocumentTextIcon className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-indigo-100">Resume Status</p>
                <p className="text-sm font-semibold text-white">
                  {resumeAnalysis ? 'Analyzed' : 'Not Uploaded'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-white/20">
                <VideoCameraIcon className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-indigo-100">Interviews</p>
                <p className="text-sm font-semibold text-white">
                  {(technicalAssessment ? 1 : 0) + (virtualInterview ? 1 : 0)} Completed
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Link
            to={`/dashboard/${nextStep}`}
            className="inline-flex items-center px-4 py-2 bg-white text-indigo-700 rounded-lg font-medium text-sm hover:bg-indigo-50 transition-colors duration-200"
          >
            {companySelection ? 'Continue' : 'Get Started'}
            <ArrowRightIcon className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );

  const renderProgressCard = () => (
    <motion.div 
      variants={itemVariants}
      className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden"
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Your Progress
        </h3>
        
        <div className="mt-6 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Overall Completion</span>
              <span className="text-gray-700 dark:text-gray-300">{overallCompletion}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${overallCompletion}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-indigo-600 rounded-full" 
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Company Selection</span>
              <span className="text-gray-700 dark:text-gray-300">{companySelection ? '1/1' : '0/1'}</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: companySelection ? '100%' : '0%' }}
                transition={{ duration: 1, delay: 0.6 }}
                className="h-full bg-indigo-600 rounded-full" 
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Resume Analysis</span>
              <span className="text-gray-700 dark:text-gray-300">{resumeAnalysis ? '1/1' : '0/1'}</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: resumeAnalysis ? '100%' : '0%' }}
                transition={{ duration: 1, delay: 0.7 }}
                className="h-full bg-indigo-600 rounded-full" 
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Interview Practice</span>
              <span className="text-gray-700 dark:text-gray-300">
                {(technicalAssessment ? 1 : 0) + (virtualInterview ? 1 : 0)}/2
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((technicalAssessment ? 1 : 0) + (virtualInterview ? 1 : 0)) * 50}%` }}
                transition={{ duration: 1, delay: 0.8 }}
                className="h-full bg-indigo-600 rounded-full" 
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderNextStepsCard = () => (
    <motion.div 
      variants={itemVariants}
      className="col-span-12 md:col-span-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden"
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
          Next Steps
        </h3>
        
        <div className="mt-4 space-y-3">
          <div className="flex items-start">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full ${companySelection ? 'bg-green-100 dark:bg-green-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'} flex items-center justify-center`}>
              {companySelection ? (
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">1</span>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${companySelection ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                Select Target Company
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {companySelection ? 'Completed' : 'Choose your target company to get personalized preparation'}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full ${resumeAnalysis ? 'bg-green-100 dark:bg-green-900/30' : (!companySelection ? 'bg-gray-100 dark:bg-gray-700' : 'bg-indigo-100 dark:bg-indigo-900/30')} flex items-center justify-center`}>
              {resumeAnalysis ? (
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <span className={`text-sm font-medium ${!companySelection ? 'text-gray-500 dark:text-gray-400' : 'text-indigo-600 dark:text-indigo-400'}`}>2</span>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${resumeAnalysis ? 'text-green-600 dark:text-green-400' : (!companySelection ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white')}`}>
                Upload Your Resume
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {resumeAnalysis ? 'Completed' : 'Get personalized feedback based on your experience'}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full ${technicalAssessment ? 'bg-green-100 dark:bg-green-900/30' : (!resumeAnalysis ? 'bg-gray-100 dark:bg-gray-700' : 'bg-indigo-100 dark:bg-indigo-900/30')} flex items-center justify-center`}>
              {technicalAssessment ? (
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <span className={`text-sm font-medium ${!resumeAnalysis ? 'text-gray-500 dark:text-gray-400' : 'text-indigo-600 dark:text-indigo-400'}`}>3</span>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${technicalAssessment ? 'text-green-600 dark:text-green-400' : (!resumeAnalysis ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white')}`}>
                Complete Technical Assessment
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {technicalAssessment ? 'Completed' : 'Test your technical skills with company-specific questions'}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full ${virtualInterview ? 'bg-green-100 dark:bg-green-900/30' : (!technicalAssessment ? 'bg-gray-100 dark:bg-gray-700' : 'bg-indigo-100 dark:bg-indigo-900/30')} flex items-center justify-center`}>
              {virtualInterview ? (
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <span className={`text-sm font-medium ${!technicalAssessment ? 'text-gray-500 dark:text-gray-400' : 'text-indigo-600 dark:text-indigo-400'}`}>4</span>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${virtualInterview ? 'text-green-600 dark:text-green-400' : (!technicalAssessment ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white')}`}>
                Practice Virtual Interview
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {virtualInterview ? 'Completed' : 'Simulate a real interview with AI-powered feedback'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderResourcesCard = () => (
    <motion.div 
      variants={itemVariants}
      className="col-span-12 md:col-span-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden"
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <ExclamationCircleIcon className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
          Resources & Tips
        </h3>
        
        <div className="mt-4 space-y-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Company Research</h4>
            <p className="mt-1 text-xs text-indigo-600/80 dark:text-indigo-300/80">
              Research your target company's values, culture, and interview process before starting.
            </p>
          </div>
          
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Resume Optimization</h4>
            <p className="mt-1 text-xs text-indigo-600/80 dark:text-indigo-300/80">
              Tailor your resume to highlight skills relevant to the position you're applying for.
            </p>
          </div>
          
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Practice Regularly</h4>
            <p className="mt-1 text-xs text-indigo-600/80 dark:text-indigo-300/80">
              Consistent practice with our virtual interviews will improve your confidence and performance.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {loading ? (
        <LoadingScreen />
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-12 gap-6"
        >
          {renderWelcomeCard()}
          {renderProgressCard()}
          {renderNextStepsCard()}
          {renderResourcesCard()}
        </motion.div>
      )}
    </div>
  );
};

export default Overview;
