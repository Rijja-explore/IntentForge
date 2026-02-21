/* ─── Base Axios Instance ─────────────────────────────────────────── */

import axios from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

/* ─── Response interceptor — normalize envelope ─────────────────── */
api.interceptors.response.use(
  (response) => {
    // Backend returns { success, message, data } — unwrap to data
    const { data } = response;
    if (data && typeof data === 'object' && 'success' in data) {
      return data.data ?? data;
    }
    return data;
  },
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Request failed';
    return Promise.reject(new Error(message));
  }
);

export default api;
