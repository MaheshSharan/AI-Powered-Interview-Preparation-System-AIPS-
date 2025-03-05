import { motion } from 'framer-motion';
import { FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="w-full py-6 bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-4 flex items-center justify-center gap-3">
        <motion.a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -2 }}
          className="text-gray-400 hover:text-[#646cff] transition-colors"
        >
          <FaGithub className="w-6 h-6" />
        </motion.a>
        <span className="text-gray-400">© 2025 AIPS</span>
      </div>
    </footer>
  );
};

export default Footer;