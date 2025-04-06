import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  VideoCameraIcon,
  MicrophoneIcon,
  CodeBracketIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  XMarkIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  UserIcon,
  AcademicCapIcon,
  ClockIcon,
  SignalIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import useInterviewStore from '../../../../store/interviewStore';
import useResumeStore from '../../../../store/resumeStore';
import useCompanyStore from '../../../../store/companyStore';
import { useAuthStore } from '../../../../store/authStore';  // Correct
import TermsModal from './components/TermsModal';
import InterviewGuidelines from './InterviewGuidelines';

const InterviewSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { resumes, currentResumeId, getCurrentResume } = useResumeStore();
  const [deviceStatus, setDeviceStatus] = useState({
    camera: 'pending',
    microphone: 'pending',
    network: 'pending'
  });
  const [selectedType, setSelectedType] = useState('all');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const { initializeSession } = useInterviewStore();
  const { getCurrentAnalysisResults } = useResumeStore();
  const { selectedCompany, selectedRole, experienceLevel } = useCompanyStore();
  
  useEffect(() => {
    // Debug logging to see what's available
    console.log("Resume Store Data:", {
      currentResume: getCurrentResume(),
      resumes,
      currentResumeId,
      analysisResults: getCurrentResume()?.analysis
    });
    
    checkDevices();
  }, []);

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const startTime = Date.now();
        await fetch('/'); 
        const endTime = Date.now();
        
        if (endTime - startTime > 1000) {
          setDeviceStatus(prev => ({ ...prev, network: 'slow' }));
        } else {
          setDeviceStatus(prev => ({ ...prev, network: 'ready' }));
        }
      } catch (error) {
        setDeviceStatus(prev => ({ ...prev, network: 'error' }));
      }
    };
    
    checkNetwork();
    
    const intervalId = setInterval(checkNetwork, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const checkDevices = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setDeviceStatus(prev => ({ ...prev, camera: 'ready' }));
        }
      } else {
        setDeviceStatus(prev => ({ ...prev, camera: 'unsupported' }));
      }
    } catch (error) {
      setDeviceStatus(prev => ({ ...prev, camera: 'error' }));
      console.log("Camera error:", error);
    }
    
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setDeviceStatus(prev => ({ ...prev, microphone: 'ready' }));
        }
      } else {
        setDeviceStatus(prev => ({ ...prev, microphone: 'unsupported' }));
      }
    } catch (error) {
      setDeviceStatus(prev => ({ ...prev, microphone: 'error' }));
      console.log("Microphone error:", error);
    }
  };
  
  const openTermsModal = () => {
    setShowTermsModal(true);
  };
  
  const handleTermsAccepted = () => {
    setTermsAccepted(true);
    setShowTermsModal(false);
    startInterview();
  };
  
  const startInterview = () => {
    initializeSession(selectedType === 'all' ? 'virtual' : selectedType);
    
    const analysisResults = getCurrentAnalysisResults();
    console.log("Starting interview with analysis:", analysisResults);
    
    if (selectedType === 'all' || selectedType === 'virtual') {
      navigate('/dashboard/interview/virtual');
    } else if (selectedType === 'technical') {
      navigate('/dashboard/interview/technical');
    } else {
      navigate('/dashboard/interview/hr');
    }
  };
  
  const isReadyToStart = () => {
    return (
      deviceStatus.camera === 'ready' &&
      deviceStatus.microphone === 'ready' &&
      deviceStatus.network === 'ready'
    );
  };

  const requestCameraPermission = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
        setDeviceStatus(prev => ({ ...prev, camera: 'ready' }));
      })
      .catch(err => {
        console.error('Camera permission denied:', err);
        setDeviceStatus(prev => ({ ...prev, camera: 'error' }));
      });
  };

  const requestMicrophonePermission = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
        setDeviceStatus(prev => ({ ...prev, microphone: 'ready' }));
      })
      .catch(err => {
        console.error('Microphone permission denied:', err);
        setDeviceStatus(prev => ({ ...prev, microphone: 'error' }));
      });
  };

  const handleStartClick = () => {
    if (isReadyToStart() || process.env.NODE_ENV === 'development') {
      openTermsModal();
    }
  };

  // Get the current resume data
  const currentResume = getCurrentResume();

  const candidateInfo = {
    name: currentResume?.analysis?.personal_info?.name || 'Not Specified',
    currentRole: currentResume?.analysis?.metadata?.role || 'Not Specified',
    experience: currentResume?.analysis?.metadata?.experience_level || 'Not Specified',
    education: currentResume?.analysis?.education?.[0]?.degree || 'Not Specified',
    keySkills: currentResume?.analysis?.skills?.technical || [],
    overallScore: currentResume?.analysis?.scores?.overall_score?.score || 'N/A'
  };

  // Interview duration estimates
  const interviewStages = [
    { name: 'Virtual Interview', duration: '15-20 mins', status: 'current' },
    { name: 'Technical Round', duration: '45-60 mins', status: 'upcoming' },
    { name: 'HR Discussion', duration: '30-45 mins', status: 'upcoming' }
  ];

  return (
    <div className="h-[calc(100vh-80px)] bg-gray-50 dark:bg-slate-900 px-4 py-6 overflow-auto">
      {showTermsModal && (
        <TermsModal 
          isOpen={showTermsModal} 
          onClose={() => setShowTermsModal(false)} 
          onAccept={handleTermsAccepted} 
        />
      )}

      {showGuidelines && (
        <InterviewGuidelines
          isOpen={showGuidelines}
          onClose={() => setShowGuidelines(false)}
          role={candidateInfo.currentRole}
        />
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interview Setup</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowGuidelines(true)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white rounded-lg flex items-center transition-colors"
            >
              <BookOpenIcon className="h-5 w-5 mr-2" />
              View Guidelines
            </button>
            <button
              onClick={handleStartClick}
              disabled={!isReadyToStart() && process.env.NODE_ENV !== 'development'}
              className={`px-6 py-2 rounded-lg flex items-center transition-colors ${
                isReadyToStart() || process.env.NODE_ENV === 'development'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-300 text-gray-100 cursor-not-allowed'
              }`}
            >
              <ArrowRightIcon className="h-5 w-5 mr-2" />
              Start Interview
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Device Check</h2>
            <div className="space-y-4">
              <button 
                onClick={requestCameraPermission}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                  deviceStatus.camera === 'ready'
                    ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-900/30'
                    : deviceStatus.camera === 'error'
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20'
                    : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                <div className="flex items-center">
                  <VideoCameraIcon className={`h-6 w-6 mr-3 ${
                    deviceStatus.camera === 'ready' 
                      ? 'text-indigo-500' 
                      : deviceStatus.camera === 'error'
                      ? 'text-red-500'
                      : 'text-indigo-400'
                  }`} />
                  <div className="text-left">
                    <span className="block font-medium">Camera</span>
                    {deviceStatus.camera === 'error' && (
                      <span className="text-sm text-red-500">Click to allow camera access</span>
                    )}
                    {deviceStatus.camera === 'pending' && (
                      <span className="text-sm text-indigo-500">Click to allow camera access</span>
                    )}
                  </div>
                </div>
                {deviceStatus.camera === 'ready' ? (
                  <CheckCircleIcon className="h-6 w-6 text-indigo-500" />
                ) : deviceStatus.camera === 'error' ? (
                  <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" />
                )}
              </button>

              <button 
                onClick={requestMicrophonePermission}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                  deviceStatus.microphone === 'ready'
                    ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-900/30'
                    : deviceStatus.microphone === 'error'
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20'
                    : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                <div className="flex items-center">
                  <MicrophoneIcon className={`h-6 w-6 mr-3 ${
                    deviceStatus.microphone === 'ready' 
                      ? 'text-indigo-500' 
                      : deviceStatus.microphone === 'error'
                      ? 'text-red-500'
                      : 'text-indigo-400'
                  }`} />
                  <div className="text-left">
                    <span className="block font-medium">Microphone</span>
                    {deviceStatus.microphone === 'error' && (
                      <span className="text-sm text-red-500">Click to allow microphone access</span>
                    )}
                    {deviceStatus.microphone === 'pending' && (
                      <span className="text-sm text-indigo-500">Click to allow microphone access</span>
                    )}
                  </div>
                </div>
                {deviceStatus.microphone === 'ready' ? (
                  <CheckCircleIcon className="h-6 w-6 text-indigo-500" />
                ) : deviceStatus.microphone === 'error' ? (
                  <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" />
                )}
              </button>

              <div className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                deviceStatus.network === 'ready'
                  ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-900/30'
                  : deviceStatus.network === 'slow'
                  ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30'
                  : deviceStatus.network === 'error'
                  ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                  : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600'
              }`}>
                <div className="flex items-center">
                  <svg className={`h-6 w-6 mr-3 ${
                    deviceStatus.network === 'ready' 
                      ? 'text-indigo-500' 
                      : deviceStatus.network === 'slow'
                      ? 'text-yellow-500'
                      : deviceStatus.network === 'error'
                      ? 'text-red-500'
                      : 'text-indigo-400'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                  <div className="text-left">
                    <span className="block font-medium">Network</span>
                    {deviceStatus.network === 'slow' && (
                      <span className="text-sm text-yellow-600">Connection is slow</span>
                    )}
                    {deviceStatus.network === 'error' && (
                      <span className="text-sm text-red-500">Connection problem</span>
                    )}
                  </div>
                </div>
                {deviceStatus.network === 'ready' ? (
                  <CheckCircleIcon className="h-6 w-6 text-indigo-500" />
                ) : deviceStatus.network === 'slow' ? (
                  <CheckCircleIcon className="h-6 w-6 text-yellow-500" />
                ) : deviceStatus.network === 'error' ? (
                  <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 flex-1 border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="inline-block w-2 h-8 bg-indigo-500 mr-3 rounded-sm"></span>
              Select Interview Type
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedType('all')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedType === 'all'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-2">
                    <UserGroupIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <span className="font-medium">All Rounds</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Complete Process
                  </span>
                </div>
              </button>

              <button
                onClick={() => setSelectedType('virtual')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedType === 'virtual'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-2">
                    <VideoCameraIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <span className="font-medium">Virtual</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Initial Round
                  </span>
                </div>
              </button>

              <button
                onClick={() => setSelectedType('technical')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedType === 'technical'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-2">
                    <CodeBracketIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <span className="font-medium">Technical</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Coding Round
                  </span>
                </div>
              </button>

              <button
                onClick={() => setSelectedType('hr')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedType === 'hr'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-2">
                    <UserGroupIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <span className="font-medium">HR</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Final Round
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-6">
          {/* Resume Summary - now 4/6 width on large screens */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 lg:col-span-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="inline-block w-2 h-8 bg-indigo-500 mr-3 rounded-sm"></span>
              Resume Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{candidateInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Role</p>
                <p className="font-medium text-gray-900 dark:text-white">{candidateInfo.currentRole}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Experience Level</p>
                <p className="font-medium text-gray-900 dark:text-white">{candidateInfo.experience}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Education</p>
                <p className="font-medium text-gray-900 dark:text-white">{candidateInfo.education}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Key Skills</p>
                <p className="font-medium text-gray-900 dark:text-white">{candidateInfo.keySkills.slice(0, 4).join(", ")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Overall Score</p>
                <p className="font-medium text-gray-900 dark:text-white">{candidateInfo.overallScore}/100</p>
              </div>
            </div>
          </div>

          {/* Interview Timeline - now 2/6 width on large screens */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="inline-block w-2 h-8 bg-indigo-500 mr-3 rounded-sm"></span>
              Interview Timeline
            </h2>
            <div className="relative">
              {interviewStages.map((stage, index) => (
                <div key={stage.name} className="flex items-start mb-8 last:mb-0">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      stage.status === 'current' ? 'bg-indigo-500' : 'bg-slate-700'
                    }`}>
                      {index + 1}
                    </div>
                    {index < interviewStages.length - 1 && (
                      <div className="h-full w-0.5 bg-slate-700 absolute ml-4" style={{ top: '2rem', height: '3rem' }} />
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-white font-medium">{stage.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">Estimated duration: {stage.duration}</p>
                  </div>
                  {stage.status === 'current' && (
                    <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-400">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;
