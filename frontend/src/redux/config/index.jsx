import axios from "axios";

export const BASE_URL = "http://127.0.0.1:9000";

export const clientServer = axios.create({
  baseURL: BASE_URL,
});

// Add request interceptor to attach token to all requests
clientServer.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
clientServer.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalid or expired - clear auth state
      localStorage.removeItem("token");
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
