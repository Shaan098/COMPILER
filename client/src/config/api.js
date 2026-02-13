// API Configuration
// Centralize an axios instance so we can automatically handle
// network errors such as when the backend port shifts.

import axios from 'axios';

// Default base URL (can be overridden via VITE_API_URL)
const DEFAULT_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// If the default uses localhost:5000, prepare a fallback port.
const ALTERNATE_URL = DEFAULT_URL.replace('5000', '5001');

// Create axios instance with default baseURL
const api = axios.create({ baseURL: DEFAULT_URL });

// Intercept failed network requests and retry once using the alternate URL.
api.interceptors.response.use(
  response => response,
  async (error) => {
    // Only attempt retry on network errors where no response was received.
    if (
      (!error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')))
      && api.defaults.baseURL === DEFAULT_URL
      && ALTERNATE_URL !== DEFAULT_URL
    ) {
      console.warn(`Switching API base URL from ${DEFAULT_URL} to ${ALTERNATE_URL}`);
      api.defaults.baseURL = ALTERNATE_URL;
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);

export default api;

