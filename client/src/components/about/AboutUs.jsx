import { motion } from 'framer-motion';
import {
  BeakerIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CodeBracketIcon,
  UserGroupIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const AboutUs = () => {
  const features = [
    {
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms analyze your responses and provide real-time feedback.',
      icon: BeakerIcon
    },
    {
      title: 'Privacy First',
      description: 'Your data stays local. We use WebAssembly and local processing to ensure your privacy.',
      icon: ShieldCheckIcon
    },
    {
      title: 'Multi-modal Feedback',
      description: 'Comprehensive analysis of your speech, facial expressions, and technical responses.',
      icon: ChartBarIcon
    },
    {
      title: 'Technical Assessment',
      description: 'Practice coding challenges and system design questions in a real-world environment.',
      icon: CodeBracketIcon
    }
  ];

  const benefits = [
    {
      title: 'Practice Like It\'s Real',
      description: 'Experience true-to-life interview scenarios that prepare you for actual tech interviews.',
      icon: UserGroupIcon
    },
    {
      title: 'Continuous Improvement',
      description: 'Track your progress and receive targeted suggestions to enhance your interview performance.',
      icon: RocketLaunchIcon
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-4 font-outfit">
            About AIPS
          </h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-slate-400 mb-12 max-w-3xl mx-auto"
          >
            Welcome to AIPS - your AI-powered companion for mastering technical interviews. We combine cutting-edge technology with personalized feedback to help you land your dream tech role.
          </motion.div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-16 max-w-4xl mx-auto bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 rounded-xl p-8 backdrop-blur-sm border border-slate-800"
          >
            <h2 className="text-2xl font-bold text-white mb-4 font-outfit">Our Mission</h2>
            <p className="text-slate-300 text-lg">
              We believe everyone deserves a fair shot at their dream job. Our platform democratizes interview preparation by providing professional-grade tools and AI-driven feedback, making top-tier interview preparation accessible to all.
            </p>
          </motion.div>

          {/* Core Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-all duration-300 flex items-start"
              >
                <div className="shrink-0 text-purple-400 mr-4">
                  <feature.icon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Why Choose Us */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="max-w-4xl mx-auto text-left"
          >
            <h2 className="text-2xl font-bold text-white mb-8 font-outfit text-center">Why Choose AIPS?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  className="flex gap-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white shrink-0">
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                    <p className="text-slate-400">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;