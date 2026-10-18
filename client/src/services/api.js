import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor to attach JWT token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vaultra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Terjadi kesalahan pada server';
    return Promise.reject(new Error(message));
  }
);

// Items API
export async function getItems() {
  return apiClient.get('/items');
}

export async function createItem(data) {
  return apiClient.post('/items', data);
}

export async function updateItem(id, data) {
  return apiClient.put(`/items/${id}`, data);
}

export async function deleteItem(id) {
  return apiClient.delete(`/items/${id}`);
}

// Auth API
export async function login({ username, password }) {
  const data = await apiClient.post('/auth/login', { username, password });
  if (data.token) {
    localStorage.setItem('vaultra_token', data.token);
    localStorage.setItem('vaultra_user', JSON.stringify(data.user));
  }
  return data;
}

export async function replaceInitialAdmin({ newUsername, newName, newPassword }) {
  const data = await apiClient.post('/auth/replace-initial-admin', {
    newUsername,
    newName,
    newPassword,
  });
  if (data.token) {
    localStorage.setItem('vaultra_token', data.token);
    localStorage.setItem('vaultra_user', JSON.stringify(data.user));
  }
  return data;
}

export async function getMe() {
  return apiClient.get('/auth/me');
}

export async function getUsers() {
  return apiClient.get('/auth/users');
}

export function logout() {
  localStorage.removeItem('vaultra_token');
  localStorage.removeItem('vaultra_user');
}

export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('vaultra_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export async function checkHealth() {
  return apiClient.get('/health');
}

export default apiClient;