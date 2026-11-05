import axios from 'axios';

const API_BASE = '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present in localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (username, password) => apiClient.post('/auth/login', { username, password }),
  register: (username, email, password) => apiClient.post('/auth/register', { username, email, password }),
  logout: () => apiClient.post('/auth/logout'),
  getCurrentUser: () => apiClient.get('/auth/me'),
};

export const programAPI = {
  list: () => apiClient.get('/programs'),
  get: (id) => apiClient.get(`/programs/${id}`),
  create: (data) => apiClient.post('/programs', data),
  update: (id, data) => apiClient.put(`/programs/${id}`, data),
  delete: (id) => apiClient.delete(`/programs/${id}`),
};

export const executionAPI = {
  execute: (data) => apiClient.post('/execution', data),
  executePig: (data) => apiClient.post('/execution/pig', data),
  executeMapReduce: (data) => apiClient.post('/execution/mapreduce', data),
  history: () => apiClient.get('/execution/history'),
  getExecution: (id) => apiClient.get(`/execution/${id}`),
  stop: (id) => apiClient.post(`/execution/${id}/stop`),
};

export const fileAPI = {
  list: () => apiClient.get('/files'),
  getContent: (path) => apiClient.get(`/files/content?path=${encodeURIComponent(path)}`),
  saveContent: (path, content) => apiClient.post('/files/content', { path, content }),
  create: (path, isDirectory = false, content = '') => apiClient.post('/files', { path, is_directory: isDirectory, content }),
  delete: (path) => apiClient.delete(`/files/${encodeURIComponent(path)}`),
  rename: (oldPath, newPath) => apiClient.post('/files/rename', { old_path: oldPath, new_path: newPath }),
  upload: (formData) => apiClient.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const terminalAPI = {
  createSession: () => apiClient.post('/terminal/session'),
  sendCommand: (sessionId, command) => apiClient.post('/terminal/command', { session_id: sessionId, command }),
  closeSession: (sessionId) => apiClient.delete('/terminal/session', { data: { session_id: sessionId } }),
};

export const datasetAPI = {
  list: () => apiClient.get('/datasets'),
  preview: (filename) => apiClient.get(`/datasets/preview/${encodeURIComponent(filename)}`),
  upload: (formData) => apiClient.post('/datasets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const hdfsAPI = {
  ls: (path = '/') => apiClient.get(`/hdfs/ls?path=${encodeURIComponent(path)}`),
  mkdir: (path) => apiClient.post('/hdfs/mkdir', { path }),
  upload: (formData) => apiClient.post('/hdfs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  cat: (path) => apiClient.get(`/hdfs/cat?path=${encodeURIComponent(path)}`),
  rm: (path) => apiClient.delete(`/hdfs/rm?path=${encodeURIComponent(path)}`),
};

export const sampleAPI = {
  list: () => apiClient.get('/samples'),
};

export default apiClient;

