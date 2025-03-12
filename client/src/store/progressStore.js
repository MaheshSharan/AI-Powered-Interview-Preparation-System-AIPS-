import { create } from 'zustand';
import { saveUserProgress, getUserProgress } from '../utils/localStorage';

/**
 * Progress tracking store using Zustand
 * Manages user progress state and persists to local storage
 */
const useProgressStore = create((set, get) => {
  // Load initial state from local storage
  const savedProgress = getUserProgress();
  
  return {
    // Initial state
    companySelection: savedProgress?.companySelection || false,
    resumeAnalysis: savedProgress?.resumeAnalysis || false,
    technicalAssessment: savedProgress?.technicalAssessment || false,
    virtualInterview: savedProgress?.virtualInterview || false,
    overallCompletion: savedProgress?.overallCompletion || 0,
    
    // Actions
    updateProgress: (key, value) => {
      set({ [key]: value });
      
      // Update overall completion
      const state = get();
      const newState = { ...state, [key]: value };
      const overallCompletion = calculateOverallProgress(newState);
      
      set({ overallCompletion });
      
      // Save to local storage
      saveUserProgress({
        ...newState,
        overallCompletion
      });
    },
    
    resetProgress: () => {
      const initialState = {
        companySelection: false,
        resumeAnalysis: false,
        technicalAssessment: false,
        virtualInterview: false,
        overallCompletion: 0
      };
      
      set(initialState);
      
      // Save to local storage
      saveUserProgress(initialState);
    },
    
    // Get next step for the user
    getNextStep: () => {
      const state = get();
      
      if (!state.companySelection) return 'company';
      if (!state.resumeAnalysis) return 'resume';
      if (!state.technicalAssessment) return 'technical';
      if (!state.virtualInterview) return 'interview';
      
      return 'analytics'; // All steps completed
    }
  };
});

// Helper function to calculate overall progress
const calculateOverallProgress = (progress) => {
  const steps = ['companySelection', 'resumeAnalysis', 'technicalAssessment', 'virtualInterview'];
  const completedSteps = steps.filter(step => progress[step]).length;
  return Math.round((completedSteps / steps.length) * 100);
};

export default useProgressStore;
