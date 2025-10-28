// src/lib/axios.ts
import axios from "axios";

// Create a reusable axios instance
const API = axios.create({
  baseURL: "https://jendie-inventory-backend-production.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000, // 15 seconds timeout for safety
});

// ✅ Automatically attach token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Optional: centralized response error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("❌ API Error:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    } else {
      console.error("🚫 Network/Server error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default API;
