import axios from "axios";

const AUTH_API_URL = (import.meta.env.VITE_AUTH_API_URL || "")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const authApi = axios.create({
  baseURL: AUTH_API_URL,
});

authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default authApi;
