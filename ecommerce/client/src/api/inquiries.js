import api from './axios';

export const inquiriesAPI = {
  submit: (listingId, data) => api.post(`/inquiries/${listingId}`, data),
  adminList: (params) => api.get('/inquiries/admin', { params }),
  adminCount: () => api.get('/inquiries/admin/count'),
  adminUpdateStatus: (id, status) => api.patch(`/inquiries/admin/${id}/status`, { status }),
};
