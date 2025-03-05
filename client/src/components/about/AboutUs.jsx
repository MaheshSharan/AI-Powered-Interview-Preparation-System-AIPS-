import { motion } from 'framer-motion';
import { FaRobot, FaShieldAlt, FaLightbulb, FaCode } from 'react-icons/fa';

const AboutUs = () => {
  const features = [
    {
      icon: <FaRobot className="h-6 w-6 text-indigo-400" />,
      title: 'AI-Powered Interviews',
      description: 'Experience realistic interview simulations powered by advanced AI technology.'
    },
    {
      icon: <FaShieldAlt className="h-6 w-6 text-purple-400" />,
      title: 'Privacy First',
      description: 'Your data stays local. We prioritize your privacy and security above all.'
    },
    {
      icon: <FaLightbulb className="h-6 w-6 text-pink-400" />,
      title: 'Smart Feedback',
      description: 'Receive instant, personalized feedback to improve your interview performance.'
    },
    {
      icon: <FaCode className="h-6 w-6 text-indigo-400" />,
      title: 'Technical Assessment',
      description: 'Practice coding challenges and system design questions in a real-world environment.'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-slate-900 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">About AIPS</h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            AI-Powered Interview Preparation System (AIPS) is designed to revolutionize how you prepare for technical interviews.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col rounded-2xl bg-slate-800/50 p-6 ring-1 ring-inset ring-slate-700/50 hover:bg-slate-800 transition-colors duration-300"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  {feature.icon}
                  {feature.title}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>

        <div className="mx-auto mt-16 max-w-2xl text-center">
          <h3 className="text-2xl font-bold tracking-tight text-white">Our Mission</h3>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            We're committed to making interview preparation more accessible, effective, and privacy-focused. 
            Our platform combines cutting-edge AI technology with a user-centric design to help you succeed in your technical interviews.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AboutUs;