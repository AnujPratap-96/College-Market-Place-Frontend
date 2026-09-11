import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("signupToken") ||
    localStorage.getItem("resetToken");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === "object" &&
      response.data.data &&
      typeof response.data.data === "object" &&
      !Array.isArray(response.data.data)
    ) {
      Object.assign(response.data, response.data.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.data && typeof error.response.data === "object") {
      const msg =
        error.response.data.message ||
        error.response.data.error ||
        error.message ||
        "Something went wrong";
      error.response.data.message = msg;
      error.response.data.error = msg;
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
