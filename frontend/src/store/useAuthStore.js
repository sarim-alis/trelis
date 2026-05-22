import { create } from 'zustand';
import api from '../lib/api';
import { initSocket, disconnectSocket } from '../lib/socket';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    set({ user: response.data.user, isAuthenticated: true });
    
    const tokenResponse = await api.get('/auth/me');
    if (tokenResponse.data.user) {
      const token = document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];
      initSocket(token);
    }
    
    return response.data;
  },

  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    set({ user: response.data.user, isAuthenticated: true });
    
    const token = document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];
    initSocket(token);
    
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null, isAuthenticated: false });
    disconnectSocket();
  },

  checkAuth: async () => {
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      
      const token = document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];
      if (token) {
        initSocket(token);
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
