import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CodeBracketIcon, 
  ClockIcon,
  ArrowRightIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import useInterviewStore from '../../../../../store/interviewStore';
import useCompanyStore from '../../../../../store/companyStore';

const TechnicalInterview = () => {
  const navigate = useNavigate();
  const [currentProblem, setCurrentProblem] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [currentTime, setCurrentTime] = useState('00:00');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerRef, setTimerRef] = useState(null);
  const [interviewState, setInterviewState] = useState('preparing'); // preparing, in-progress, completed
  const [currentLanguage, setCurrentLanguage] = useState('javascript');
  const [problemIndex, setProblemIndex] = useState(0);
  
  // Interview store data
  const { 
    initializeSession, 
    getCurrentSession,
    getSessionData,
    endSession
  } = useInterviewStore();
  
  // Company data
  const { selectedCompany, selectedRole } = useCompanyStore();
  
  // Mock problems for initial implementation
  const mockProblems = [
    {
      id: 1,
      title: 'Two Sum',
      difficulty: 'Easy',
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
      
You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
      starterCode: {
        javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your solution here
}

// Example usage
console.log(twoSum([2, 7, 11, 15], 9)); // Expected output: [0, 1]`,
        python: `def two_sum(nums, target):
    # Your solution here
    pass

# Example usage
print(two_sum([2, 7, 11, 15], 9))  # Expected output: [0, 1]`
      },
      testCases: [
        { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
        { input: [[3, 2, 4], 6], expected: [1, 2] },
        { input: [[3, 3], 6], expected: [0, 1] }
      ]
    },
    {
      id: 2,
      title: 'Valid Parentheses',
      difficulty: 'Medium',
      description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Example:
Input: s = "()[]{}"
Output: true`,
      starterCode: {
        javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Your solution here
}

// Example usage
console.log(isValid("()[]{}")); // Expected output: true`,
        python: `def is_valid(s):
    # Your solution here
    pass

# Example usage
print(is_valid("()[]{}"))  # Expected output: True`
      },
      testCases: [
        { input: ["()"], expected: true },
        { input: ["()[]{}"], expected: true },
        { input: ["(]"], expected: false }
      ]
    }
  ];
  
  // Initialize the interview session
  useEffect(() => {
    const session = getCurrentSession();
    
    if (!session || session.status !== 'initialized' || session.type !== 'technical') {
      initializeSession('technical');
    }
    
    // Set the first problem
    setCurrentProblem(mockProblems[0]);
    setCode(mockProblems[0].starterCode[currentLanguage]);
    
    // Start timer
    startTimer();
    setInterviewState('in-progress');
    
    return () => {
      // Cleanup
      if (timerRef) {
        clearInterval(timerRef);
      }
    };
  }, []);
  
  // Start timer
  const startTimer = () => {
    const startTime = Date.now();
    
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
      
      // Format as MM:SS
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setCurrentTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    
    setTimerRef(timer);
  };
  
  // Run code
  const runCode = () => {
    // In a real implementation, this would send the code to a backend for execution
    // For now, we'll just simulate output
    setOutput(`Running code...\n\nTest Case 1: Passed\nTest Case 2: Passed\nTest Case 3: Failed\n\nExecution completed in 0.05s`);
  };
  
  // Submit solution
  const submitSolution = () => {
    // In a real implementation, this would validate the solution against all test cases
    // For now, we'll just simulate a successful submission
    
    if (problemIndex < mockProblems.length - 1) {
      // Move to next problem
      setProblemIndex(problemIndex + 1);
      setCurrentProblem(mockProblems[problemIndex + 1]);
      setCode(mockProblems[problemIndex + 1].starterCode[currentLanguage]);
      setOutput('');
    } else {
      // Complete the interview
      endSession();
      setInterviewState('completed');
      
      // Stop timer
      if (timerRef) {
        clearInterval(timerRef);
      }
    }
  };
  
  // Change language
  const changeLanguage = (language) => {
    setCurrentLanguage(language);
    setCode(currentProblem.starterCode[language]);
  };
  
  // End interview
  const handleEndInterview = () => {
    endSession();
    setInterviewState('completed');
    
    // Stop timer
    if (timerRef) {
      clearInterval(timerRef);
    }
  };
  
  // Continue to HR interview
  const continueToHR = () => {
    navigate('/dashboard/interview/hr');
  };
  
  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Technical Interview Completed</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              You've successfully completed the technical assessment stage!
            </p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Assessment Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatTime(elapsedTime)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Problems Solved</p>
                <p className="font-medium text-gray-900 dark:text-white">{problemIndex + 1} of {mockProblems.length}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={continueToHR}
              className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Continue to HR Interview
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-[calc(100vh-80px)] bg-gray-50 dark:bg-slate-900 p-6 overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <CodeBracketIcon className="h-6 w-6 text-indigo-500 mr-2" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Technical Assessment</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-gray-700 dark:text-gray-300">
            <ClockIcon className="h-5 w-5" />
            <span>{currentTime}</span>
          </div>
          
          <div className="flex items-center space-x-1 text-gray-700 dark:text-gray-300">
            <span>Problem {problemIndex + 1}/{mockProblems.length}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
        {/* Problem Description */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 flex flex-col overflow-hidden">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentProblem?.title}
              </h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentProblem?.difficulty === 'Easy' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : currentProblem?.difficulty === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {currentProblem?.difficulty}
              </span>
            </div>
            
            <div className="border-b border-gray-200 dark:border-slate-700 mb-4"></div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-line">{currentProblem?.description}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => changeLanguage('javascript')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    currentLanguage === 'javascript'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  JavaScript
                </button>
                <button
                  onClick={() => changeLanguage('python')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    currentLanguage === 'python'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Python
                </button>
              </div>
              
              <button
                onClick={handleEndInterview}
                className="px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md text-sm"
              >
                End Assessment
              </button>
            </div>
          </div>
        </div>
        
        {/* Code Editor and Output */}
        <div className="flex flex-col overflow-hidden">
          {/* Code Editor */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 mb-4 flex-1 flex flex-col">
            <div className="mb-2 flex justify-between items-center">
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Solution</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCode(currentProblem.starterCode[currentLanguage])}
                  className="px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                >
                  Reset
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full p-3 font-mono text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  if (problemIndex > 0) {
                    setProblemIndex(problemIndex - 1);
                    setCurrentProblem(mockProblems[problemIndex - 1]);
                    setCode(mockProblems[problemIndex - 1].starterCode[currentLanguage]);
                    setOutput('');
                  }
                }}
                disabled={problemIndex === 0}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  problemIndex > 0
                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                Previous Problem
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={runCode}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors flex items-center"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Run Code
                </button>
                
                <button
                  onClick={submitSolution}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Submit
                </button>
              </div>
            </div>
          </div>
          
          {/* Output */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 h-1/3">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Output</h3>
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 h-[calc(100%-2rem)] overflow-y-auto">
              <pre className="text-sm font-mono text-gray-900 dark:text-white whitespace-pre-wrap">
                {output || 'Run your code to see output here...'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalInterview;
