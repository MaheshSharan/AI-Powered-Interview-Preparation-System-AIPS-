import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon, 
  ClockIcon,
  ArrowRightIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import useInterviewStore from '../../../../../store/interviewStore';
import useCompanyStore from '../../../../../store/companyStore';
import useResumeStore from '../../../../../store/resumeStore';

const HRInterview = () => {
  const navigate = useNavigate();
  const [interviewState, setInterviewState] = useState('preparing'); // preparing, in-progress, completed
  const [currentTime, setCurrentTime] = useState('00:00');
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  
  // Interview store data
  const { 
    initializeSession, 
    getCurrentSession, 
    addQuestion, 
    addAnswer, 
    nextQuestion,
    getSessionData,
    endSession,
    currentQuestionIndex,
    questions
  } = useInterviewStore();
  
  // Resume and company data
  const { getCurrentResume } = useResumeStore();
  const { selectedCompany, selectedRole, experienceLevel } = useCompanyStore();
  
  // Local state for the current interview
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [currentSection, setCurrentSection] = useState('behavioral'); // behavioral, cultural, salary, closing
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Mock HR questions for initial implementation
  const mockQuestions = {
    behavioral: [
      "Tell me about a time when you had to deal with a difficult team member. How did you handle it?",
      "Describe a situation where you had to meet a tight deadline. What was your approach?",
      "Give an example of a time when you had to make a difficult decision with limited information.",
      "Tell me about a time when you failed at something. What did you learn from it?"
    ],
    cultural: [
      `What aspects of ${selectedCompany || 'our'} company culture appeal to you the most?`,
      "How would you describe your ideal work environment?",
      "What values are most important to you in a workplace?",
      "How do you stay motivated when working on challenging projects?"
    ],
    salary: [
      "What are your salary expectations for this role?",
      "How do you evaluate compensation packages beyond the base salary?",
      "What benefits are most important to you?",
      "How does this opportunity align with your career progression goals?"
    ],
    closing: [
      "Do you have any questions about the company or the role?",
      "Is there anything else you'd like us to know about you that wasn't covered?",
      "What is your availability for potential next steps?",
      "How soon would you be able to start if offered the position?"
    ]
  };
  
  // Initialize the interview session
  useEffect(() => {
    const session = getCurrentSession();
    
    if (!session || session.status !== 'initialized' || session.type !== 'hr') {
      const data = initializeSession('hr');
      setSessionInfo(data);
      
      // Add initial questions
      mockQuestions.behavioral.forEach(q => addQuestion(q));
    } else {
      // Resume existing session
      const data = getSessionData();
      setSessionInfo(data);
      
      if (data.questions.length === 0) {
        // Add questions if none exist
        mockQuestions.behavioral.forEach(q => addQuestion(q));
      }
    }
    
    // Start camera
    startCamera();
    
    // Start timer
    startTimer();
    
    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Update current question when question index changes
  useEffect(() => {
    const sessionData = getSessionData();
    if (sessionData.questions && sessionData.questions.length > 0) {
      if (currentQuestionIndex < sessionData.questions.length) {
        setCurrentQuestion(sessionData.questions[currentQuestionIndex]);
      } else {
        // Move to next section or complete interview
        if (currentSection === 'behavioral') {
          setCurrentSection('cultural');
          mockQuestions.cultural.forEach(q => addQuestion(q));
        } else if (currentSection === 'cultural') {
          setCurrentSection('salary');
          mockQuestions.salary.forEach(q => addQuestion(q));
        } else if (currentSection === 'salary') {
          setCurrentSection('closing');
          mockQuestions.closing.forEach(q => addQuestion(q));
        } else {
          // Interview is complete
          setInterviewState('completed');
          endSession();
        }
      }
    }
  }, [currentQuestionIndex, questions, currentSection]);
  
  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setInterviewState('in-progress');
    } catch (error) {
      console.error("Error accessing camera:", error);
      // Handle camera error
    }
  };
  
  // Start timer
  const startTimer = () => {
    const startTime = Date.now();
    
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
      
      // Format as MM:SS
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setCurrentTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
  };
  
  // Submit answer
  const submitAnswer = () => {
    if (userAnswer.trim()) {
      addAnswer(userAnswer);
      
      // Show feedback
      setShowFeedback(true);
      
      // Simple feedback for now
      const feedbackMessages = [
        "Good answer! You provided specific examples and demonstrated your skills effectively.",
        "Strong response. Consider adding more specific metrics or outcomes next time.",
        "Well articulated. Your answer shows good alignment with the company values.",
        "Good start. Try to be more concise and focus on the most relevant aspects."
      ];
      
      setFeedback({
        type: 'success',
        message: feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]
      });
      
      // Clear answer
      setUserAnswer('');
      setIsAnswering(false);
    }
  };
  
  // Continue to next question
  const continueToNextQuestion = () => {
    setShowFeedback(false);
    setFeedback(null);
    nextQuestion();
  };
  
  // End interview
  const handleEndInterview = () => {
    endSession();
    setInterviewState('completed');
    
    // Stop camera
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
  
  // Continue to results
  const continueToResults = () => {
    navigate('/dashboard/results');
  };
  
  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get section icon
  const getSectionIcon = () => {
    switch (currentSection) {
      case 'behavioral':
        return <UserCircleIcon className="h-6 w-6 text-indigo-500" />;
      case 'cultural':
        return <BuildingOfficeIcon className="h-6 w-6 text-indigo-500" />;
      case 'salary':
        return <CurrencyDollarIcon className="h-6 w-6 text-indigo-500" />;
      case 'closing':
        return <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-500" />;
      default:
        return <UserCircleIcon className="h-6 w-6 text-indigo-500" />;
    }
  };
  
  // Get section title
  const getSectionTitle = () => {
    switch (currentSection) {
      case 'behavioral':
        return 'Behavioral Questions';
      case 'cultural':
        return 'Cultural Fit Assessment';
      case 'salary':
        return 'Compensation Discussion';
      case 'closing':
        return 'Interview Closing';
      default:
        return 'HR Interview';
    }
  };
  
  // Render completed state
  if (interviewState === 'completed') {
    return (
      <div className="h-[calc(100vh-80px)] bg-gray-50 dark:bg-slate-900 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <CheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HR Interview Completed</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Congratulations! You've successfully completed the entire interview process.
            </p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Interview Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatTime(elapsedTime)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Questions Answered</p>
                <p className="font-medium text-gray-900 dark:text-white">{currentQuestionIndex} questions</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={continueToResults}
              className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              View Detailed Results
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-[calc(100vh-80px)] bg-gray-50 dark:bg-slate-900 p-6 overflow-hidden flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row gap-6">
        {/* Video Feed */}
        <div className="w-full md:w-2/3 bg-black rounded-xl overflow-hidden relative">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            className="w-full h-full object-cover"
          />
          
          {/* Interview Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-white">
                  <ClockIcon className="h-5 w-5" />
                  <span>{currentTime}</span>
                </div>
                
                <div className="flex items-center space-x-1 text-white">
                  <span className="px-2 py-1 bg-indigo-600 rounded-full text-xs">
                    {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
                  onClick={handleEndInterview}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Question and Answer Panel */}
        <div className="w-full md:w-1/3 bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 flex flex-col">
          <div className="mb-4 flex items-center">
            {getSectionIcon()}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white ml-2">{getSectionTitle()}</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-4">
            {showFeedback ? (
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Feedback:</h3>
                <div className={`p-4 rounded-lg ${
                  feedback?.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                    : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                }`}>
                  {feedback?.message}
                </div>
                
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={continueToNextQuestion}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center"
                  >
                    Continue to Next Question
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Current Question:</h3>
                  <p className="text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    {currentQuestion}
                  </p>
                </div>
                
                {isAnswering ? (
                  <div>
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={6}
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={submitAnswer}
                        disabled={!userAnswer.trim()}
                        className={`px-4 py-2 rounded-lg flex items-center ${
                          userAnswer.trim() 
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                            : 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Submit Answer
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <button
                      onClick={() => setIsAnswering(true)}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center"
                    >
                      Start Answering
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          
          {!showFeedback && (
            <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
              <div className="flex justify-between">
                <button
                  onClick={handleEndInterview}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  End Interview
                </button>
                
                <button
                  onClick={() => {
                    if (isAnswering) {
                      submitAnswer();
                    } else {
                      continueToNextQuestion();
                    }
                  }}
                  className="px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                >
                  {isAnswering ? 'Submit' : 'Skip Question'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRInterview;
