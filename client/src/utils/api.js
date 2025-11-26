import axios from 'axios';
import { API_BASE_URL, AUTH_STORAGE_KEY } from '../config'; 

const api = axios.create({
  baseURL: API_BASE_URL, 
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      const auth = JSON.parse(storedAuth);
      if (auth.token) {
        config.headers['Authorization'] = `Bearer ${auth.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response; 
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const storedAuth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '{}');
        const refreshToken = storedAuth.refreshToken;

        if (!refreshToken) {
          throw new Error('Refresh token bulunamadı');
        }

        const rs = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken: refreshToken }
        );
        
        const { token: newToken, user, refreshToken: newRefreshToken } = rs.data; 

        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            token: newToken,
            user: user,
            refreshToken: newRefreshToken || refreshToken 
          })
        );
        
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        console.error('Refresh token başarısız, tam logout gerekiyor', refreshError);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        window.location.href = '/welcome';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
