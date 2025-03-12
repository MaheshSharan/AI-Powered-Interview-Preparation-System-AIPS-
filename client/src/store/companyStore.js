import { create } from 'zustand';
import { saveCompanySelection, getCompanySelection, saveUserProgress, getUserProgress } from '../utils/localStorage';

/**
 * Company selection store using Zustand
 * Manages company selection state and persists to local storage
 */
const useCompanyStore = create((set, get) => {
  // Load initial state from local storage
  const savedSelection = getCompanySelection();
  
  return {
    // Initial state
    selectedCompany: savedSelection?.company || null,
    selectedRole: savedSelection?.role || null,
    experienceLevel: savedSelection?.experienceLevel || null,
    
    // Actions
    setCompany: (companyId) => {
      set({ 
        selectedCompany: companyId,
        selectedRole: null,
        experienceLevel: null
      });
      
      // Save to local storage
      saveCompanySelection({
        company: companyId,
        role: null,
        experienceLevel: null
      });
      
      // Update progress
      const progress = getUserProgress();
      progress.companySelection = true;
      progress.overallCompletion = calculateOverallProgress(progress);
      saveUserProgress(progress);
    },
    
    setRole: (role) => {
      set({ 
        selectedRole: role,
        experienceLevel: null
      });
      
      // Save to local storage
      const { selectedCompany } = get();
      saveCompanySelection({
        company: selectedCompany,
        role: role,
        experienceLevel: null
      });
    },
    
    setExperienceLevel: (level) => {
      set({ experienceLevel: level });
      
      // Save to local storage
      const { selectedCompany, selectedRole } = get();
      saveCompanySelection({
        company: selectedCompany,
        role: selectedRole,
        experienceLevel: level
      });
      
      // Update progress
      const progress = getUserProgress();
      progress.companySelection = true;
      progress.overallCompletion = calculateOverallProgress(progress);
      saveUserProgress(progress);
    },
    
    resetSelection: () => {
      set({ 
        selectedCompany: null,
        selectedRole: null,
        experienceLevel: null
      });
      
      // Save to local storage
      saveCompanySelection({
        company: null,
        role: null,
        experienceLevel: null
      });
    },
    
    // Helper to check if selection is complete
    isSelectionComplete: () => {
      const { selectedCompany, selectedRole, experienceLevel } = get();
      return selectedCompany && selectedRole && experienceLevel;
    }
  };
});

// Helper function to calculate overall progress
const calculateOverallProgress = (progress) => {
  const steps = ['companySelection', 'resumeAnalysis', 'technicalAssessment', 'virtualInterview'];
  const completedSteps = steps.filter(step => progress[step]).length;
  return Math.round((completedSteps / steps.length) * 100);
};

export default useCompanyStore;
