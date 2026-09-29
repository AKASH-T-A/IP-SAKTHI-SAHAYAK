/**
 * IP-SAKTI API Client
 * Typed axios wrapper with auth token injection, refresh, and error normalization.
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export interface ApiError {
  detail: string;
  type: string;
  status: number;
}

// Create the axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor — inject access token ─────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ipsakti_access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Response Interceptor — normalize errors, attempt token refresh ─────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('ipsakti_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${API_BASE}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const { access_token, refresh_token } = res.data;
        localStorage.setItem('ipsakti_access_token', access_token);
        localStorage.setItem('ipsakti_refresh_token', refresh_token);

        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch {
        // Refresh failed — clear tokens and redirect to login
        localStorage.removeItem('ipsakti_access_token');
        localStorage.removeItem('ipsakti_refresh_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session=expired';
        }
      }
    }

    // Normalize error for consumers
    let detail = (error.response?.data as any)?.detail;
    if (!detail) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        detail = 'Unable to connect to the server. Please verify the backend service is running.';
      } else {
        detail = 'An unexpected error occurred. Please try again.';
      }
    } else if (Array.isArray(detail)) {
      // Pydantic validation errors: [{ loc: [...], msg: "..." }]
      detail = detail
        .map((d: any) => (d.msg ? d.msg.replace(/^Value error,\s*/i, '') : String(d)))
        .join('. ');
    } else if (typeof detail === 'object') {
      detail = (detail as any).message || JSON.stringify(detail);
    }

    const apiError: ApiError = {
      detail: String(detail),
      type: (error.response?.data as any)?.type || (error.code === 'ERR_NETWORK' ? 'network_error' : 'error'),
      status: error.response?.status || (error.code === 'ERR_NETWORK' ? 503 : 500),
    };
    return Promise.reject(apiError);
  }
);

export default apiClient;
