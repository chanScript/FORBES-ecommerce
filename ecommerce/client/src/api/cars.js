import api from './axios';

export const listingsAPI = {
  list: (params) => api.get('/listings', { params }),
  getBySlug: (slug) => api.get(`/listings/${slug}`),
  getSimilar: (id) => api.get(`/listings/${id}/similar`),
  getSellerProfile: (sellerId, params) => api.get(`/listings/seller/${sellerId}`, { params }),
  create: (data) => api.post('/listings', data),
  update: (id, data) => api.put(`/listings/${id}`, data),
  delete: (id) => api.delete(`/listings/${id}`),
  myListings: (params) => api.get('/listings/my-listings', { params }),
  uploadImages: (id, formData) =>
    api.post(`/listings/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (imageId) => api.delete(`/listings/images/${imageId}`),
};

// Keep backward-compatible alias
export const carsAPI = listingsAPI;

export const filtersAPI = {
  getOptions: () => api.get('/filters/options'),
};

export const favoritesAPI = {
  list: () => api.get('/favorites'),
  add: (listingId) => api.post(`/favorites/${listingId}`),
  remove: (listingId) => api.delete(`/favorites/${listingId}`),
};

export const adminAPI = {
  listAll: (params) => api.get('/admin/listings', { params }),
  listPending: (params) => api.get('/admin/listings/pending', { params }),
  listTrash: (params) => api.get('/admin/listings/trash', { params }),
  approve: (id) => api.patch(`/admin/listings/${id}/approve`),
  reject: (id, reason) => api.patch(`/admin/listings/${id}/reject`, { reason }),
  softDelete: (id) => api.delete(`/admin/listings/${id}`),
  restore: (id) => api.patch(`/admin/listings/${id}/restore`),
  forceDelete: (id) => api.delete(`/admin/listings/${id}/force`),
  markAsSold: (id) => api.patch(`/admin/listings/${id}/sold`),
  // Submission management
  listSubmissions: (params) => api.get('/admin/submissions', { params }),
  getSubmission: (id) => api.get(`/admin/submissions/${id}`),
  approveSubmission: (id) => api.patch(`/admin/submissions/${id}/approve`),
  rejectSubmission: (id, reason) => api.patch(`/admin/submissions/${id}/reject`, { reason }),
  convertSubmission: (id, overrides) => api.post(`/admin/submissions/${id}/convert`, overrides),
  pendingSubmissionCount: () => api.get('/admin/submissions/count'),
  // Application management
  listApplications: (params) => api.get('/applications/admin', { params }),
  updateApplicationStatus: (id, status) => api.patch(`/applications/admin/${id}/status`, { status }),
  applicationCount: () => api.get('/applications/admin/count'),
};

export const submissionsAPI = {
  create: (formData) =>
    api.post('/submissions', formData),
};

export const applicationsAPI = {
  create: (data) => api.post('/applications', data),
};

export const inquiriesAPI = {
  create: (listingId, data) => api.post(`/inquiries/${listingId}`, data),
  listAdmin: (params) => api.get('/inquiries/admin', { params }),
  updateStatus: (id, status) => api.patch(`/inquiries/admin/${id}/status`, { status }),
  newCount: () => api.get('/inquiries/admin/count'),
  deleteInquiry: (id) => api.delete(`/inquiries/admin/${id}`),
};
