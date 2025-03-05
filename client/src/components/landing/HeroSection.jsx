import { Link } from 'react-router-dom';
import { FaRocket, FaChartLine, FaUserTie, FaFileAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <motion.div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center">
        {/* Updated background gradient that blends into the next section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-b from-indigo-600 via-purple-600 to-slate-900"
        />
        
        {/* Add an extra gradient overlay for smoother transition */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
                Master Your 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-100">
                  {" "}Interview
                </span>
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
            </motion.div>
            
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
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
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-slate-900">
        <div className="max-w-[2000px] mx-auto">
          <div className="py-16 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl animate-slide-up">
                  Comprehensive Interview Preparation
                </h2>
                <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto animate-slide-up">
                  Our AI-powered platform helps you prepare for every aspect of the interview process.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
                {[
                  {
                    icon: FaFileAlt,
                    title: "Resume Analysis",
                    description: "Get AI-powered feedback on your resume to highlight strengths and improve weak areas."
                  },
                  {
                    icon: FaRocket,
                    title: "Job Matching",
                    description: "Find the perfect job matches based on your skills, experience, and career goals."
                  },
                  {
                    icon: FaChartLine,
                    title: "Technical Assessment",
                    description: "Practice technical questions tailored to your target role and receive instant feedback."
                  },
                  {
                    icon: FaUserTie,
                    title: "Virtual Interviews",
                    description: "Simulate real interviews with our AI interviewer and get detailed performance analytics."
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="text-[#646cff] mb-4">
                      <feature.icon className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - New Addition */}
      <section className="w-full bg-slate-900/95 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-white">
                Why Choose AIPS?
              </h2>
              <div className="space-y-4">
                {[
                  "AI-powered feedback for continuous improvement",
                  "Personalized learning path based on your goals",
                  "Real-time performance analytics",
                  "Industry-specific interview preparation",
                  "24/7 access to practice resources"
                ].map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <svg className="w-5 h-5 text-[#646cff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#646cff]/20 to-purple-500/20 rounded-lg blur-xl"></div>
              <div className="relative bg-slate-800/50 backdrop-blur rounded-lg p-8 border border-slate-700">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Success Rate</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-2 w-64 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-[85%] bg-gradient-to-r from-[#646cff] to-purple-500 rounded-full"></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Interview Success</span>
                        <span className="text-[#646cff] font-semibold">85%</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-4">
                    Our users report an 85% success rate in their job interviews after using AIPS
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default HeroSection;