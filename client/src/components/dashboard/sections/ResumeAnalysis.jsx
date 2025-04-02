import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../../store/authStore';
import useCompanyStore from '../../../store/companyStore';
import useProgressStore from '../../../store/progressStore';
import useResumeStore from '../../../store/resumeStore';
import { parseResume, analyzeResumeForCompany, handleParsingError } from '../../../utils/resumeParser';
import LoadingScreen from '../../common/LoadingScreen';

const ResumeAnalysis = () => {
  const { user } = useAuthStore();
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
  
  const fileInputRef = useRef(null);
  
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
  const handleFile = (selectedFile) => {
    // Reset states
    setError(null);
    
    // Check file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    console.log('[Resume Upload] File type:', selectedFile.type);
    
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or DOCX file');
      return;
    }
    
    // Check file size (max 5MB)
    console.log('[Resume Upload] File size:', (selectedFile.size / 1024 / 1024).toFixed(2), 'MB');
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return;
    }
    
    // Set file and create preview
    setFile(selectedFile);
    console.log('[Resume Upload] File accepted:', selectedFile.name);
    
    // Create file preview
    if (selectedFile.type === 'application/pdf') {
      const fileURL = URL.createObjectURL(selectedFile);
      setFilePreview(fileURL);
    } else {
      // For DOCX, we'll just show the file name and icon
      setFilePreview(null);
    }
    
    // Move to preview step
    setCurrentStep('preview');
  };
  
  // Trigger file input click
  const onButtonClick = () => {
    fileInputRef.current.click();
  };
  
  // Start analysis process
  const startAnalysis = async () => {
    setCurrentStep('analysis');
    setAnalysisProgress(0);
    console.log('[Resume Analysis] Starting analysis process');
    
    try {
      // Parse the resume
      let progress = 10;
      setAnalysisProgress(progress);
      console.log('[Resume Analysis] Beginning resume parsing');
      
      const parsed = await parseResume(file);
      setParsedResume(parsed);
      console.log('[Resume Analysis] Resume parsed successfully:', parsed);
      
      progress = 40;
      setAnalysisProgress(progress);
      
      // Analyze for the selected company and role
      console.log(`[Resume Analysis] Analyzing for ${selectedCompany} ${selectedRole}`);
      const results = analyzeResumeForCompany(parsed, selectedCompany, selectedRole);
      console.log('[Resume Analysis] Analysis results:', results);
      
      progress = 70;
      setAnalysisProgress(progress);
      
      // Save the resume and analysis results
      console.log('[Resume Analysis] Saving resume and analysis results');
      const resumeId = await addResume(file, selectedCompany, selectedRole);
      saveAnalysisResults(resumeId, results);
      
      progress = 100;
      setAnalysisProgress(progress);
      
      // Set results and update progress
      setAnalysisResults(results);
      updateProgress('resumeAnalysis', true);
      console.log('[Resume Analysis] Process completed successfully');
      
      // Move to results step
      setTimeout(() => {
        setCurrentStep('results');
      }, 1000);
    } catch (error) {
      console.error('[Resume Analysis] Error during analysis:', error);
      setError(handleParsingError(error));
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
  const continueToNextModule = () => {
    // Navigate to the interview module
    window.location.href = '/dashboard/interview';
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
          accept=".pdf,.docx"
          onChange={handleFileChange}
        />
        
        <div className="flex flex-col items-center justify-center">
          <DocumentArrowUpIcon className="h-16 w-16 text-indigo-600 dark:text-indigo-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Drag and drop your resume here
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Supported formats: PDF, DOCX (Max size: 5MB)
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
        className="inline-flex items-center text-indigo-600 dark:text-indigo-400 mb-6 hover:text-indigo-800 dark:hover:text-indigo-300 pl-0"
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
              Preview not available for DOCX files
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
    // Add null check to prevent errors
    if (!analysisResults || !analysisResults.skillsMatch) {
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
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        <Link
          to="#"
          onClick={resetProcess}
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 mb-6 hover:text-indigo-800 dark:hover:text-indigo-300 pl-0"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          <span>Upload a different resume</span>
        </Link>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis Results</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowVersions(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                <DocumentArrowUpIcon className="w-5 h-5 mr-2" />
                Upload New Version
              </button>
              <button
                onClick={goToManageResumes}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                <DocumentDuplicateIcon className="w-5 h-5 mr-2" />
                Manage Resumes
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                <div className="relative inline-block">
                  <svg className="w-24 h-24">
                    <circle
                      className="text-gray-200 dark:text-slate-600"
                      strokeWidth="5"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className={`${
                        analysisResults?.score >= 80
                          ? 'text-green-500'
                          : analysisResults?.score >= 60
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}
                      strokeWidth="5"
                      strokeDasharray={`${analysisResults?.score * 2.83}, 283`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {analysisResults?.score}
                    </span>
                  </div>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Match Score
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  for {selectedRole} at {selectedCompany}
                </p>
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {analysisResults?.strengths.map((strength, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-lg p-2"
                      >
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-1" />
                    Areas to Improve
                  </h3>
                  <ul className="space-y-2">
                    {analysisResults?.weaknesses.map((weakness, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg p-2"
                      >
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Skills Match
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Matched Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResults?.skillsMatch?.matched?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Missing Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResults?.skillsMatch?.missing?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Suggestions for Improvement
            </h3>
            
            <ul className="space-y-2">
              {analysisResults?.suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start text-sm text-gray-700 dark:text-gray-300"
                >
                  <span className="inline-flex items-center justify-center flex-shrink-0 w-5 h-5 mr-2 mt-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 rounded-full text-xs font-bold">
                    {index + 1}
                  </span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
        
        {/* Company Insights Section */}
        {analysisResults?.companyInsights && Object.keys(analysisResults.companyInsights).length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
              {selectedCompany} Interview Insights
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResults.companyInsights.technicalFocus && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Technical Focus
                  </h4>
                  <ul className="space-y-1">
                    {analysisResults.companyInsights.technicalFocus.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <CodeBracketIcon className="h-4 w-4 text-indigo-500 mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysisResults.companyInsights.culturalValues && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cultural Values
                  </h4>
                  <ul className="space-y-1">
                    {analysisResults.companyInsights.culturalValues.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <UserGroupIcon className="h-4 w-4 text-indigo-500 mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysisResults.companyInsights.interviewFocus && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interview Focus
                  </h4>
                  <ul className="space-y-1">
                    {analysisResults.companyInsights.interviewFocus.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <ClipboardDocumentCheckIcon className="h-4 w-4 text-indigo-500 mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysisResults.companyInsights.resumePreferences && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Resume Preferences
                  </h4>
                  <ul className="space-y-1">
                    {analysisResults.companyInsights.resumePreferences.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <DocumentTextIcon className="h-4 w-4 text-indigo-500 mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                These insights are based on research of {selectedCompany}'s hiring practices and can help you prepare for your interview. Focus on these areas to maximize your chances of success.
              </p>
            </div>
          </motion.div>
        )}
        
        {showVersions && (
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Upload New Version
            </h3>
            
            <div className="space-y-4">
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
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={uploadNewVersion}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Upload New Version
                </button>
                <button
                  type="button"
                  onClick={() => setShowVersions(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={deleteCurrentResume}
            className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Delete Resume
          </button>
          
          <div className="space-x-3">
            <button
              type="button"
              onClick={() => setShowVersions(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
            >
              <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
              Upload New Version
            </button>
            
            <Link
              to="/dashboard/interview"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              Continue to Interview
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // Render manage resumes step
  const renderManageResumes = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <Link
        to="#"
        onClick={() => setCurrentStep(analysisResults ? 'results' : 'upload')}
        className="inline-flex items-center text-indigo-600 dark:text-indigo-400 mb-6 hover:text-indigo-800 dark:hover:text-indigo-300 pl-0"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        <span>Back</span>
      </Link>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Manage Resumes</h2>
      
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
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {resume.filename}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Uploaded on {new Date(resume.uploadDate).toLocaleDateString()}
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
                            Version {index + 1} • {new Date(version.createdAt).toLocaleDateString()}
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
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
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
                          className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors duration-200"
                        >
                          Save New Version
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowVersions(false)}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
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
    </motion.div>
  );

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
