const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { rbac } = require('../middleware/rbac.middleware');
const { uploadDocs } = require('../middleware/upload.middleware');
const {
  uploadListingDocuments,
  uploadSubmissionDocuments,
  listListingDocuments,
  listSubmissionDocuments,
  updateDocumentStatus,
} = require('../controllers/document.controller');

// Seller: upload documents for their listing
router.post(
  '/listing/:listingId',
  authenticate,
  rbac('Seller', 'Admin', 'Super Admin'),
  uploadDocs.array('documents', 5),
  uploadListingDocuments
);

// Public: upload documents for a seller submission (no login required)
router.post(
  '/submission/:submissionId',
  uploadDocs.array('documents', 5),
  uploadSubmissionDocuments
);

// Admin: list documents
router.get('/listing/:listingId', authenticate, rbac('Admin', 'Super Admin'), listListingDocuments);
router.get('/submission/:submissionId', authenticate, rbac('Admin', 'Super Admin'), listSubmissionDocuments);

// Admin: approve/reject a document
router.patch('/:id/status', authenticate, rbac('Admin', 'Super Admin'), updateDocumentStatus);

module.exports = router;
