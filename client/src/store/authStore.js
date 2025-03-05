import { create } from 'zustand';
import axios from 'axios';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  currentRegistrationStep: 1,

  setAuth: (user, token) => {
    console.log('Setting auth state:', { 
      hasUser: !!user, 
      hasToken: !!token,
      userData: user 
    });
    
    localStorage.setItem('token', token);
    console.log('Token stored in localStorage');
    
    // Add artificial delay to show loading state
    setTimeout(() => {
      set({ 
        user, 
        isAuthenticated: true,
        currentRegistrationStep: user.registrationStep || 1,
        loading: false
      });
      console.log('Auth state updated successfully');
    }, 1000);
  },

  checkAuth: async () => {
    console.log('Checking authentication...');
    set({ loading: true });
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', !!token);
      
      if (!token) {
        // Add artificial delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 1000));
        throw new Error('No token');
      }

      console.log('Fetching user data...');
      const res = await axios.get('/auth/me');
      console.log('User data received:', { 
        hasUser: !!res.data.user,
        userData: res.data.user 
      });
      
      // Add artificial delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set({ 
        user: res.data.user,
        isAuthenticated: true,
        currentRegistrationStep: res.data.user.registrationStep || 1,
        loading: false
      });
      console.log('Auth state updated from /me endpoint');
    } catch (err) {
      console.error('Auth check failed:', err.message);
      localStorage.removeItem('token');
      set({ 
        user: null, 
        isAuthenticated: false, 
        loading: false,
        currentRegistrationStep: 1
      });
      console.log('Auth state reset due to error');
    }
  },

  updateRegistrationStep: async (step) => {
    try {
      const { user } = get();
      console.log('Updating registration step:', { step, userId: user.id });
      
      const response = await axios.put(`/auth/registration-step`, { 
        userId: user.id, 
        step 
      });
      set({ currentRegistrationStep: step });
      console.log('Registration step updated successfully');
      return response.data;
    } catch (error) {
      console.error('Failed to update registration step:', error);
      throw error;
    }
  },

  logout: () => {
    console.log('Logging out...');
    set({ loading: true });
    localStorage.removeItem('token');
    
    // Add artificial delay to show loading state
    setTimeout(() => {
      set({ 
        user: null, 
        isAuthenticated: false,
        loading: false,
        currentRegistrationStep: 1
      });
      console.log('Logout complete');
    }, 1000);
  }
}));
