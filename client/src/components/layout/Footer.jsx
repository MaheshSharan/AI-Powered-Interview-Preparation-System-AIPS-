import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 dark:bg-dark-secondary text-white py-8 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">AIPS</h3>
            <p className="text-gray-300 text-sm">
              AI-Powered Interview Preparation System helps job seekers prepare for interviews through AI-powered tools for resume analysis, technical assessments, and virtual interview practice.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/resume-analysis" className="text-gray-300 hover:text-white transition-colors">Resume Analysis</Link></li>
              <li><Link to="/job-selection" className="text-gray-300 hover:text-white transition-colors">Job Selection</Link></li>
              <li><Link to="/technical-assessment" className="text-gray-300 hover:text-white transition-colors">Technical Assessment</Link></li>
              <li><Link to="/virtual-interview" className="text-gray-300 hover:text-white transition-colors">Virtual Interview</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-300 text-sm mb-2">Have questions or feedback?</p>
            <a 
              href="mailto:support@aips.com" 
              className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
            >
              support@aips.com
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} AI-Powered Interview Preparation System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;