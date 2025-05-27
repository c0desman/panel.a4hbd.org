import axios from "axios";
import { useRouter } from "next/navigation";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

const refreshAccessToken = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/refresh`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    throw error;
  }
};

apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await refreshAccessToken();
        if (refreshResponse.accessToken) {
          originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        const router = useRouter();
        router.push("/auth/login");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
