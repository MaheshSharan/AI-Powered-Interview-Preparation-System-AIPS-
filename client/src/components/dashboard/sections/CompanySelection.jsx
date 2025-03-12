import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../../store/authStore';
import useCompanyStore from '../../../store/companyStore';
import useProgressStore from '../../../store/progressStore';
import LoadingScreen from '../../common/LoadingScreen';

// Company data with proper logos and information
const companies = [
  {
    id: 'tcs',
    name: 'TCS',
    fullName: 'Tata Consultancy Services',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Tata_Consultancy_Services_Logo.svg/512px-Tata_Consultancy_Services_Logo.svg.png',
    description: 'Global leader in IT services, consulting, and business solutions with a large presence in India and worldwide.',
    roles: ['ASE', 'SE', 'Systems Engineer', 'Digital Specialist', 'Business Analyst']
  },
  {
    id: 'infosys',
    name: 'Infosys',
    fullName: 'Infosys Limited',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/512px-Infosys_logo.svg.png',
    description: 'Global leader in next-generation digital services and consulting, helping clients navigate their digital transformation.',
    roles: ['Systems Engineer', 'SDE', 'Power Programmer', 'Digital Specialist', 'Business Analyst']
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    fullName: 'Microsoft Corporation',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png',
    description: 'Technology company developing and supporting software, services, devices, and solutions that deliver new opportunities.',
    roles: ['SDE', 'Software Engineer', 'Program Manager', 'Data Scientist', 'Cloud Solutions Architect']
  },
  {
    id: 'google',
    name: 'Google',
    fullName: 'Google LLC',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png',
    description: 'Technology company specializing in Internet-related services and products, including online advertising technologies, search engine, cloud computing, and software.',
    roles: ['Software Engineer', 'SWE', 'Research Engineer', 'Product Manager', 'UX Designer']
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    fullName: 'Flipkart Internet Private Limited',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Flipkart_logo.svg/512px-Flipkart_logo.svg.png',
    description: 'Indian e-commerce company headquartered in Bangalore, Karnataka, India. The company initially focused on online book sales before expanding into other product categories.',
    roles: ['SDE', 'Software Engineer', 'Product Manager', 'Data Scientist', 'Business Analyst']
  },
  {
    id: 'amazon',
    name: 'Amazon',
    fullName: 'Amazon.com, Inc.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/512px-Amazon_logo.svg.png',
    description: 'Multinational technology company focusing on e-commerce, cloud computing, digital streaming, and artificial intelligence.',
    roles: ['SDE', 'Software Development Engineer', 'Solutions Architect', 'Product Manager', 'Data Scientist']
  }
];

// Experience levels
const experienceLevels = [
  {
    id: 'fresher',
    name: 'Fresher',
    description: 'Less than 1 year of professional experience',
    icon: <AcademicCapIcon className="w-6 h-6" />
  },
  {
    id: 'junior',
    name: 'Junior',
    description: '1-3 years of professional experience',
    icon: <BriefcaseIcon className="w-6 h-6" />
  },
  {
    id: 'mid',
    name: 'Mid-Level',
    description: '3-5 years of professional experience',
    icon: <BuildingOfficeIcon className="w-6 h-6" />
  }
];

const CompanySelection = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    selectedCompany, 
    selectedRole, 
    experienceLevel,
    setCompany,
    setRole,
    setExperienceLevel,
    isSelectionComplete
  } = useCompanyStore();
  const { updateProgress } = useProgressStore();
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Set current step based on selections
  useEffect(() => {
    if (!selectedCompany) {
      setCurrentStep(1);
    } else if (!selectedRole) {
      setCurrentStep(2);
    } else if (!experienceLevel) {
      setCurrentStep(3);
    } else {
      setCurrentStep(4);
    }
  }, [selectedCompany, selectedRole, experienceLevel]);
  
  // Filter companies based on search query
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    company.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get company details by ID
  const getCompanyById = (id) => {
    return companies.find(company => company.id === id) || null;
  };
  
  // Get selected company details
  const selectedCompanyDetails = selectedCompany ? getCompanyById(selectedCompany) : null;
  
  // Handle company selection
  const handleCompanySelect = (companyId) => {
    setCompany(companyId);
  };
  
  // Handle role selection
  const handleRoleSelect = (role) => {
    setRole(role);
  };
  
  // Handle experience level selection
  const handleExperienceSelect = (level) => {
    setExperienceLevel(level);
    
    // After a short delay, navigate to resume section
    setTimeout(() => {
      navigate('/dashboard/resume');
    }, 1000);
  };
  
  // Go back to previous step
  const handleBack = () => {
    if (currentStep === 2) {
      setCompany(null);
    } else if (currentStep === 3) {
      setRole(null);
    } else if (currentStep === 4) {
      setExperienceLevel(null);
    }
  };
  
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

  // Render company selection step
  const renderCompanySelection = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Select Your Target Company</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Choose the company you're preparing to interview with. We'll tailor the preparation process specifically for this company.
      </p>
      
      {/* Search bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-slate-800 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Search for a company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Company grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <motion.div
            key={company.id}
            variants={itemVariants}
            className={`border rounded-xl p-6 cursor-pointer transition-all duration-200 ${
              selectedCompany === company.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm'
            }`}
            onClick={() => handleCompanySelect(company.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg p-2 shadow-sm">
                <img src={company.logo} alt={company.name} className="max-h-full max-w-full" />
              </div>
              {selectedCompany === company.id && (
                <CheckCircleIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{company.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{company.fullName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-3">{company.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
  
  // Render role selection step
  const renderRoleSelection = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <Link
        to="#"
        onClick={handleBack}
        className="inline-flex items-center text-indigo-600 dark:text-indigo-400 mb-6 hover:text-indigo-800 dark:hover:text-indigo-300 px-3 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 mr-auto"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        <span>Back to company selection</span>
      </Link>
      
      <div className="flex items-center mb-6">
        <div className="h-12 w-12 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg p-2 shadow-sm mr-4">
          <img src={selectedCompanyDetails?.logo} alt={selectedCompanyDetails?.name} className="max-h-full max-w-full" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCompanyDetails?.name}</h2>
          <p className="text-gray-600 dark:text-gray-300">{selectedCompanyDetails?.fullName}</p>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Select Your Target Role</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Choose the specific role you're applying for at {selectedCompanyDetails?.name}. This helps us tailor the interview questions and preparation.
      </p>
      
      <div className="space-y-4">
        {selectedCompanyDetails?.roles.map((role) => (
          <motion.div
            key={role}
            variants={itemVariants}
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              selectedRole === role
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
            onClick={() => handleRoleSelect(role)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BuildingOfficeIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">{role}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCompanyDetails?.name}
                  </p>
                </div>
              </div>
              <div>
                {selectedRole === role ? (
                  <CheckCircleIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
  
  // Render experience level selection step
  const renderExperienceSelection = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <Link
        to="#"
        onClick={handleBack}
        className="inline-flex items-center text-indigo-600 dark:text-indigo-400 mb-6 hover:text-indigo-800 dark:hover:text-indigo-300 px-3 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 mr-auto"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        <span>Back to role selection</span>
      </Link>
      
      <div className="flex items-center mb-6">
        <div className="h-12 w-12 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg p-2 shadow-sm mr-4">
          <img src={selectedCompanyDetails?.logo} alt={selectedCompanyDetails?.name} className="max-h-full max-w-full" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRole}</h2>
          <p className="text-gray-600 dark:text-gray-300">{selectedCompanyDetails?.name}</p>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Select Your Experience Level</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Choose your experience level to help us tailor the interview questions and preparation to your specific needs.
      </p>
      
      <div className="space-y-4">
        {experienceLevels.map((level) => (
          <motion.div
            key={level.id}
            variants={itemVariants}
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              experienceLevel === level.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
            onClick={() => handleExperienceSelect(level.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                  {level.icon}
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">{level.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {level.description}
                  </p>
                </div>
              </div>
              <div>
                {experienceLevel === level.id ? (
                  <CheckCircleIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  // Render confirmation step
  const renderConfirmation = () => {
    const expLevel = experienceLevels.find(level => level.id === experienceLevel);
    
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        <Link
          to="#"
          onClick={handleBack}
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 mb-6 hover:text-indigo-800 dark:hover:text-indigo-300 px-3 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 mr-auto"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          <span>Back to experience selection</span>
        </Link>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-center mb-6">
            <CheckCircleIcon className="h-16 w-16 text-green-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Selection Confirmed!
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Your interview preparation will be tailored to these selections.
          </p>
          
          <div className="bg-gray-50 dark:bg-slate-700/30 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                <div className="mt-1 flex justify-center">
                  <div className="h-8 w-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm mr-2">
                    <img src={selectedCompanyDetails?.logo} alt={selectedCompanyDetails?.name} className="max-h-full max-w-full" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCompanyDetails?.name}</p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{selectedRole}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Experience</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{expLevel?.name}</p>
              </div>
            </div>
          </div>
          
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
            Next, we'll analyze your resume to provide personalized feedback for your {selectedCompanyDetails?.name} {selectedRole} interview.
          </p>
          
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            >
              <p className="text-indigo-600 dark:text-indigo-400">
                Redirecting to resume analysis...
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {loading ? (
        <LoadingScreen />
      ) : (
        <div>
          {currentStep === 1 && renderCompanySelection()}
          {currentStep === 2 && renderRoleSelection()}
          {currentStep === 3 && renderExperienceSelection()}
          {currentStep === 4 && renderConfirmation()}
        </div>
      )}
    </div>
  );
};

export default CompanySelection;
