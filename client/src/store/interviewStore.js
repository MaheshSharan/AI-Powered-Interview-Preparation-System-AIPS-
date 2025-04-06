import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import localStorage from '../utils/localStorage';
import useResumeStore from './resumeStore';
import useCompanyStore from './companyStore';

const useInterviewStore = create(
  persist(
    (set, get) => ({
      // Interview session state
      currentSession: null,
      interviewType: null, // 'virtual', 'technical', 'hr'
      sessionStartTime: null,
      
      // Resume and company data
      resumeData: null,
      companyData: null,
      
      // Interview progress
      currentQuestionIndex: 0,
      questions: [],
      answers: [],
      
      // Behavioral analysis data
      behavioralMetrics: {
        eyeContact: 0,
        confidence: 0,
        clarity: 0,
        posture: 0
      },

      // Initialize interview session
      initializeSession: (type = 'virtual') => {
        const resumeStore = useResumeStore.getState();
        const companyStore = useCompanyStore.getState();
        
        // Get current resume analysis
        const resumeData = resumeStore.getCurrentAnalysisResults();
        
        // Get company and role data
        const companyData = {
          company: companyStore.selectedCompany,
          role: companyStore.selectedRole,
          experienceLevel: companyStore.experienceLevel
        };
        
        set({
          currentSession: {
            id: Date.now().toString(),
            type,
            status: 'initialized'
          },
          interviewType: type,
          sessionStartTime: new Date().toISOString(),
          resumeData,
          companyData,
          currentQuestionIndex: 0,
          questions: [],
          answers: [],
          behavioralMetrics: {
            eyeContact: 0,
            confidence: 0,
            clarity: 0,
            posture: 0
          }
        });
        
        // Return the initialized data for immediate use
        return {
          resumeData,
          companyData
        };
      },

      // Update behavioral metrics
      updateBehavioralMetrics: (metrics) => {
        set((state) => ({
          behavioralMetrics: {
            ...state.behavioralMetrics,
            ...metrics
          }
        }));
      },

      // Add a question to the session
      addQuestion: (question) => {
        set((state) => ({
          questions: [...state.questions, question]
        }));
      },

      // Add an answer to the session
      addAnswer: (answer) => {
        set((state) => ({
          answers: [...state.answers, {
            questionIndex: state.currentQuestionIndex,
            answer,
            timestamp: new Date().toISOString()
          }]
        }));
      },

      // Move to next question
      nextQuestion: () => {
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1
        }));
      },

      // End interview session
      endSession: () => {
        set((state) => ({
          currentSession: {
            ...state.currentSession,
            status: 'completed',
            endTime: new Date().toISOString()
          }
        }));
      },

      // Get current session data
      getCurrentSession: () => {
        return get().currentSession;
      },

      // Get full session data including Q&A
      getSessionData: () => {
        const state = get();
        return {
          session: state.currentSession,
          type: state.interviewType,
          startTime: state.sessionStartTime,
          resumeData: state.resumeData,
          companyData: state.companyData,
          questions: state.questions,
          answers: state.answers,
          behavioralMetrics: state.behavioralMetrics
        };
      }
    }),
    {
      name: 'aips-interview-storage',
      getStorage: () => ({
        getItem: (name) => localStorage.getFromLocalStorage(name),
        setItem: (name, value) => localStorage.saveToLocalStorage(name, value),
        removeItem: (name) => localStorage.removeFromLocalStorage(name)
      })
    }
  )
);

export default useInterviewStore;
