import axios from 'axios';
import { getItem, deleteItem } from './secureStore';

const BASE_URL = 'https://cyclesyncz.up.railway.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: attach token ──────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response: log real error details, handle 401 ──────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Always log the real cause so you never see {} again
    console.log('API Error:', {
      url:     error.config?.url,
      method:  error.config?.method?.toUpperCase(),
      status:  error.response?.status,
      data:    error.response?.data,
      message: error.message,           // "Network Error", "timeout", etc.
      code:    error.code,              // "ECONNABORTED", "ERR_NETWORK", etc.
    });

    if (error.response?.status === 401) {
      await deleteItem('auth_token');   // version-safe delete (no crash)
    }

    return Promise.reject(error);
  },
);

// ── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: any)  => api.post('/auth/register', data),
  login:    (data: any)  => api.post('/auth/login', data),
  me:       ()           => api.get('/auth/me'),
  setPin:   (pin: string) => api.post('/auth/set-pin', { pin }),
  verifyPin:(pin: string) => api.post('/auth/verify-pin', { pin }),
};

// ── Cycles ─────────────────────────────────────────────────────────────────
export const cyclesAPI = {
  getAll:              ()                            => api.get('/cycles'),
  startPeriod:         (data: any)                  => api.post('/cycles/start', data),
  endPeriod:           (id: string, endDate: string) => api.put(`/cycles/${id}/end`, { endDate }),
  update:              (id: string, data: any)       => api.put(`/cycles/${id}`, data),
  delete:              (id: string)                  => api.delete(`/cycles/${id}`),
  logIntercourse:      (id: string, data: any)       => api.post(`/cycles/${id}/intercourse`, data),
  logBBT:              (id: string, data: any)       => api.post(`/cycles/${id}/bbt`, data),
  getCalendarMarkers:  (startDate?: string, endDate?: string) =>
    api.get('/cycles/calendar-markers', { params: { startDate, endDate } }),
  getPredictions:      ()                            => api.get('/cycles/predictions'),
};

// ── Symptoms ───────────────────────────────────────────────────────────────
export const symptomsAPI = {
  getAll:    (params?: any)              => api.get('/symptoms', { params }),
  getToday:  ()                          => api.get('/symptoms/today'),
  log:       (data: any)                 => api.post('/symptoms', data),
  update:    (id: string, data: any)     => api.put(`/symptoms/${id}`, data),
  getTrends: (months?: number)           => api.get('/symptoms/trends', { params: { months } }),
};

// ── Health ─────────────────────────────────────────────────────────────────
export const healthAPI = {
  getAll:   (params?: any)          => api.get('/health', { params }),
  getToday: ()                      => api.get('/health/today'),
  log:      (data: any)             => api.post('/health', data),
  update:   (id: string, data: any) => api.put(`/health/${id}`, data),
  getStats: (days?: number)         => api.get('/health/stats', { params: { days } }),
};

// ── AI ─────────────────────────────────────────────────────────────────────
export const aiAPI = {
  chat:           (message: string, history?: any[]) =>
    api.post('/ai/chat', { message, conversationHistory: history }),
  getInsights:    ()                                  => api.get('/ai/insights'),
  explainSymptom: (symptom: string, cycleDay?: number) =>
    api.post('/ai/explain-symptom', { symptom, cycleDay }),
};

// ── Profile ────────────────────────────────────────────────────────────────
export const profileAPI = {
  get:        ()           => api.get('/profile'),
  update:     (data: any)  => api.put('/profile', data),
  export:     ()           => api.get('/profile/export'),
  deleteData: ()           => api.delete('/profile/data'),
};

// ── Analytics ──────────────────────────────────────────────────────────────
export const analyticsAPI = {
  overview:      ()                           => api.get('/analytics/overview'),
  monthlyReport: (year: number, month: number) => api.get(`/analytics/report/${year}/${month}`),
};

// ── Reminders ──────────────────────────────────────────────────────────────
export const remindersAPI = {
  getAll:  ()                          => api.get('/reminders'),
  create:  (data: any)                 => api.post('/reminders', data),
  update:  (id: string, data: any)     => api.put(`/reminders/${id}`, data),
  delete:  (id: string)                => api.delete(`/reminders/${id}`),
};

// ── Pregnancy ──────────────────────────────────────────────────────────────
export const pregnancyAPI = {
  getStatus: ()           => api.get('/pregnancy/status'),
  enable:    (data: any)  => api.post('/pregnancy/enable', data),
  disable:   ()           => api.post('/pregnancy/disable'),
};

// ── Partner ────────────────────────────────────────────────────────────────
export const partnerAPI = {
  connect:    (partnerCode: string) => api.post('/partner/connect', { partnerCode }),
  disconnect: ()                    => api.post('/partner/disconnect'),
  getData:    ()                    => api.get('/partner/data'),
};

export default api;