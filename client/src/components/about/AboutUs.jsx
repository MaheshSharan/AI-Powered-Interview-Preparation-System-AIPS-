import React from 'react';

const AboutUs = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-dark-secondary rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600 dark:text-indigo-400">About AIPS</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Our Mission</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            At AIPS (AI-Powered Interview Preparation System), our mission is to empower job seekers with cutting-edge AI tools that help them prepare for interviews, improve their resumes, and ultimately land their dream jobs.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            We believe that everyone deserves access to high-quality interview preparation resources, regardless of their background or experience level.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">What We Offer</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-xl font-medium mb-2 text-indigo-600 dark:text-indigo-400">Resume Analysis</h3>
              <p className="text-gray-700 dark:text-gray-300">Our AI analyzes your resume and provides actionable feedback to help you stand out to recruiters.</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-xl font-medium mb-2 text-indigo-600 dark:text-indigo-400">Job Selection</h3>
              <p className="text-gray-700 dark:text-gray-300">Find the perfect job match based on your skills, experience, and career goals.</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-xl font-medium mb-2 text-indigo-600 dark:text-indigo-400">Technical Assessment</h3>
              <p className="text-gray-700 dark:text-gray-300">Practice with realistic technical assessments tailored to your target roles.</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-xl font-medium mb-2 text-indigo-600 dark:text-indigo-400">Virtual Interviews</h3>
              <p className="text-gray-700 dark:text-gray-300">Simulate real interview experiences with our AI interviewer and receive instant feedback.</p>
            </div>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Our Team</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            AIPS was founded by a team of AI experts, career coaches, and HR professionals who understand the challenges of the modern job market.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            We're constantly improving our platform based on user feedback and the latest developments in AI technology.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Contact Us</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Have questions or feedback? We'd love to hear from you!
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <span className="font-medium">Email:</span> support@aips.example.com
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Hours:</span> Monday-Friday, 9am-5pm EST
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;