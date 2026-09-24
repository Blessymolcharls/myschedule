import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('myschedule_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('myschedule_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const userApi = {
  updateProfile: (data) => api.put('/users/profile', data),
  getPreferences: () => api.get('/users/preferences'),
  updatePreferences: (data) => api.put('/users/preferences', data),
};

export const taskApi = {
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (data) => api.post('/tasks', data),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  completeTask: (id) => api.patch(`/tasks/${id}/complete`),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const categoryApi = {
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export const commitmentApi = {
  getCommitments: () => api.get('/commitments'),
  createCommitment: (data) => api.post('/commitments', data),
  updateCommitment: (id, data) => api.put(`/commitments/${id}`, data),
  deleteCommitment: (id) => api.delete(`/commitments/${id}`),
};

export const scheduleApi = {
  getEvents: (params) => api.get('/schedule/events', { params }),
  autoGenerate: (data) => api.post('/schedule/auto-generate', data),
  checkConflict: (data) => api.post('/schedule/check-conflict', data),
  updateEvent: (id, data) => api.put(`/schedule/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/schedule/events/${id}`),
};

export const timeLogApi = {
  getTimeLogs: (params) => api.get('/time-logs', { params }),
  getActive: () => api.get('/time-logs/active'),
  startTimer: (data) => api.post('/time-logs/start', data),
  stopTimer: (id, data) => api.post(`/time-logs/stop/${id}`, data),
  logManual: (data) => api.post('/time-logs/manual', data),
};

export const streakApi = {
  getSummary: () => api.get('/streaks/summary'),
  getAdherenceHistory: (params) => api.get('/streaks/adherence-history', { params }),
  evaluateDay: (data) => api.post('/streaks/evaluate-day', data),
  applyFreeze: (data) => api.post('/streaks/freeze', data),
  recover: () => api.post('/streaks/recover'),
};

export const analyticsApi = {
  getAnalytics: (params) => api.get('/analytics', { params }),
};

export const reminderApi = {
  getReminders: () => api.get('/reminders'),
  markRead: (id) => api.patch(`/reminders/${id}/read`),
  dismiss: (id) => api.patch(`/reminders/${id}/dismiss`),
};

export default api;
