import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  DocumentArrowUpIcon,
  DocumentMagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClockIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  LightBulbIcon,
  CodeBracketIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  InformationCircleIcon,
  ArrowUpTrayIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../../store/authStore';
import useCompanyStore from '../../../store/companyStore';
import useProgressStore from '../../../store/progressStore';
import useResumeStore from '../../../store/resumeStore';
import useInterviewStore from '../../../store/interviewStore'; // Import interview store
import { parseResume, analyzeResumeForCompany, handleParsingError, testGeminiConnection } from '../../../utils/resumeParser';
import LoadingScreen from '../../common/LoadingScreen';
import { CountUp } from 'use-count-up';

const ResumeAnalysis = () => {
  const { selectedCompany, selectedRole, experienceLevel } = useCompanyStore();
  const { updateProgress } = useProgressStore();
  const { 
    resumes, 
    currentResumeId, 
    addResume, 
    getCurrentResume, 
    getCurrentResumeFile,
    addResumeVersion,
    deleteResume,
    setCurrentResume,
    saveAnalysisResults,
    getCurrentAnalysisResults
  } = useResumeStore();
  
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState('upload'); // upload, preview, analysis, results, manage
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [parsedResume, setParsedResume] = useState(null);
  const [showVersions, setShowVersions] = useState(false);
  const [versionNote, setVersionNote] = useState('');
  const [activeTab, setActiveTab] = useState('scores');
  const [currentCriticalIndex, setCurrentCriticalIndex] = useState(0);
  const [currentRecommendationIndex, setCurrentRecommendationIndex] = useState(0);
  const [activeImprovementTab, setActiveImprovementTab] = useState('critical');
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  // Helper function to format address
  const formatAddress = (address) => {
    if (!address) return '';
    
    // Split address into parts
    const parts = address.split(',').map(part => part.trim());
    
    // If it's a short address, return as is
    if (parts.length <= 2) return address;
    
    // For longer addresses, format more concisely
    const cityStateZip = parts.slice(-2).join(', ');
    const streetAddress = parts.slice(0, -2).join(', ');
    
    return (
      <div>
        <div className="text-gray-900 dark:text-white">{streetAddress}</div>
        <div className="text-gray-600 dark:text-gray-400 text-sm">{cityStateZip}</div>
      </div>
    );
  };
  
  // Helper function to render score bar
  const renderScoreBar = (score) => {
    const getColor = (score) => {
      if (score >= 80) return 'bg-green-500';
      if (score >= 60) return 'bg-yellow-500';
      return 'bg-red-500';
    };
    
    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${getColor(score)} transition-all duration-500 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    );
  };
  
  useEffect(() => {
    const testAPI = async () => {
      const result = await testGeminiConnection();
      console.log('[Resume Analysis] API Test Result:', result);
    };
    
    testAPI();
  }, []);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Check if there's a current resume
      const currentResume = getCurrentResume();
      if (currentResume) {
        // Get the file object
        const fileObj = getCurrentResumeFile();
        if (fileObj) {
          setFile(fileObj);
          
          // Create file preview
          if (fileObj.type === 'application/pdf') {
            const fileURL = URL.createObjectURL(fileObj);
            setFilePreview(fileURL);
          }
          
          // Check if we have analysis results
          const results = getCurrentAnalysisResults();
          if (results) {
            setAnalysisResults(results);
            setCurrentStep('results');
          } else {
            setCurrentStep('preview');
          }
        }
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, [getCurrentResume, getCurrentResumeFile, getCurrentAnalysisResults]);
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFile(selectedFile);
  };
  
  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  // Process the file
  const handleFile = async (selectedFile) => {
    // Reset states
    setError(null);
    
    if (!selectedFile) return;
    
    try {
      if (selectedFile.type !== 'application/pdf' && 
          selectedFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
          selectedFile.type !== 'text/plain') {
        throw new Error('Unsupported file format. Please upload a PDF, DOCX, or TXT file.');
      }
      
      // Check file size (max 5MB)
      const fileSize = selectedFile.size / 1024 / 1024; // Convert to MB
      if (fileSize > 5) {
        throw new Error('File size exceeds 5MB limit.');
      }
      
      console.log('[Resume Upload] File type:', selectedFile.type);
      console.log('[Resume Upload] File size:', fileSize.toFixed(2), 'MB');
      console.log('[Resume Upload] File accepted:', selectedFile.name);
      
      // Set file state
      setFile(selectedFile);
      
      // Create file preview for PDF files
      if (selectedFile.type === 'application/pdf') {
        const fileURL = URL.createObjectURL(selectedFile);
        setFilePreview(fileURL);
      } else {
        setFilePreview(null);
      }
      
      // Parse the resume text
      const parsed = await parseResume(selectedFile);
      setParsedResume(parsed);
      
      // Save resume to store
      if (selectedCompany && selectedRole) {
        const resumeId = await addResume(
          selectedFile, 
          selectedCompany, 
          selectedRole
        );
        setCurrentResume(resumeId);
      }
      
      // Move to preview step
      setCurrentStep('preview');
    } catch (error) {
      console.error('[Resume Upload] Error:', error);
      setError(handleParsingError(error));
    }
  };
  
  // Trigger file input click
  const onButtonClick = () => {
    fileInputRef.current.click();
  };
  
  // Start analysis process
  const startAnalysis = async () => {
    try {
      setCurrentStep('analysis');
      setAnalysisProgress(0);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 800);
      
      console.log('[Resume Analysis] Starting analysis for company:', selectedCompany, 'role:', selectedRole);
      
      // Debug the parsedResume object
      console.log('[Resume Analysis] parsedResume:', parsedResume);
      
      // Check if parsedResume has the expected structure
      if (!parsedResume || !parsedResume.text) {
        console.log('[Resume Analysis] Invalid parsedResume. Getting current resume from store...');
        // Try to get the resume text from the store
        const currentResume = getCurrentResume();
        if (currentResume && currentResume.rawText) {
          console.log('[Resume Analysis] Found resume text in store, using that instead');
          // Create a valid parsedResume object with the text property
          const validParsedResume = {
            text: currentResume.rawText,
            raw: currentResume.rawText
          };
          // Update the state
          setParsedResume(validParsedResume);
          // Analyze the resume with the valid object
          const results = await analyzeResumeForCompany(validParsedResume, selectedCompany, selectedRole, experienceLevel);
          
          // Clear the interval
          clearInterval(progressInterval);
          setAnalysisProgress(100);
          
          // Save results in state
          setAnalysisResults(results);
          
          // Save to resume store to persist results
          if (currentResumeId) {
            console.log('[Resume Analysis] Saving results to resume store');
            await saveAnalysisResults(currentResumeId, results);
          }
          
          // Mark progress
          updateProgress('resumeAnalysis', true);
          
          // Move to results
          setTimeout(() => {
            setCurrentStep('results');
          }, 1000);
          
          return; // Exit early since we've handled everything
        } else {
          throw new Error('No valid resume text found. Please upload your resume again.');
        }
      }
      
      // Analyze the resume
      const results = await analyzeResumeForCompany(parsedResume, selectedCompany, selectedRole, experienceLevel);
      
      // Clear the interval
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      // Save results in state
      setAnalysisResults(results);
      
      // Save to resume store to persist results
      if (currentResumeId) {
        console.log('[Resume Analysis] Saving results to resume store');
        await saveAnalysisResults(currentResumeId, results);
      }
      
      // Mark progress
      updateProgress('resumeAnalysis', true);
      
      // Move to results
      setTimeout(() => {
        setCurrentStep('results');
      }, 1000);
    } catch (error) {
      console.error('[Resume Analysis] Error analyzing resume:', error);
      setError('Failed to analyze resume: ' + error.message);
      setCurrentStep('preview');
    }
  };
  
  // Reset the process
  const resetProcess = () => {
    setFile(null);
    setFilePreview(null);
    setCurrentStep('upload');
    setAnalysisResults(null);
    setAnalysisProgress(0);
    setParsedResume(null);
  };
  
  // Continue to next module
  const continueToInterview = () => {
    updateProgress('resume_analyzed');
    navigate('/dashboard/interview');
  };
  
  // Upload a new version
  const uploadNewVersion = async () => {
    if (!file) return;
    
    try {
      await addResumeVersion(currentResumeId, file, versionNote);
      setShowVersions(false);
      setVersionNote('');
      
      // Re-analyze the new version
      startAnalysis();
    } catch (error) {
      setError('Failed to upload new version. Please try again.');
    }
  };
  
  // Delete current resume
  const deleteCurrentResume = () => {
    if (currentResumeId) {
      deleteResume(currentResumeId);
      resetProcess();
    }
  };
  
  // Manage resumes
  const goToManageResumes = () => {
    setCurrentStep('manage');
  };
  
  // Select a resume
  const selectResume = (resumeId) => {
    setCurrentResume(resumeId);
    
    // Get the file object
    const fileObj = getCurrentResumeFile();
    if (fileObj) {
      setFile(fileObj);
      
      // Create file preview
      if (fileObj.type === 'application/pdf') {
        const fileURL = URL.createObjectURL(fileObj);
        setFilePreview(fileURL);
      } else {
        setFilePreview(null);
      }
      
      // Check if we have analysis results
      const results = getCurrentAnalysisResults();
      if (results) {
        setAnalysisResults(results);
        setCurrentStep('results');
      } else {
        setCurrentStep('preview');
      }
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
  
  // Render upload step
  const renderUploadStep = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Resume Analysis</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Upload your resume to get personalized feedback and suggestions tailored for {selectedRole} at {selectedCompany}.
      </p>
      
      {/* Upload area */}
      <motion.div
        variants={itemVariants}
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
        />
        
        <div className="flex flex-col items-center justify-center">
          <DocumentArrowUpIcon className="h-16 w-16 text-indigo-600 dark:text-indigo-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Drag and drop your resume here
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Supported formats: PDF, DOCX, TXT (Max size: 5MB)
          </p>
          <button
            type="button"
            onClick={onButtonClick}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Browse Files
          </button>
        </div>
      </motion.div>
      
      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg"
        >
          <div className="flex items-center">
            <XCircleIcon className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}
      
      {/* Tips */}
      <motion.div
        variants={itemVariants}
        className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Resume Tips for {selectedCompany}
        </h3>
        <ul className="space-y-3 text-gray-600 dark:text-gray-300">
          <li className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>Highlight your experience with technologies used at {selectedCompany}</span>
          </li>
          <li className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>Quantify your achievements with metrics and results</span>
          </li>
          <li className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>Tailor your resume to the specific role you're applying for</span>
          </li>
          <li className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>Keep your resume concise and well-structured (1-2 pages)</span>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
  
  // Render preview step
  const renderPreviewStep = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <Link
        to="#"
        onClick={resetProcess}
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mb-6 pl-0 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        <span>Back to upload</span>
      </Link>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Resume Preview</h2>
      
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-6"
      >
        <div className="flex items-center mb-4">
          <DocumentTextIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {file.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1].toUpperCase()}
            </p>
          </div>
        </div>
        
        {filePreview && file.type === 'application/pdf' ? (
          <div className="w-full h-96 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <iframe
              src={filePreview}
              className="w-full h-full"
              title="Resume Preview"
            />
          </div>
        ) : (
          <div className="w-full h-96 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-slate-700">
            <p className="text-gray-500 dark:text-gray-400">
              Preview not available for DOCX or TXT files
            </p>
          </div>
        )}
      </motion.div>
      
      <motion.div
        variants={itemVariants}
        className="flex justify-between"
      >
        <button
          type="button"
          onClick={resetProcess}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
        >
          Upload Different File
        </button>
        
        <button
          type="button"
          onClick={startAnalysis}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          Start Analysis
        </button>
      </motion.div>
    </motion.div>
  );
  
  // Render analysis step
  const renderAnalysisStep = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto text-center"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analyzing Your Resume</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Please wait while we analyze your resume for {selectedRole} at {selectedCompany}...
      </p>
      
      <motion.div
        variants={itemVariants}
        className="mb-8"
      >
        <DocumentMagnifyingGlassIcon className="h-24 w-24 text-indigo-600 dark:text-indigo-400 mx-auto mb-6" />
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
          <motion.div 
            className="bg-indigo-600 h-4 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${analysisProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {analysisProgress < 30 && 'Extracting text and structure...'}
          {analysisProgress >= 30 && analysisProgress < 60 && 'Identifying skills and experience...'}
          {analysisProgress >= 60 && analysisProgress < 90 && 'Comparing with role requirements...'}
          {analysisProgress >= 90 && 'Generating recommendations...'}
        </p>
      </motion.div>
      
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          What We're Analyzing
        </h3>
        <ul className="space-y-3 text-left text-gray-600 dark:text-gray-300">
          <li className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>Skills match with {selectedRole} requirements</span>
          </li>
          <li className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>Experience relevance to {selectedCompany}</span>
          </li>
          <li className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>Resume structure and formatting</span>
          </li>
          <li className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>Achievements and impact statements</span>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
  
  // Render results step
  const renderResultsStep = () => {
    // Check if results exist and have the proper structure
    if (!analysisResults || !analysisResults.scores) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">
            No analysis results available. Please analyze your resume first.
          </p>
          <button
            onClick={() => setCurrentStep('upload')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Upload Resume
          </button>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Actions Bar */}
          <div className="mb-6 flex justify-between items-center">
            <Link
              to="#"
              onClick={resetProcess}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              <span>Back to upload</span>
            </Link>
            
            <div className="flex space-x-4">
              <button
                onClick={goToManageResumes}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <DocumentDuplicateIcon className="w-5 h-5 mr-2" />
                Manage Resumes
              </button>
              
              <button
                onClick={() => {
                  // Save current analysis results to interview store
                  const interviewStore = useInterviewStore.getState();
                  interviewStore.initializeSession();
                  // Navigate to interview setup
                  navigate('/dashboard/interview');
                }}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Continue to Interview
                <ChevronRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Resume Analysis Results
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Review your resume's match with {selectedCompany} {selectedRole} position and get personalized improvement suggestions.
            </p>
          </div>
          
          {/* Tab Navigation */}
          <div className="mb-6 flex space-x-1 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setActiveTab('scores')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'scores'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
              }`}
            >
              Match Scores
            </button>
            <button
              onClick={() => setActiveTab('improvements')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'improvements'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
              }`}
            >
              Improvement Plan
            </button>
          </div>
          
          {/* Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Panel - Personal Info & Details */}
            <div className="col-span-4 space-y-6">
              {/* Personal Info Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</h4>
                      <p className="text-base text-gray-900 dark:text-white">{analysisResults.personal_info.name}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</h4>
                      <p className="text-base text-gray-900 dark:text-white">{analysisResults.personal_info.contact.email}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</h4>
                      <p className="text-base text-gray-900 dark:text-white">{analysisResults.personal_info.contact.phone}</p>
                    </div>
                    
                    {analysisResults.personal_info.contact.location && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Address</h4>
                        <p className="text-base text-gray-900 dark:text-white">{formatAddress(analysisResults.personal_info.contact.location)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Education Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden mb-6">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Education
                  </h3>
                  {/* Education content */}
                  {analysisResults.education && analysisResults.education.map((edu, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{edu.degree}</h4>
                            <p className="text-gray-600 dark:text-gray-300">{edu.institution}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{edu.year}</p>
                            {edu.gpa && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                GPA: <span className="font-medium">{edu.gpa}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {edu.highlights && edu.highlights.length > 0 && (
                          <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Highlights</p>
                            <ul className="list-disc list-inside space-y-1">
                              {edu.highlights.map((item, i) => (
                                <li key={i} className="text-sm text-gray-600 dark:text-gray-300">{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Position Applied For */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Position Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Applying For</h4>
                      <p className="text-base text-gray-900 dark:text-white">
                        <span className="font-medium">{selectedRole}</span> at {selectedCompany}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Experience Level</h4>
                      <p className="text-base text-gray-900 dark:text-white">{experienceLevel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Vertical Separator */}
            <div className="col-span-1 relative">
              <div className="absolute inset-0 flex justify-center">
                <div className="w-px h-full bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
            
            {/* Right Panel - Analysis Results */}
            <div className="col-span-7 space-y-6">
              {activeTab === 'scores' ? (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="mb-8">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <svg className="w-40 h-40">
                          <circle
                            className="text-gray-200 dark:text-gray-700"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="70"
                            cx="80"
                            cy="80"
                          />
                          <motion.circle
                            className={`${
                              analysisResults.scores.overall_score.score >= 80 ? 'text-green-500' : 
                              analysisResults.scores.overall_score.score >= 60 ? 'text-yellow-500' : 
                              'text-red-500'
                            }`}
                            strokeWidth="8"
                            strokeDasharray={70 * 2 * Math.PI}
                            initial={{ strokeDashoffset: 70 * 2 * Math.PI }}
                            animate={{ 
                              strokeDashoffset: 70 * 2 * Math.PI * (1 - analysisResults.scores.overall_score.score / 100)
                            }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="70"
                            cx="80"
                            cy="80"
                          />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                          <div className="text-4xl font-bold text-gray-900 dark:text-white">
                            <CountUp 
                              isCounting
                              start={0}
                              end={analysisResults.scores.overall_score.score}
                              duration={1.5}
                              formatter={value => `${Math.round(value)}%`}
                            />
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Overall Match
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center px-4">
                      {analysisResults.scores.overall_score.summary}
                    </div>
                  </div>
                  
                  {/* Individual Scores */}
                  <div className="mt-8 space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-100 dark:border-gray-700"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-3 bg-white dark:bg-slate-800 text-sm text-gray-500 dark:text-gray-400">
                          Detailed Scores
                        </span>
                      </div>
                    </div>
                    
                    {/* Technical Match */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">Technical Match</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          analysisResults.scores.technical_match.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 
                          analysisResults.scores.technical_match.score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' : 
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          <CountUp 
                            isCounting
                            start={0}
                            end={Math.round(analysisResults.scores.technical_match.score)}
                            duration={2}
                            formatter={value => `${value}%`}
                          />
                        </span>
                      </div>
                      <div className="mb-2">
                        {renderScoreBar(analysisResults.scores.technical_match.score)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {analysisResults.scores.technical_match.reasoning}
                      </p>
                    </div>
                    
                    {/* Experience Match */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">Experience Match</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          analysisResults.scores.experience_match.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 
                          analysisResults.scores.experience_match.score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' : 
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          <CountUp 
                            isCounting
                            start={0}
                            end={Math.round(analysisResults.scores.experience_match.score)}
                            duration={2}
                            formatter={value => `${value}%`}
                            delay={0.3}
                          />
                        </span>
                      </div>
                      <div className="mb-2">
                        {renderScoreBar(analysisResults.scores.experience_match.score)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {analysisResults.scores.experience_match.reasoning}
                      </p>
                    </div>
                    
                    {/* Education Match */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">Education Match</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          analysisResults.scores.education_match.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 
                          analysisResults.scores.education_match.score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' : 
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          <CountUp 
                            isCounting
                            start={0}
                            end={Math.round(analysisResults.scores.education_match.score)}
                            duration={2}
                            formatter={value => `${value}%`}
                            delay={0.6}
                          />
                        </span>
                      </div>
                      <div className="mb-2">
                        {renderScoreBar(analysisResults.scores.education_match.score)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {analysisResults.scores.education_match.reasoning}
                      </p>
                    </div>
                    
                    {/* ATS Score */}
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">ATS Optimization</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          !analysisResults.scores.ats_score ? 'bg-gray-500' :
                          analysisResults.scores.ats_score.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 
                          analysisResults.scores.ats_score.score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' : 
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          <CountUp 
                            isCounting
                            start={0}
                            end={analysisResults.scores.ats_score ? Math.round(analysisResults.scores.ats_score.score) : 0}
                            duration={2}
                            formatter={value => `${value}%`}
                            delay={0.9}
                          />
                        </span>
                      </div>
                      <div className="mb-2">
                        {renderScoreBar(analysisResults.scores.ats_score ? analysisResults.scores.ats_score.score : 0)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {analysisResults.scores.ats_score ? analysisResults.scores.ats_score.reasoning : "ATS score not available"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Critical Areas Carousel */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Critical Areas to Address
                      </h3>
                      <div className="relative">
                        <div className="overflow-hidden">
                          <motion.div
                            animate={{ x: -currentCriticalIndex * 100 + '%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="flex"
                          >
                            {analysisResults.improvements.critical.map((item, index) => (
                              <div key={index} className="w-full flex-shrink-0 pr-4">
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                                  <div className="flex items-start">
                                    <ExclamationCircleIcon className="h-6 w-6 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                      <h4 className="text-base font-medium text-red-800 dark:text-red-300 mb-2">{item.area}</h4>
                                      <p className="text-sm text-red-700 dark:text-red-200">{item.suggestion}</p>
                                      {item.impact && (
                                        <div className="mt-3 flex items-center text-sm text-red-600 dark:text-red-300">
                                          <SparklesIcon className="h-4 w-4 mr-1.5" />
                                          <span className="font-medium">Impact:</span>
                                          <span className="ml-1.5">{item.impact}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <button
                            onClick={() => setCurrentCriticalIndex(Math.max(0, currentCriticalIndex - 1))}
                            disabled={currentCriticalIndex === 0}
                            className={`p-2 rounded-full ${
                              currentCriticalIndex === 0
                              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <ChevronLeftIcon className="w-5 h-5" />
                          </button>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {currentCriticalIndex + 1} of {analysisResults.improvements.critical.length}
                          </span>
                          <button
                            onClick={() => setCurrentCriticalIndex(Math.min(analysisResults.improvements.critical.length - 1, currentCriticalIndex + 1))}
                            disabled={currentCriticalIndex === analysisResults.improvements.critical.length - 1}
                            className={`p-2 rounded-full ${
                              currentCriticalIndex === analysisResults.improvements.critical.length - 1
                              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <ChevronRightIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recommendations Carousel */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Recommendations for Improvement
                      </h3>
                      <div className="relative">
                        <div className="overflow-hidden">
                          <motion.div
                            animate={{ x: -currentRecommendationIndex * 100 + '%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="flex"
                          >
                            {analysisResults.improvements.recommended.map((item, index) => (
                              <div key={index} className="w-full flex-shrink-0 pr-4">
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                                  <div className="flex items-start">
                                    <LightBulbIcon className="h-6 w-6 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                      <h4 className="text-base font-medium text-yellow-800 dark:text-yellow-300 mb-2">{item.area}</h4>
                                      <p className="text-sm text-yellow-700 dark:text-yellow-200">{item.suggestion}</p>
                                      {item.benefit && (
                                        <div className="mt-3 flex items-center text-sm text-yellow-600 dark:text-yellow-300">
                                          <StarIcon className="h-4 w-4 mr-1.5" />
                                          <span className="font-medium">Benefit:</span>
                                          <span className="ml-1.5">{item.benefit}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <button
                            onClick={() => setCurrentRecommendationIndex(Math.max(0, currentRecommendationIndex - 1))}
                            disabled={currentRecommendationIndex === 0}
                            className={`p-2 rounded-full ${
                              currentRecommendationIndex === 0
                              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <ChevronLeftIcon className="w-5 h-5" />
                          </button>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {currentRecommendationIndex + 1} of {analysisResults.improvements.recommended.length}
                          </span>
                          <button
                            onClick={() => setCurrentRecommendationIndex(Math.min(analysisResults.improvements.recommended.length - 1, currentRecommendationIndex + 1))}
                            disabled={currentRecommendationIndex === analysisResults.improvements.recommended.length - 1}
                            className={`p-2 rounded-full ${
                              currentRecommendationIndex === analysisResults.improvements.recommended.length - 1
                              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <ChevronRightIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* ATS Improvements */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        ATS Optimization
                      </h3>
                      <div className="relative">
                        <div className="overflow-hidden">
                          <motion.div
                            animate={{ x: -currentCriticalIndex * 100 + '%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="flex"
                          >
                            {analysisResults.improvements.ats_improvements && analysisResults.improvements.ats_improvements.map((item, index) => (
                              <div key={index} className="w-full flex-shrink-0 pr-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                  <div className="flex items-start">
                                    <DocumentMagnifyingGlassIcon className="h-6 w-6 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                      <h4 className="text-base font-medium text-blue-800 dark:text-blue-300 mb-2">{item.area}</h4>
                                      <p className="text-sm text-blue-700 dark:text-blue-200">{item.suggestion}</p>
                                      {item.impact && (
                                        <div className="mt-3 flex items-center text-sm text-blue-600 dark:text-blue-300">
                                          <SparklesIcon className="h-4 w-4 mr-1.5" />
                                          <span className="font-medium">Impact:</span>
                                          <span className="ml-1.5">{item.impact}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <button
                            onClick={() => setCurrentCriticalIndex(Math.max(0, currentCriticalIndex - 1))}
                            disabled={currentCriticalIndex === 0}
                            className={`p-2 rounded-full ${
                              currentCriticalIndex === 0
                              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <ChevronLeftIcon className="w-5 h-5" />
                          </button>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {currentCriticalIndex + 1} of {analysisResults.improvements.ats_improvements && analysisResults.improvements.ats_improvements.length}
                          </span>
                          <button
                            onClick={() => setCurrentCriticalIndex(Math.min(analysisResults.improvements.ats_improvements && analysisResults.improvements.ats_improvements.length - 1, currentCriticalIndex + 1))}
                            disabled={currentCriticalIndex === analysisResults.improvements.ats_improvements && analysisResults.improvements.ats_improvements.length - 1}
                            className={`p-2 rounded-full ${
                              currentCriticalIndex === analysisResults.improvements.ats_improvements && analysisResults.improvements.ats_improvements.length - 1
                              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <ChevronRightIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render manage resumes step
  const [uploadTimestamps, setUploadTimestamps] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  useEffect(() => {
    // Debug the date issue
    console.log("All resumes:", resumes);
    
    // Create a map of formatted dates
    const timestamps = {};
    resumes.forEach(resume => {
      console.log(`Resume ${resume.id} upload date:`, resume.uploadDate);
      
      let formattedDate = 'Unknown date';
      try {
        if (resume.uploadDate) {
          const date = new Date(resume.uploadDate);
          if (!isNaN(date.getTime())) {
            formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
          }
        }
      } catch (err) {
        console.error("Date formatting error:", err);
      }
      
      timestamps[resume.id] = formattedDate;
    });
    
    setUploadTimestamps(timestamps);
  }, [resumes]);
  
  const renderManageResumes = () => {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Actions Bar */}
          <div className="mb-6 flex justify-between items-center">
            <Link
              to="#"
              onClick={() => setCurrentStep(analysisResults ? 'results' : 'upload')}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              <span>Back</span>
            </Link>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Manage Resumes
            </h1>
          </div>
          
          {resumes.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 text-center"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You haven't uploaded any resumes yet.
              </p>
              <button
                type="button"
                onClick={() => setCurrentStep('upload')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                <DocumentArrowUpIcon className="w-5 h-5 mr-2" />
                Upload Resume
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {resumes.map((resume) => (
                <motion.div
                  key={resume.id}
                  variants={itemVariants}
                  className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border ${
                    resume.id === currentResumeId
                      ? 'border-indigo-300 dark:border-indigo-700'
                      : 'border-gray-100 dark:border-slate-700'
                  } p-6`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <DocumentTextIcon className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                          {resume.fileName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Uploaded on {uploadTimestamps[resume.id] || 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => selectResume(resume.id)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                      >
                        View Analysis
                      </button>
                      <button
                        onClick={() => deleteResume(resume.id)}
                        className="inline-flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                        title="Delete Resume"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {resume.versions.length > 1 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Version History
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {resume.versions.map((version, index) => (
                          <div
                            key={version.id}
                            className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50 dark:bg-slate-700"
                          >
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                              <span className="text-gray-700 dark:text-gray-300">
                                Version {index + 1} • {version.createdAt && !isNaN(new Date(version.createdAt).getTime())
                                  ? new Date(version.createdAt).toLocaleDateString() + ' ' + new Date(version.createdAt).toLocaleTimeString()
                                  : 'Unknown date'}
                              </span>
                            </div>
                            {version.notes && (
                              <span className="text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {version.notes}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {resume.id === currentResumeId && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      {!showVersions ? (
                        <button
                          type="button"
                          onClick={() => setShowVersions(true)}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          Upload New Version
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label htmlFor="versionNote" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Version Notes
                            </label>
                            <textarea
                              id="versionNote"
                              value={versionNote}
                              onChange={(e) => setVersionNote(e.target.value)}
                              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              rows="3"
                              placeholder="What changes did you make to this version? (optional)"
                            ></textarea>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={uploadNewVersion}
                              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
                            >
                              Save New Version
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowVersions(false)}
                              className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Resume Analysis Results Component
  const ResumeAnalysisResults = ({ results }) => {
    if (!results) return null;
    
    return (
      <div className="grid grid-cols-12 gap-4 p-4">
        {/* Left side - Personal Info & Details */}
        <div className="col-span-8 space-y-6">
          {/* Personal Info */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
            <table className="w-full border-collapse">
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-3 w-1/4 font-medium text-gray-700 dark:text-gray-300">Name:</td>
                  <td className="py-3 text-gray-900 dark:text-white">{results.personal_info.name}</td>
                </tr>
                {results.personal_info.contact && <>
                  <tr>
                    <td className="py-3 w-1/4 font-medium text-gray-700 dark:text-gray-300">Email:</td>
                    <td className="py-3 text-gray-900 dark:text-white">{results.personal_info.contact.email}</td>
                  </tr>
                  <tr>
                    <td className="py-3 w-1/4 font-medium text-gray-700 dark:text-gray-300">Phone:</td>
                    <td className="py-3 text-gray-900 dark:text-white">{results.personal_info.contact.phone}</td>
                  </tr>
                  <tr>
                    <td className="py-3 w-1/4 font-medium text-gray-700 dark:text-gray-300">Location:</td>
                    <td className="py-3 text-gray-900 dark:text-white">
                      {formatAddress(results.personal_info.contact.location)}
                    </td>
                  </tr>
                </>}
              </tbody>
            </table>
          </div>
          
          {/* Education */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Education</h3>
            
            {results.education && results.education.map((edu, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{edu.degree}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{edu.institution}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{edu.year}</p>
                      {edu.gpa && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          GPA: <span className="font-medium">{edu.gpa}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {edu.highlights && edu.highlights.length > 0 && (
                    <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Highlights</p>
                      <ul className="list-disc list-inside space-y-1">
                        {edu.highlights.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-300">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Experience */}
          {results.experience && results.experience.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Experience</h3>
              
              {results.experience.map((exp, index) => (
                <div key={index} className="mb-4 border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-semibold">{exp.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{exp.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{exp.duration}</p>
                    </div>
                  </div>
                  
                  {exp.responsibilities && exp.responsibilities.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Responsibilities:</p>
                      <ul className="list-disc list-inside pl-2 text-sm text-gray-600 dark:text-gray-300">
                        {exp.responsibilities.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Achievements:</p>
                      <ul className="list-disc list-inside pl-2 text-sm text-gray-600 dark:text-gray-300">
                        {exp.achievements.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Skills */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Skills</h3>
            
            {/* Technical Skills */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Technical Skills</h4>
              <div className="flex flex-wrap gap-2">
                {results.skills.technical && results.skills.technical.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Soft Skills */}
            {results.skills.soft && results.skills.soft.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Soft Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {results.skills.soft.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Missing Skills */}
            {results.skills.missing_critical && results.skills.missing_critical.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Missing Critical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {results.skills.missing_critical.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - Scores & Improvements */}
        <div className="col-span-4 space-y-6">
          {/* Match Scores */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Match Scores
            </h3>
            
            {/* Overall Match */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                  Overall Match
                </span>
                <span className="text-base font-medium text-gray-900 dark:text-white">
                  <CountUp 
                    isCounting
                    start={0}
                    end={Math.round(results.scores.overall * 100)}
                    duration={2}
                    formatter={value => `${value}%`}
                  />
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div 
                  className="bg-indigo-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(results.scores.overall * 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>
            
            {/* Skills Match */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Skills Match
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  <CountUp 
                    isCounting
                    start={0}
                    end={Math.round(results.scores.skills * 100)}
                    duration={2}
                    formatter={value => `${value}%`}
                    delay={0.3}
                  />
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <motion.div 
                  className="bg-blue-600 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(results.scores.skills * 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            </div>
            
            {/* Experience Match */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Experience Match
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  <CountUp 
                    isCounting
                    start={0}
                    end={Math.round(results.scores.experience * 100)}
                    duration={2}
                    formatter={value => `${value}%`}
                    delay={0.6}
                  />
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <motion.div 
                  className="bg-green-600 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(results.scores.experience * 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
                />
              </div>
            </div>
            
            {/* Education Match */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Education Match
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  <CountUp 
                    isCounting
                    start={0}
                    end={Math.round(results.scores.education * 100)}
                    duration={2}
                    formatter={value => `${value}%`}
                    delay={0.9}
                  />
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <motion.div 
                  className="bg-purple-600 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(results.scores.education * 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.9 }}
                />
              </div>
            </div>
          </div>
          
          {/* Improvements */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Improvement Plan
            </h3>
            
            {/* Critical Improvements */}
            {results.improvements.critical && results.improvements.critical.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-red-600 dark:text-red-400 mb-3">
                  Critical Areas
                </h4>
                <div className="space-y-3">
                  {results.improvements.critical.map((item, index) => (
                    <div key={index} className="p-4 border border-red-100 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <div className="flex items-start">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-3" />
                        <div>
                          <h5 className="text-sm font-medium text-red-800 dark:text-red-300">{item.area}</h5>
                          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{item.suggestion}</p>
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Impact:</span> {item.impact}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Recommended Improvements */}
            {results.improvements.recommended && results.improvements.recommended.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-600 dark:text-yellow-400 mb-3">
                  Recommendations
                </h4>
                <div className="space-y-3">
                  {results.improvements.recommended.map((item, index) => (
                    <div key={index} className="p-4 border border-yellow-100 dark:border-yellow-700 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <div className="flex items-start">
                        <LightBulbIcon className="h-5 w-5 text-yellow-400 mr-3" />
                        <div>
                          <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{item.area}</h5>
                          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{item.suggestion}</p>
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Benefit:</span> {item.benefit}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {loading ? (
        <LoadingScreen />
      ) : (
        <div>
          {currentStep === 'upload' && renderUploadStep()}
          {currentStep === 'preview' && renderPreviewStep()}
          {currentStep === 'analysis' && renderAnalysisStep()}
          {currentStep === 'results' && renderResultsStep()}
          {currentStep === 'manage' && renderManageResumes()}
        </div>
      )}
    </div>
  );
};

export default ResumeAnalysis;
