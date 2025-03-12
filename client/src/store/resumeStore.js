import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import localStorage from '../utils/localStorage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Helper to convert File object to storable format
const fileToStorable = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        uploadDate: new Date().toISOString(),
        data: base64
      });
    };
    reader.readAsDataURL(file);
  });
};

// Helper to convert storable format back to File-like object
const storableToFile = (storable) => {
  if (!storable || !storable.data) return null;
  
  const byteString = atob(storable.data);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  const blob = new Blob([ab], { type: storable.type });
  return new File([blob], storable.name, { 
    type: storable.type,
    lastModified: new Date(storable.lastModified).getTime()
  });
};

// Helper to upload resume to server
const uploadResumeToServer = async (file, companyId, roleId, token) => {
  try {
    const formData = new FormData();
    formData.append('resume', file);
    
    if (companyId) formData.append('companyId', companyId);
    if (roleId) formData.append('roleId', roleId);
    
    const response = await axios.post(`${API_URL}/resumes/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading resume to server:', error);
    // Continue with local storage even if server upload fails
    return null;
  }
};

// Helper to upload a new version to server
const uploadVersionToServer = async (resumeId, file, notes, token) => {
  try {
    const formData = new FormData();
    formData.append('resume', file);
    
    if (notes) formData.append('notes', notes);
    
    const response = await axios.post(`${API_URL}/resumes/${resumeId}/version`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading resume version to server:', error);
    // Continue with local storage even if server upload fails
    return null;
  }
};

// Helper to save analysis results to server
const saveAnalysisToServer = async (resumeId, results, token) => {
  try {
    const response = await axios.post(`${API_URL}/resumes/${resumeId}/analysis`, {
      score: results.score,
      strengths: results.strengths,
      weaknesses: results.weaknesses,
      skillsMatched: results.skillsMatch.matched,
      skillsMissing: results.skillsMatch.missing,
      suggestions: results.suggestions
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error saving analysis to server:', error);
    // Continue with local storage even if server upload fails
    return null;
  }
};

// Helper to delete resume from server
const deleteResumeFromServer = async (resumeId, token) => {
  try {
    await axios.delete(`${API_URL}/resumes/${resumeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting resume from server:', error);
    // Continue with local storage even if server deletion fails
    return false;
  }
};

const useResumeStore = create(
  persist(
    (set, get) => ({
      resumes: [],
      currentResumeId: null,
      
      // Add a new resume
      addResume: async (file, companyId, roleId) => {
        try {
          const storableFile = await fileToStorable(file);
          const id = `resume_${Date.now()}`;
          const version = {
            id: `version_${Date.now()}`,
            createdAt: new Date().toISOString(),
            notes: 'Initial version'
          };
          
          const newResume = {
            id,
            file: storableFile,
            companyId,
            roleId,
            versions: [version],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Try to upload to server if user is logged in
          const token = localStorage.getFromLocalStorage('auth_token');
          if (token) {
            const serverResume = await uploadResumeToServer(file, companyId, roleId, token);
            if (serverResume) {
              // Use server-generated ID if available
              newResume.serverId = serverResume.id;
            }
          }
          
          set(state => ({
            resumes: [...state.resumes, newResume],
            currentResumeId: id
          }));
          
          return id;
        } catch (error) {
          console.error('Error adding resume:', error);
          throw error;
        }
      },
      
      // Get current resume
      getCurrentResume: () => {
        const { resumes, currentResumeId } = get();
        return resumes.find(resume => resume.id === currentResumeId) || null;
      },
      
      // Get file object for current resume
      getCurrentResumeFile: () => {
        const currentResume = get().getCurrentResume();
        if (!currentResume) return null;
        
        return storableToFile(currentResume.file);
      },
      
      // Add a new version to an existing resume
      addResumeVersion: async (resumeId, file, notes = '') => {
        try {
          const storableFile = await fileToStorable(file);
          const versionId = `version_${Date.now()}`;
          const version = {
            id: versionId,
            createdAt: new Date().toISOString(),
            notes
          };
          
          // Try to upload to server if user is logged in
          const resume = get().resumes.find(r => r.id === resumeId);
          if (resume && resume.serverId) {
            const token = localStorage.getFromLocalStorage('auth_token');
            if (token) {
              const serverVersion = await uploadVersionToServer(resume.serverId, file, notes, token);
              if (serverVersion) {
                // Use server-generated ID if available
                version.serverId = serverVersion.id;
              }
            }
          }
          
          set(state => ({
            resumes: state.resumes.map(resume => {
              if (resume.id === resumeId) {
                return {
                  ...resume,
                  file: storableFile,
                  versions: [...resume.versions, version],
                  updatedAt: new Date().toISOString()
                };
              }
              return resume;
            })
          }));
          
          return versionId;
        } catch (error) {
          console.error('Error adding resume version:', error);
          throw error;
        }
      },
      
      // Delete a resume
      deleteResume: async (resumeId) => {
        const resume = get().resumes.find(r => r.id === resumeId);
        
        // Try to delete from server if user is logged in
        if (resume && resume.serverId) {
          const token = localStorage.getFromLocalStorage('auth_token');
          if (token) {
            await deleteResumeFromServer(resume.serverId, token);
          }
        }
        
        set(state => ({
          resumes: state.resumes.filter(resume => resume.id !== resumeId),
          currentResumeId: state.currentResumeId === resumeId ? null : state.currentResumeId
        }));
      },
      
      // Set the current resume
      setCurrentResume: (resumeId) => {
        set({ currentResumeId: resumeId });
      },
      
      // Store analysis results
      saveAnalysisResults: async (resumeId, results) => {
        const resume = get().resumes.find(r => r.id === resumeId);
        
        // Try to save to server if user is logged in
        if (resume && resume.serverId) {
          const token = localStorage.getFromLocalStorage('auth_token');
          if (token) {
            await saveAnalysisToServer(resume.serverId, results, token);
          }
        }
        
        set(state => ({
          resumes: state.resumes.map(resume => {
            if (resume.id === resumeId) {
              return {
                ...resume,
                analysis: results,
                updatedAt: new Date().toISOString()
              };
            }
            return resume;
          })
        }));
      },
      
      // Get analysis results for a resume
      getAnalysisResults: (resumeId) => {
        const resume = get().resumes.find(r => r.id === resumeId);
        return resume ? resume.analysis : null;
      },
      
      // Get analysis results for current resume
      getCurrentAnalysisResults: () => {
        const currentResume = get().getCurrentResume();
        return currentResume ? currentResume.analysis : null;
      },
      
      // Sync with server - can be called on app init to fetch resumes from server
      syncWithServer: async () => {
        try {
          const token = localStorage.getFromLocalStorage('auth_token');
          if (!token) return;
          
          const response = await axios.get(`${API_URL}/resumes`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          // TODO: Merge server resumes with local resumes
          // This is a simplified implementation
          const serverResumes = response.data;
          
          // For now, we'll just update the serverId for any matching resumes
          set(state => ({
            resumes: state.resumes.map(localResume => {
              const matchingServerResume = serverResumes.find(
                sr => sr.fileName === localResume.file.name && 
                     new Date(sr.createdAt).getTime() - new Date(localResume.createdAt).getTime() < 60000
              );
              
              if (matchingServerResume) {
                return {
                  ...localResume,
                  serverId: matchingServerResume.id
                };
              }
              
              return localResume;
            })
          }));
        } catch (error) {
          console.error('Error syncing with server:', error);
        }
      }
    }),
    {
      name: 'aips-resume-storage',
      getStorage: () => ({
        getItem: (name) => localStorage.getFromLocalStorage(name),
        setItem: (name, value) => localStorage.saveToLocalStorage(name, value),
        removeItem: (name) => localStorage.removeFromLocalStorage(name)
      })
    }
  )
);

export default useResumeStore;
