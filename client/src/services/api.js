import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Terjadi kesalahan pada server';
    return Promise.reject(new Error(message));
  }
);

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

export async function checkHealth() {
  return apiClient.get('/health');
}

export default apiClient;
