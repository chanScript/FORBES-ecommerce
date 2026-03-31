import api from './axios';

export const carsAPI = {
  list: (params) => api.get('/cars', { params }),
  getBySlug: (slug) => api.get(`/cars/${slug}`),
  create: (data) => api.post('/cars', data),
  update: (id, data) => api.put(`/cars/${id}`, data),
  delete: (id) => api.delete(`/cars/${id}`),
  myListings: (params) => api.get('/cars/my-listings', { params }),
  uploadImages: (id, formData) =>
    api.post(`/cars/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (imageId) => api.delete(`/cars/images/${imageId}`),
};

export const brandsAPI = {
  list: () => api.get('/brands'),
  getModels: (slug) => api.get(`/brands/${slug}/models`),
  create: (name) => api.post('/brands', { name }),
  delete: (id) => api.delete(`/brands/${id}`),
};

export const modelsAPI = {
  list: (brandId) => api.get('/models', { params: brandId ? { brandId } : {} }),
  create: (name, brandId) => api.post('/models', { name, brandId }),
  delete: (id) => api.delete(`/models/${id}`),
};

export const vehicleTypesAPI = {
  list: () => api.get('/vehicle-types'),
  create: (name) => api.post('/vehicle-types', { name }),
  delete: (id) => api.delete(`/vehicle-types/${id}`),
};

export const filtersAPI = {
  getOptions: () => api.get('/filters/options'),
};

export const favoritesAPI = {
  list: () => api.get('/favorites'),
  add: (carId) => api.post(`/favorites/${carId}`),
  remove: (carId) => api.delete(`/favorites/${carId}`),
};

export const adminAPI = {
  listAll: (params) => api.get('/admin/cars', { params }),
  listPending: (params) => api.get('/admin/cars/pending', { params }),
  listTrash: (params) => api.get('/admin/cars/trash', { params }),
  approve: (id) => api.patch(`/admin/cars/${id}/approve`),
  reject: (id, reason) => api.patch(`/admin/cars/${id}/reject`, { reason }),
  softDelete: (id) => api.delete(`/admin/cars/${id}`),
  restore: (id) => api.patch(`/admin/cars/${id}/restore`),
  forceDelete: (id) => api.delete(`/admin/cars/${id}/force`),
};
