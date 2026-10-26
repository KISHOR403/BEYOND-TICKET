import axios from "axios";

export const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("beyond_access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh and gracefully retry public endpoints
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("beyond_refresh_token");

      if (refreshToken && status === 401) {
        try {
          const res = await axios.post("/api/v1/auth/token/refresh/", {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem("beyond_access_token", newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem("beyond_access_token");
          localStorage.removeItem("beyond_refresh_token");
          localStorage.removeItem("beyond_user");
        }
      } else {
        // Clear stale invalid token
        localStorage.removeItem("beyond_access_token");
        localStorage.removeItem("beyond_refresh_token");
        localStorage.removeItem("beyond_user");
        if (originalRequest.headers) {
          delete originalRequest.headers.Authorization;
        }
        // If it's a GET request, retry without authentication
        if (originalRequest.method?.toLowerCase() === "get") {
          return api(originalRequest);
        }
      }
    }
    return Promise.reject(error);
  }
);
