import { Link } from 'react-router-dom';
import { FaRocket, FaChartLine, FaUserTie, FaFileAlt } from 'react-icons/fa';

const HeroSection = () => {
  return (
    <div className="w-full dark:bg-dark-primary transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-90 dark:opacity-80"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative pt-10 pb-20 sm:pt-16 sm:pb-24 lg:pt-24 lg:pb-28 z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-slide-up">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
                  Prepare for interviews with <span className="text-yellow-300">AI assistance</span>
                </h1>
                <p className="text-xl text-indigo-100 mb-8 max-w-xl">
                  AIPS helps you analyze your resume, practice technical assessments, and prepare for interviews with AI-powered tools.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/register" className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg shadow-lg hover:bg-indigo-50 transform transition-all duration-300 hover:scale-105">
                    Get Started
                  </Link>
                  <Link to="/login" className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transform transition-all duration-300 hover:scale-105">
                    Sign In
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block animate-fade-in">
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg blur opacity-75"></div>
                  <div className="relative bg-white dark:bg-dark-secondary p-6 rounded-lg shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Interview Simulator</div>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div className="p-3 bg-gray-100 dark:bg-dark-accent rounded">
                        <p className="font-medium text-gray-800 dark:text-dark-text">Interviewer:</p>
                        <p className="text-gray-600 dark:text-dark-muted">Tell me about your experience with React.</p>
                      </div>
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded">
                        <p className="font-medium text-indigo-800 dark:text-indigo-300">You:</p>
                        <p className="text-indigo-600 dark:text-indigo-400">I've been working with React for 3 years, building responsive web applications...</p>
                      </div>
                      <div className="p-3 bg-gray-100 dark:bg-dark-accent rounded">
                        <p className="font-medium text-gray-800 dark:text-dark-text">Interviewer:</p>
                        <p className="text-gray-600 dark:text-dark-muted">How would you handle state management in a large application?</p>
                      </div>
                      <div className="flex items-center">
                        <span className="block w-2 h-5 bg-indigo-600 animate-pulse rounded"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-dark-text sm:text-4xl animate-slide-up">
              Comprehensive Interview Preparation
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-dark-muted max-w-2xl mx-auto animate-slide-up">
              Our AI-powered platform helps you prepare for every aspect of the interview process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
            <div className="bg-indigo-50 dark:bg-dark-accent p-6 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 animate-fade-in">
              <div className="text-indigo-600 dark:text-indigo-400 mb-4">
                <FaFileAlt className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-2">Resume Analysis</h3>
              <p className="text-gray-600 dark:text-dark-muted">
                Get AI-powered feedback on your resume to highlight strengths and improve weak areas.
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-dark-accent p-6 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 animate-fade-in delay-100">
              <div className="text-indigo-600 dark:text-indigo-400 mb-4">
                <FaRocket className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-2">Job Matching</h3>
              <p className="text-gray-600 dark:text-dark-muted">
                Find the perfect job matches based on your skills, experience, and career goals.
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-dark-accent p-6 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 animate-fade-in delay-200">
              <div className="text-indigo-600 dark:text-indigo-400 mb-4">
                <FaChartLine className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-2">Technical Assessment</h3>
              <p className="text-gray-600 dark:text-dark-muted">
                Practice technical questions tailored to your target role and receive instant feedback.
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-dark-accent p-6 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 animate-fade-in delay-300">
              <div className="text-indigo-600 dark:text-indigo-400 mb-4">
                <FaUserTie className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-2">Virtual Interviews</h3>
              <p className="text-gray-600 dark:text-dark-muted">
                Simulate real interviews with our AI interviewer and get detailed performance analytics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 dark:bg-indigo-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl animate-slide-up">
            <span className="block">Ready to boost your interview success?</span>
            <span className="block text-indigo-200">Start your preparation journey today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 animate-slide-up">
            <div className="inline-flex rounded-md shadow">
              <Link to="/register" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transform transition-all duration-300 hover:scale-105">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;