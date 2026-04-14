import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  login: (sicil_no: string, sifre: string) => 
    api.post(`/auth/login?sicil_no=${sicil_no}&sifre=${sifre}`),
  register: (data: any) => api.post('/auth/register', data),
};

export const fileApi = {
  list: () => api.get('/files/'),
  get: (id: number) => api.get(`/files/${id}`),
  create: (data: any) => api.post('/files/', data),
};

export const taskApi = {
  listByFile: (fileId: number) => api.get(`/tasks/file/${fileId}`),
  create: (data: any) => api.post('/tasks/', data),
  updateStatus: (taskId: number, status: string) => 
    api.patch(`/tasks/${taskId}?durum=${status}`),
};

export const statsApi = {
  getSummary: () => api.get('/stats'),
};

export default api;
