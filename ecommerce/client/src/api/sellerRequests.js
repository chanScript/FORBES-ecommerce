import api from './axios';

export const sellerRequestsAPI = {
  submit: (data) => api.post('/seller-requests', data),
  getMy: () => api.get('/seller-requests/my'),
  adminList: (params) => api.get('/seller-requests/admin', { params }),
  adminApprove: (id) => api.patch(`/seller-requests/${id}/approve`),
  adminReject: (id, adminNote) => api.patch(`/seller-requests/${id}/reject`, { adminNote }),
};
