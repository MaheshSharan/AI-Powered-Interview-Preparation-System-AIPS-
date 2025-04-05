/**
 * Local storage utility functions for AIPS
 * Handles storing and retrieving user data with encryption for privacy
 */

// Encryption key (in a real app, this would be generated and stored securely)
const ENCRYPTION_KEY = 'AIPS_SECURE_KEY';

/**
 * Simple encryption function for local storage
 * Note: This is a basic implementation. In production, use a proper encryption library.
 */
const encrypt = (data) => {
  try {
    // For demonstration - in production use a proper encryption library
    const stringData = JSON.stringify(data);
    // Fix for Unicode characters - encode to UTF-8 first
    const encodedData = encodeURIComponent(stringData).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode('0x' + p1);
    });
    return btoa(encodedData); // Base64 encoding as simple obfuscation
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

/**
 * Simple decryption function for local storage
 */
const decrypt = (encryptedData) => {
  try {
    // For demonstration - in production use a proper decryption library
    const decodedData = atob(encryptedData); // Base64 decoding
    // Decode UTF-8 characters
    const decodedStr = decodeURIComponent(decodedData.split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(decodedStr);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Save data to local storage with encryption
 */
export const saveToLocalStorage = (key, data) => {
  try {
    const encryptedData = encrypt(data);
    localStorage.setItem(`aips_${key}`, encryptedData);
    return true;
  } catch (error) {
    console.error('Error saving to local storage:', error);
    return false;
  }
};

/**
 * Get data from local storage with decryption
 */
export const getFromLocalStorage = (key) => {
  try {
    const encryptedData = localStorage.getItem(`aips_${key}`);
    if (!encryptedData) return null;
    return decrypt(encryptedData);
  } catch (error) {
    console.error('Error retrieving from local storage:', error);
    return null;
  }
};

/**
 * Remove data from local storage
 */
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(`aips_${key}`);
    return true;
  } catch (error) {
    console.error('Error removing from local storage:', error);
    return false;
  }
};

/**
 * Clear all AIPS data from local storage
 */
export const clearAllLocalStorage = () => {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('aips_')) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Error clearing local storage:', error);
    return false;
  }
};

/**
 * Save user progress data
 */
export const saveUserProgress = (progressData) => {
  return saveToLocalStorage('user_progress', progressData);
};

/**
 * Get user progress data
 */
export const getUserProgress = () => {
  return getFromLocalStorage('user_progress') || {
    companySelection: false,
    resumeAnalysis: false,
    technicalAssessment: false,
    virtualInterview: false,
    overallCompletion: 0
  };
};

/**
 * Save company selection data
 */
export const saveCompanySelection = (companyData) => {
  return saveToLocalStorage('company_selection', companyData);
};

/**
 * Get company selection data
 */
export const getCompanySelection = () => {
  return getFromLocalStorage('company_selection') || {
    company: null,
    role: null,
    experienceLevel: null
  };
};

/**
 * Check if user has completed onboarding
 */
export const hasCompletedOnboarding = () => {
  const onboardingStatus = getFromLocalStorage('onboarding_completed');
  return onboardingStatus === true;
};

/**
 * Mark onboarding as completed
 */
export const markOnboardingCompleted = () => {
  return saveToLocalStorage('onboarding_completed', true);
};

export default {
  saveToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
  clearAllLocalStorage,
  saveUserProgress,
  getUserProgress,
  saveCompanySelection,
  getCompanySelection,
  hasCompletedOnboarding,
  markOnboardingCompleted
};
