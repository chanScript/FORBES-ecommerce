import api from './axios';

export const inquiriesAPI = {
  submit: (carId, message) => api.post(`/inquiries/${carId}`, { message }),
  check: (carId) => api.get(`/inquiries/check/${carId}`),
  myList: () => api.get('/inquiries/my'),
  adminList: (params) => api.get('/inquiries/admin', { params }),
  adminCount: () => api.get('/inquiries/admin/count'),
  adminUpdateStatus: (id, status) => api.patch(`/inquiries/admin/${id}/status`, { status }),
};
