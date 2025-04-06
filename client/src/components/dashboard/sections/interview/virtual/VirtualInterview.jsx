import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon, 
  ClockIcon,
  ArrowRightIcon,
  CheckIcon,
  XMarkIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  ExclamationCircleIcon,
  SignalIcon,
  ComputerDesktopIcon,
  ChatBubbleLeftRightIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';
import useInterviewStore from '../../../../../store/interviewStore';
import useCompanyStore from '../../../../../store/companyStore';
import useResumeStore from '../../../../../store/resumeStore';

const VirtualInterview = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const userVideoRef = useRef(null);
  
  // State management
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewState, setInterviewState] = useState('ready'); // ready, active, completed
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showSystemAlert, setShowSystemAlert] = useState(false);
  const [systemAlertType, setSystemAlertType] = useState('info');
  const [systemAlertMessage, setSystemAlertMessage] = useState('');
  const [currentTime, setCurrentTime] = useState('00:00');
  const [totalTime, setTotalTime] = useState('15:00');
  const [currentStage, setCurrentStage] = useState(1);
  const [stream, setStream] = useState(null);
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState('good'); // good, fair, poor
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timer, setTimer] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Mock questions for demo
  const mockQuestions = [
    "Tell me about your experience with software development.",
    "What are your strengths and weaknesses when it comes to teamwork?",
    "Describe a challenging project you worked on and how you handled it.",
    "How do you stay updated with the latest technologies in your field?",
    "Where do you see yourself professionally in five years?",
    "Tell me about a time when you had to learn a new technology quickly.",
    "How do you handle criticism of your work?",
    "What motivates you in your professional life?",
  ];

  // Company-specific questions based on selected company
  const companySpecificQuestions = {
    'Google': [
      "How would you handle a situation where you disagree with your team's approach?",
      "Tell me about a time you had to make a decision with incomplete information.",
      "How do you prioritize tasks when working on multiple projects?",
      "Describe a situation where you had to influence others without direct authority."
    ],
    'Microsoft': [
      "How do you approach learning new technologies or frameworks?",
      "Tell me about a time you received difficult feedback and how you handled it.",
      "How do you balance quality with meeting deadlines?",
      "Describe a situation where you had to collaborate across different teams."
    ],
    'Amazon': [
      "Tell me about a time you had to make a decision that wasn't popular.",
      "How do you handle situations where you have to deliver results under tight deadlines?",
      "Describe a time when you had to deal with ambiguity in a project.",
      "How do you ensure customer satisfaction in your work?"
    ],
    'Apple': [
      "How do you approach design challenges in your work?",
      "Tell me about a time you had to balance user experience with technical constraints.",
      "How do you handle situations where perfection might delay shipping?",
      "Describe your approach to innovation and creative problem-solving."
    ],
    'Meta': [
      "How do you stay motivated when working on long-term projects?",
      "Tell me about a time you had to pivot quickly due to changing requirements.",
      "How do you approach building products for diverse global audiences?",
      "Describe a situation where you had to make a trade-off between features."
    ]
  };

  // Role-specific questions
  const roleSpecificQuestions = {
    'Software Engineer': [
      "Describe your experience with agile development methodologies.",
      "How do you approach debugging complex issues?",
      "Tell me about your experience with code reviews and quality assurance.",
      "How do you keep your technical skills up-to-date?"
    ],
    'Data Scientist': [
      "Describe a challenging data analysis project you worked on.",
      "How do you validate your models and ensure they're not biased?",
      "Tell me about your experience with big data technologies.",
      "How do you communicate complex findings to non-technical stakeholders?"
    ],
    'Product Manager': [
      "How do you prioritize features for a product roadmap?",
      "Describe how you gather and incorporate user feedback.",
      "Tell me about a time you had to make a difficult product decision.",
      "How do you balance business needs with technical constraints?"
    ],
    'UX Designer': [
      "Describe your design process from research to implementation.",
      "How do you validate your design decisions?",
      "Tell me about a time you had to redesign a feature based on user feedback.",
      "How do you collaborate with developers and product managers?"
    ],
    'DevOps Engineer': [
      "Describe your experience with CI/CD pipelines.",
      "How do you approach infrastructure as code?",
      "Tell me about a time you had to troubleshoot a production issue.",
      "How do you balance security with developer productivity?"
    ]
  };

  // Technical follow-up questions
  const technicalFollowUpQuestions = {
    'Software Engineer': [
      "Can you elaborate on how you've used design patterns in your projects?",
      "How do you approach testing and what types of tests do you typically write?",
      "Tell me about your experience with performance optimization.",
      "How do you handle technical debt in your projects?"
    ],
    'Data Scientist': [
      "Can you explain how you approach feature engineering?",
      "What techniques do you use for handling missing data?",
      "How do you evaluate the performance of your models?",
      "Tell me about your experience with deploying machine learning models."
    ],
    'Product Manager': [
      "How do you measure the success of a product feature?",
      "Can you elaborate on your approach to competitive analysis?",
      "How do you create and maintain product documentation?",
      "Tell me about how you work with engineering teams to scope features."
    ]
  };

  // Initialize interview
  useEffect(() => {
    // Get selected company and role from URL or localStorage
    const company = new URLSearchParams(window.location.search).get('company') || localStorage.getItem('selectedCompany') || '';
    const role = new URLSearchParams(window.location.search).get('role') || localStorage.getItem('selectedRole') || '';
    
    setSelectedCompany(company);
    setSelectedRole(role);
    
    // Generate questions based on company and role
    const questions = generateQuestions(company, role);
    
    // Set first question
    setCurrentQuestion(questions[0]);
    
    // Set total time based on number of questions
    const estimatedMinutes = Math.max(15, Math.ceil(questions.length * 2.5));
    setTotalTime(`${estimatedMinutes}:00`);
    
    // Start interview automatically
    startInterview();
    
    // Enter fullscreen mode by default when component mounts
    // Small delay to ensure the DOM is ready
    const fullscreenTimer = setTimeout(() => {
      enterFullScreen();
    }, 500);
    
    // Cleanup function
    return () => {
      // Clear the timer
      clearTimeout(fullscreenTimer);
      
      // Stop any media streams
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Clear any timers
      if (timer) {
        clearInterval(timer);
      }
      
      // Exit full screen if active
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(err => console.error(err));
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen().catch(err => console.error(err));
        }
      }
    };
  }, []);

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullScreenChange = () => {
      const isFullScreenNow = document.fullscreenElement !== null || 
                            document.webkitFullscreenElement !== null;
      setIsFullScreen(isFullScreenNow);
      
      // If we're exiting fullscreen but interview is still active, show a system alert
      if (!isFullScreenNow && interviewState === 'active') {
        showSystemNotification("You've exited full-screen mode. The interview is still in progress.", "info");
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
    };
  }, [interviewState]);

  // Generate questions based on company and role
  const generateQuestions = (company, role) => {
    let questions = [...mockQuestions]; // Start with general questions
    
    // Add company-specific questions if available
    if (company && companySpecificQuestions[company]) {
      questions = [...questions, ...companySpecificQuestions[company]];
    } else {
      // Add some default company questions if no specific company is selected
      questions = [...questions, ...companySpecificQuestions['Google']];
    }
    
    // Add role-specific questions if available
    if (role && roleSpecificQuestions[role]) {
      questions = [...questions, ...roleSpecificQuestions[role]];
    } else {
      // Add some default role questions if no specific role is selected
      questions = [...questions, ...roleSpecificQuestions['Software Engineer']];
    }
    
    // Add technical follow-up questions if available
    if (role && technicalFollowUpQuestions[role]) {
      questions = [...questions, ...technicalFollowUpQuestions[role]];
    } else if (technicalFollowUpQuestions['Software Engineer']) {
      // Add default technical follow-ups
      questions = [...questions, ...technicalFollowUpQuestions['Software Engineer']];
    }
    
    // Shuffle questions slightly but keep categories together
    const generalQuestions = questions.slice(0, mockQuestions.length);
    const specificQuestions = questions.slice(mockQuestions.length);
    
    return [...generalQuestions, ...specificQuestions];
  };

  // Generate dynamic follow-up question based on previous answer
  const generateFollowUpQuestion = (answer) => {
    // In a real implementation, this would use Gemini API to analyze the answer
    // and generate a relevant follow-up question
    
    // For demo purposes, we'll use some simple pattern matching
    const followUps = [
      "Can you elaborate more on that experience?",
      "How did that experience shape your approach to similar challenges?",
      "What specific skills did you develop from that situation?",
      "If you faced a similar situation again, would you approach it differently?",
      "How did that experience prepare you for the role you're applying for?"
    ];
    
    // Simple keyword matching for demo
    if (answer.toLowerCase().includes("challenge") || answer.toLowerCase().includes("difficult")) {
      return "What was the most challenging aspect of that situation and how did you overcome it?";
    } else if (answer.toLowerCase().includes("team") || answer.toLowerCase().includes("collaborate")) {
      return "Can you describe your specific role in the team and how you contributed to the team's success?";
    } else if (answer.toLowerCase().includes("learn") || answer.toLowerCase().includes("skill")) {
      return "How have you applied what you learned to subsequent projects or situations?";
    } else {
      // Return a random follow-up if no keywords match
      return followUps[Math.floor(Math.random() * followUps.length)];
    }
  };

  // Continue to next question
  const continueToNextQuestion = () => {
    const questions = generateQuestions(selectedCompany, selectedRole);
    
    if (currentQuestionIndex < questions.length - 1) {
      // Check if we should generate a follow-up question based on the previous answer
      const shouldAskFollowUp = Math.random() > 0.7 && transcription.length > 100;
      
      if (shouldAskFollowUp) {
        // Generate follow-up question based on the previous answer
        const followUpQuestion = generateFollowUpQuestion(transcription);
        setCurrentQuestion(followUpQuestion);
        setTranscription('');
        setShowFeedback(false);
        setFeedback(null);
        setIsAISpeaking(true);
        
        // Simulate AI speaking
        setTimeout(() => {
          setIsAISpeaking(false);
          simulateTranscription();
        }, 2000);
      } else {
        // Move to the next question
        setCurrentQuestionIndex(prev => prev + 1);
        const nextQuestion = questions[currentQuestionIndex + 1] || mockQuestions[0];
        setCurrentQuestion(nextQuestion);
        setTranscription('');
        setShowFeedback(false);
        setFeedback(null);
        
        // Update stage if needed
        const newStage = Math.floor((currentQuestionIndex + 1) / (questions.length / 4)) + 1;
        if (newStage !== currentStage) {
          setCurrentStage(newStage);
        }
        
        // Simulate AI speaking before starting transcription
        setIsAISpeaking(true);
        setTimeout(() => {
          setIsAISpeaking(false);
          simulateTranscription();
        }, 2000);
      }
    } else {
      // End of interview
      handleEndInterview();
    }
  };

  // Start interview
  const startInterview = async () => {
    try {
      // Request camera and microphone access
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // Set stream to state and video element
      setStream(mediaStream);
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = mediaStream;
      }
      
      // Enter full screen
      enterFullScreen();
      
      // Start interview timer
      const intervalId = setInterval(() => {
        setElapsedSeconds(prev => {
          const newSeconds = prev + 1;
          const minutes = Math.floor(newSeconds / 60);
          const seconds = newSeconds % 60;
          setCurrentTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
          return newSeconds;
        });
      }, 1000);
      
      setTimer(intervalId);
      setInterviewStarted(true);
      setInterviewState('active');
      
      // Simulate connection quality checks
      startConnectionChecks();
      
      // Start transcription simulation
      simulateTranscription();
      
    } catch (error) {
      console.error("Error starting interview:", error);
      showSystemNotification("Could not access camera or microphone. Please check your device permissions.", "error");
    }
  };
  
  // Enter full screen mode
  const enterFullScreen = () => {
    const elem = containerRef.current;
    if (!elem) return;
    
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
        showSystemNotification("Couldn't enter full-screen mode. You can continue the interview in the current window.", "warning");
      });
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
        showSystemNotification("Couldn't enter full-screen mode. You can continue the interview in the current window.", "warning");
      });
    }
  };

  // Exit full screen mode
  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(err => console.error(err));
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen().catch(err => console.error(err));
    }
  };

  // Toggle full screen
  const toggleFullScreen = () => {
    if (isFullScreen) {
      exitFullScreen();
    } else {
      enterFullScreen();
    }
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const enabled = !audioTracks[0].enabled;
        audioTracks[0].enabled = enabled;
        setMicActive(enabled);
        
        showSystemNotification(
          enabled ? "Microphone turned on" : "Microphone turned off", 
          "info"
        );
      }
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        const enabled = !videoTracks[0].enabled;
        videoTracks[0].enabled = enabled;
        setCameraActive(enabled);
        
        showSystemNotification(
          enabled ? "Camera turned on" : "Camera turned off", 
          "info"
        );
      }
    }
  };

  // End interview
  const handleEndInterview = () => {
    // Stop media tracks
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Clear timer
    if (timer) {
      clearInterval(timer);
    }
    
    // Exit full screen
    if (isFullScreen) {
      exitFullScreen();
    }
    
    // Set interview state to completed
    setInterviewState('completed');
  };

  // Submit answer
  const submitAnswer = () => {
    setIsTranscribing(true);
    
    // Simulate processing time
    setTimeout(() => {
      setIsTranscribing(false);
      setShowFeedback(true);
      
      // Generate random feedback (in a real app, this would be AI-generated)
      const feedbackTypes = ['success', 'improvement'];
      const randomType = feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)];
      
      const successMessages = [
        "Great answer! You provided specific examples and demonstrated your expertise.",
        "Excellent response! You addressed all aspects of the question clearly and concisely.",
        "Strong answer! You showed good communication skills and relevant experience."
      ];
      
      const improvementMessages = [
        "Good start, but try to include more specific examples from your experience.",
        "Consider structuring your answer with the STAR method for more clarity.",
        "You made some good points, but try to be more concise in your response."
      ];
      
      setFeedback({
        type: randomType,
        message: randomType === 'success' 
          ? successMessages[Math.floor(Math.random() * successMessages.length)]
          : improvementMessages[Math.floor(Math.random() * improvementMessages.length)]
      });
    }, 1500);
  };

  // Simulate transcription (in a real app, this would use a speech-to-text API)
  const simulateTranscription = () => {
    // Clear any existing transcription
    setTranscription('');
    
    // Only simulate if interview is active
    if (interviewState !== 'active') return;
    
    // Sample responses
    const sampleResponses = [
      "In my previous role at Tech Solutions, I worked on developing web applications using React and Node.js. I was responsible for implementing new features, fixing bugs, and optimizing performance. I also collaborated with the design team to ensure a seamless user experience.",
      "I believe my biggest strength is my ability to collaborate effectively with diverse teams. I'm good at active listening and finding common ground. My weakness is sometimes taking on too much responsibility instead of delegating, but I've been working on improving this by setting clearer boundaries and trusting my team members more.",
      "One challenging project was developing a real-time analytics dashboard with tight deadlines. We faced technical issues with data synchronization and performance. I organized daily stand-ups to track progress and identify blockers early. By prioritizing features and optimizing our database queries, we delivered the project on time with all critical functionality intact.",
      "I stay updated by following industry blogs, participating in online communities like Stack Overflow and GitHub, and attending webinars and conferences when possible. I also dedicate time each week to explore new technologies through small personal projects, which helps me understand their practical applications.",
    ];
    
    const selectedResponse = sampleResponses[currentQuestionIndex % sampleResponses.length];
    
    // Simulate typing effect
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= selectedResponse.length) {
        setTranscription(selectedResponse.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);
  };

  // Show system notification
  const showSystemNotification = (message, type = 'info') => {
    setSystemAlertMessage(message);
    setSystemAlertType(type);
    setShowSystemAlert(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowSystemAlert(false);
    }, 5000);
  };

  // Simulate connection quality checks
  const startConnectionChecks = () => {
    // In a real app, this would monitor actual network conditions
    const checkInterval = setInterval(() => {
      const qualities = ['good', 'fair', 'poor'];
      const randomIndex = Math.floor(Math.random() * 10);
      
      // 70% chance of good, 20% chance of fair, 10% chance of poor
      let newQuality;
      if (randomIndex < 7) {
        newQuality = 'good';
      } else if (randomIndex < 9) {
        newQuality = 'fair';
      } else {
        newQuality = 'poor';
      }
      
      // Only show notification if quality changes to worse
      if (newQuality !== connectionQuality) {
        if (newQuality === 'poor' && connectionQuality !== 'poor') {
          showSystemNotification("Your connection quality is poor. This may affect the interview experience.", "warning");
        } else if (newQuality === 'fair' && connectionQuality === 'good') {
          showSystemNotification("Your connection quality has decreased. Some features may be affected.", "info");
        }
        
        setConnectionQuality(newQuality);
      }
    }, 30000); // Check every 30 seconds
    
    // Cleanup on component unmount
    return () => clearInterval(checkInterval);
  };

  // Get connection quality indicator
  const getConnectionIndicator = () => {
    let color = '';
    let label = '';
    
    switch (connectionQuality) {
      case 'good':
        color = 'text-green-500';
        label = 'Good Connection';
        break;
      case 'fair':
        color = 'text-yellow-500';
        label = 'Fair Connection';
        break;
      case 'poor':
        color = 'text-red-500';
        label = 'Poor Connection';
        break;
      default:
        color = 'text-gray-500';
        label = 'Checking Connection';
    }
    
    return (
      <div className="flex items-center">
        <SignalIcon className={`h-5 w-5 ${color} mr-1`} />
        <span className="text-xs font-medium text-gray-400">{label}</span>
      </div>
    );
  };

  // Render completed state
  if (interviewState === 'completed') {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-gray-800 rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Interview Completed</h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Duration</p>
                <p className="font-medium text-white">{currentTime}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Questions Answered</p>
                <p className="font-medium text-white">{currentQuestionIndex + 1} questions</p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Next Steps</h3>
            <p className="text-gray-300 mb-4">
              You've completed the virtual interview portion. Based on your performance, we recommend proceeding to:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-800">
                <h4 className="font-medium text-indigo-400 mb-2">Technical Interview</h4>
                <p className="text-gray-400 text-sm">
                  Test your technical knowledge and problem-solving skills with coding challenges.
                </p>
              </div>
              <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-800">
                <h4 className="font-medium text-indigo-400 mb-2">HR Interview</h4>
                <p className="text-gray-400 text-sm">
                  Discuss your fit for the company culture and review your career aspirations.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => navigate('/dashboard/interview/technical')}
              className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Continue to Technical Interview
            </button>
            <button 
              onClick={() => navigate('/dashboard/interview/hr')}
              className="flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Skip to HR Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`${isFullScreen ? 'h-screen w-screen' : 'h-[calc(100vh-80px)] w-full'} bg-[#0A0A0F] overflow-hidden flex flex-col`}
    >
      {/* Top navigation bar */}
      <div className="bg-[#0A0A0F] h-15 border-b border-gray-800 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-white">
            {selectedCompany || 'AIPS'} {selectedRole || 'Virtual'} Interview
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Interview time */}
          <div className="flex items-center text-white mr-2">
            <ClockIcon className="h-5 w-5 text-gray-400 mr-1" />
            <span className="font-medium">{currentTime}</span>
            <span className="text-indigo-500 ml-1">/{totalTime}</span>
          </div>
          
          {getConnectionIndicator()}
          
          <div className="flex items-center text-green-500">
            <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
            <span className="text-xs font-medium">LIVE</span>
          </div>
          
          {/* Full screen toggle button */}
          <button 
            onClick={toggleFullScreen}
            className="p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-white"
            aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
          >
            {isFullScreen ? (
              <ArrowsPointingInIcon className="h-5 w-5" />
            ) : (
              <ArrowsPointingOutIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col md:flex-row h-full">
        {/* Left panel - Video area */}
        <div className="md:w-1/2 h-full flex flex-col bg-[#0A0A0F] border-r border-gray-800 relative">
          {/* AI interviewer video placeholder */}
          <div className="relative h-full flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-indigo-900/30 flex items-center justify-center">
                <UserCircleIcon className="h-24 w-24 text-indigo-500" />
              </div>
            </div>
            
            {/* Audio waveform visualization */}
            <div className="absolute bottom-24 left-0 right-0 flex justify-center">
              <div className="flex items-end space-x-1">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 bg-indigo-500 rounded-full"
                    style={{ 
                      height: `${Math.max(3, Math.min(20, Math.random() * 20))}px`,
                      opacity: isAISpeaking ? 1 : 0.3
                    }}
                  ></div>
                ))}
              </div>
            </div>
            
            {/* User video (picture-in-picture) */}
            <div className="absolute bottom-5 right-5 w-32 h-24 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
              <video 
                ref={userVideoRef}
                autoPlay
                muted={false}
                playsInline
                className="w-full h-full object-cover"
              ></video>
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                  <UserCircleIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>
          
          {/* Video controls */}
          <div className="bg-[#0A0A0F] border-t border-gray-800 p-4 flex justify-center space-x-4">
            <button 
              onClick={toggleMicrophone}
              className={`p-2 rounded-full ${micActive ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
              aria-label={micActive ? "Turn off microphone" : "Turn on microphone"}
            >
              <MicrophoneIcon className="h-5 w-5" />
            </button>
            
            <button 
              onClick={toggleCamera}
              className={`p-2 rounded-full ${cameraActive ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
              aria-label={cameraActive ? "Turn off camera" : "Turn on camera"}
            >
              <VideoCameraIcon className="h-5 w-5" />
            </button>
            
            <button 
              onClick={handleEndInterview}
              className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white"
              aria-label="End interview"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Right panel - Questions and responses */}
        <div className="md:w-1/2 h-full flex flex-col bg-[#0A0A0F]">
          {/* Progress bar */}
          <div className="px-6 py-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Question {currentQuestionIndex + 1} of {mockQuestions.length}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / mockQuestions.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full" 
                style={{ width: `${((currentQuestionIndex + 1) / mockQuestions.length) * 100}%` }}
              ></div>
            </div>
            
            {/* Interview stages */}
            <div className="flex justify-between mt-2">
              {['Introduction', 'Main', 'Follow-ups', 'Wrap-up'].map((stage, index) => (
                <div 
                  key={stage}
                  className="flex flex-col items-center"
                >
                  <div 
                    className={`w-4 h-4 rounded-full ${
                      index <= Math.floor(currentQuestionIndex / (mockQuestions.length / 4)) 
                        ? 'bg-indigo-600' 
                        : 'bg-gray-700'
                    } flex items-center justify-center`}
                  >
                    {index <= Math.floor(currentQuestionIndex / (mockQuestions.length / 4)) && (
                      <CheckIcon className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-xs mt-1 text-gray-400">{stage}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Question display */}
          <div className="flex-grow px-6 py-4 overflow-y-auto">
            <div className="bg-gray-900 rounded-lg p-5 mb-4">
              <h3 className="text-lg font-medium text-white mb-2">Current Question:</h3>
              <p className="text-gray-300">{currentQuestion}</p>
            </div>
            
            {/* User response */}
            <div className="bg-gray-900/50 rounded-lg p-5">
              <h3 className="text-lg font-medium text-white mb-2">Your Response:</h3>
              
              {/* Transcription with waveform */}
              <div className="min-h-[100px] text-gray-300 mb-4 relative">
                {transcription ? (
                  <>
                    <p>{transcription}</p>
                    {/* User waveform visualization when speaking */}
                    {isTranscribing && (
                      <div className="mt-3 flex items-end space-x-1">
                        {[...Array(15)].map((_, i) => (
                          <div 
                            key={i}
                            className="w-1 bg-green-500 rounded-full animate-pulse"
                            style={{ 
                              height: `${Math.max(2, Math.min(15, Math.random() * 15))}px`,
                              animationDelay: `${i * 0.05}s`
                            }}
                          ></div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-gray-500 mb-2">Waiting for your response...</p>
                    <div className="flex items-end space-x-1">
                      {[...Array(15)].map((_, i) => (
                        <div 
                          key={i}
                          className="w-1 bg-gray-500 rounded-full animate-pulse"
                          style={{ 
                            height: `${Math.max(2, Math.min(8, Math.random() * 8))}px`,
                            animationDelay: `${i * 0.05}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Response controls */}
              <div className="flex justify-end">
                <button
                  onClick={submitAnswer}
                  disabled={!transcription || isTranscribing}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    !transcription || isTranscribing 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isTranscribing ? 'Submitting...' : 'Submit Response'}
                  {!isTranscribing && <ArrowRightIcon className="h-4 w-4 ml-2" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* System notifications */}
      {showSystemAlert && (
        <div className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-md shadow-lg flex items-center space-x-2 ${
          systemAlertType === 'error' 
            ? 'bg-red-600 text-white' 
            : systemAlertType === 'warning'
              ? 'bg-yellow-600 text-white'
              : 'bg-indigo-600 text-white'
        }`}>
          <ExclamationCircleIcon className="h-5 w-5" />
          <span>{systemAlertMessage}</span>
        </div>
      )}
    </div>
  );
};

export default VirtualInterview;
