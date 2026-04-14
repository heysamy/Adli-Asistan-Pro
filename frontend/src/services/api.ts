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
    api.post('/auth/login', { sicil_no, sifre }),
  register: (data: any) => api.post('/auth/register', data),
  updateProfile: (sicil_no: string, data: any) => api.put(`/auth/profile/${sicil_no}`, data),
  getBirimler: () => api.get('/auth/birimler'),
  createBirim: (ad: string) => api.post('/auth/birimler', { ad }),
  getBildirimler: (userId: number) => api.get(`/auth/bildirimler/${userId}`),
  getKalemPersonel: (birimId: number) => api.get(`/auth/kalem/${birimId}`),
  deletePersonel: (sicilNo: string) => api.delete(`/auth/personel/${sicilNo}`),
  updatePersonel: (sicilNo: string, data: any) => api.put(`/auth/profile/${sicilNo}`, data),
};

export const fileApi = {
  list: (birimId?: number) => api.get(`/files/`, { params: { birim_id: birimId } }),
  get: (id: number) => api.get(`/files/${id}`),
  create: (data: any) => api.post('/files/', data),
  update: (id: number, data: any) => api.put(`/files/${id}`, data),
  deleteDirect: (id: number) => api.delete(`/files/${id}`),
  requestDelete: (data: { dosya_id: number, talep_eden_id: number, neden: string }) => api.post('/files/delete-request', data),
  getDeleteRequests: (birimId: number) => api.get(`/files/delete-requests/${birimId}`),
  approveDelete: (talepId: number, onaylayanId: number) => api.post(`/files/approve-delete/${talepId}?onaylayan_id=${onaylayanId}`),
  rejectDelete: (talepId: number) => api.post(`/files/reject-delete/${talepId}`),
};

export const taskApi = {
  listPersonal: (userId: number) => api.get(`/tasks/user/${userId}`),
  listUnit: (birimId: number) => api.get(`/tasks/unit/${birimId}`),
  create: (data: any) => api.post('/tasks/', data),
  updateStatus: (taskId: number, status: string) =>
    api.patch(`/tasks/${taskId}?durum=${status}`),
  editTask: (taskId: number, notlar: string, vade_tarihi: string) =>
    api.patch(`/tasks/${taskId}/edit?notlar=${encodeURIComponent(notlar)}&vade_tarihi=${vade_tarihi}`),
  delete: (taskId: number) => api.delete(`/tasks/${taskId}`),
  transfer: (gorevId: number, yeniAtananId: number, yapanId: number) =>
    api.post(`/tasks/transfer?gorev_id=${gorevId}&yeni_atanan_id=${yeniAtananId}&yapan_id=${yapanId}`),
};

export const templateApi = {
  list: () => api.get('/templates/'),
  create: (data: any) => api.post('/templates/', data),
  update: (id: number, data: any) => api.put(`/templates/${id}`, data),
  delete: (id: number) => api.delete(`/templates/${id}`),
};

export const statsApi = {
  getSummary: (birimId?: number) => api.get('/stats', { params: { birim_id: birimId } }),
};

export default api;
