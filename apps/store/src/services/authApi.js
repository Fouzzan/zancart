
import axios from "axios";

const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the saved JWT to authenticated requests.
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("zancart_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default authApi;
