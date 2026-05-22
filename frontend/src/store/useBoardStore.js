import { create } from 'zustand';
import api from '../lib/api';

export const useBoardStore = create((set, get) => ({
  boards: [],
  currentBoard: null,
  tasks: [],
  activities: [],
  isLoading: false,

  fetchBoards: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/boards');
      set({ boards: response.data.boards, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch boards:', error);
      set({ isLoading: false });
    }
  },

  fetchBoard: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/boards/${id}`);
      set({ currentBoard: response.data.board, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch board:', error);
      set({ isLoading: false });
    }
  },

  createBoard: async (title, description) => {
    const response = await api.post('/boards', { title, description });
    set({ boards: [response.data.board, ...get().boards] });
    return response.data.board;
  },

  updateBoard: async (id, data) => {
    const response = await api.put(`/boards/${id}`, data);
    set({
      boards: get().boards.map(b => b._id === id ? response.data.board : b),
      currentBoard: response.data.board
    });
  },

  deleteBoard: async (id) => {
    await api.delete(`/boards/${id}`);
    set({ boards: get().boards.filter(b => b._id !== id) });
  },

  fetchTasks: async (boardId, search = '') => {
    try {
      const response = await api.get(`/tasks/board/${boardId}`, {
        params: { search }
      });
      set({ tasks: response.data.tasks });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  },

  createTask: async (boardId, title, description, status = 'todo') => {
    const response = await api.post('/tasks', { boardId, title, description, status });
    set({ tasks: [...get().tasks, response.data.task] });
    return response.data.task;
  },

  updateTask: async (id, data) => {
    try {
      const response = await api.put(`/tasks/${id}`, data);
      set({
        tasks: get().tasks.map(t => t._id === id ? response.data.task : t)
      });
      return response.data.task;
    } catch (error) {
      console.error('Failed to update task:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`);
    set({ tasks: get().tasks.filter(t => t._id !== id) });
  },

  reorderTasks: async (boardId, tasks) => {
    try {
      await api.put(`/tasks/board/${boardId}/reorder`, { tasks });
      set({ tasks: get().tasks.map(t => {
        const updated = tasks.find(ut => ut.id === t._id);
        return updated ? { ...t, status: updated.status, order: updated.order } : t;
      })});
    } catch (error) {
      console.error('Failed to reorder tasks:', error.response?.data || error.message);
      throw error;
    }
  },

  fetchActivities: async (boardId) => {
    try {
      const response = await api.get(`/activities/board/${boardId}`);
      set({ activities: response.data.activities });
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  },

  addTask: (task) => {
    set({ tasks: [...get().tasks, task] });
  },

  removeTask: (taskId) => {
    set({ tasks: get().tasks.filter(t => t._id !== taskId) });
  },

  updateTaskInStore: (task) => {
    set({ tasks: get().tasks.map(t => t._id === task._id ? task : t) });
  }
}));
