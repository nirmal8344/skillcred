// API Client for SkillCred by Adz4needz
// In development, Vite proxy handles /api -> localhost:8080
// In production, set VITE_API_BASE_URL to the Render backend URL (e.g. https://skillcred-api.onrender.com/api)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('skillcred_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

// Convenience methods
export const api = {
  get: (endpoint) => apiClient(endpoint, { method: 'GET' }),
  post: (endpoint, body) => apiClient(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => apiClient(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => apiClient(endpoint, { method: 'DELETE' }),
};
