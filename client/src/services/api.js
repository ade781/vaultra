import axios from 'axios';

// Determine API base URL:
// In browser on Vercel or any non-localhost host, ALWAYS use relative '/api'
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';
    if (!isLocalhost) {
      return '/api';
    }
  }
  return import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');
};

const API_BASE_URL = getApiBaseUrl();

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

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vaultra:unauthorized'));
      }
    }

    const enhancedError = new Error(message);
    enhancedError.normalizedMessage = message;
    enhancedError.status = error.response?.status;
    enhancedError.response = error.response;
    return Promise.reject(enhancedError);
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

// Backup & Restore API
export async function exportBackup() {
  let backupData;
  try {
    const res = await apiClient.get('/backup/export');
    backupData = res;
  } catch {
    const items = await getItems();
    const itemList = Array.isArray(items) ? items : [];
    backupData = {
      vaultraVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      itemCount: itemList.length,
      items: itemList,
    };
  }

  const itemList = Array.isArray(backupData) ? backupData : (backupData?.items || []);
  const normalizedBackup = {
    vaultraVersion: backupData?.vaultraVersion || '1.0.0',
    exportedAt: backupData?.exportedAt || new Date().toISOString(),
    totalItems: backupData?.itemCount !== undefined ? backupData.itemCount : itemList.length,
    items: itemList,
  };

  if (typeof document !== 'undefined') {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(normalizedBackup, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('download', `vaultra-backup-${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  return normalizedBackup;
}

export async function restoreBackup(jsonData) {
  try {
    return await apiClient.post('/backup/restore', jsonData);
  } catch {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    const itemsToRestore = Array.isArray(data) ? data : data?.items;
    if (!Array.isArray(itemsToRestore)) {
      throw new Error('Format berkas cadangan tidak valid: item tidak ditemukan');
    }

    const results = [];
    for (const item of itemsToRestore) {
      const { id, createdAt, updatedAt, ...payload } = item;
      const created = await createItem(payload);
      results.push(created);
    }
    return results;
  }
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