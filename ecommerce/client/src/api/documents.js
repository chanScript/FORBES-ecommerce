import api from './axios';

export const documentsAPI = {
  // Seller: upload documents for a listing
  uploadForListing: (listingId, files) => {
    const formData = new FormData();
    files.forEach(f => formData.append('documents', f));
    return api.post(`/documents/listing/${listingId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Public: upload documents for a submission
  uploadForSubmission: (submissionId, files) => {
    const formData = new FormData();
    files.forEach(f => formData.append('documents', f));
    return api.post(`/documents/submission/${submissionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Admin: list documents for a listing
  listByListing: (listingId) => api.get(`/documents/listing/${listingId}`),

  // Admin: list documents for a submission
  listBySubmission: (submissionId) => api.get(`/documents/submission/${submissionId}`),

  // Admin: approve or reject a document
  updateStatus: (docId, status, reviewNote) =>
    api.patch(`/documents/${docId}/status`, { status, reviewNote }),
};
