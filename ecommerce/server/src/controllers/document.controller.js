const prisma = require('../config/db');
const { uploadDocLocal } = require('../middleware/upload.middleware');
const { createNotification } = require('../utils/notification.service');
const { createAuditLog } = require('../middleware/audit.middleware');

/**
 * POST /api/documents/listing/:listingId — Upload documents for a listing.
 */
async function uploadListingDocuments(req, res, next) {
  try {
    const { listingId } = req.params;

    const listing = await prisma.listing.findFirst({
      where: { id: listingId, sellerId: req.user.id },
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one document is required.' });
    }

    const documents = [];
    for (const file of req.files) {
      try {
        const { publicId, url } = uploadDocLocal(file.buffer, file.originalname, file.mimetype);
        const doc = await prisma.document.create({
          data: {
            listingId,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            url,
            publicId,
          },
        });
        documents.push(doc);
      } catch (fileErr) {
        console.error(`[Documents] Failed to upload file ${file.originalname}:`, fileErr.message);
        // Continue with other files if one fails
      }
    }

    if (documents.length === 0) {
      return res.status(400).json({ error: 'Failed to upload any documents.' });
    }

    // Notify admins
    const io = req.app.get('io');
    await createNotification({
      type: 'DOCUMENT_UPLOAD',
      title: 'Documents Uploaded',
      message: `${req.user.name} uploaded ${documents.length} document(s) for listing "${listing.title}".`,
      metadata: { listingId, documentCount: documents.length },
      io,
    });

    res.status(201).json({ message: `${documents.length} document(s) uploaded.`, documents });
  } catch (err) {
    console.error('[Documents] Listing upload error:', err);
    next(err);
  }
}

/**
 * POST /api/documents/submission/:submissionId — Upload documents for a seller submission (public).
 */
async function uploadSubmissionDocuments(req, res, next) {
  try {
    const submissionId = parseInt(req.params.submissionId, 10);

    if (!submissionId || isNaN(submissionId)) {
      return res.status(400).json({ error: 'Invalid submission ID.' });
    }

    const submission = await prisma.sellerSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one document is required.' });
    }

    const documents = [];
    for (const file of req.files) {
      try {
        const { publicId, url } = uploadDocLocal(file.buffer, file.originalname, file.mimetype);
        const doc = await prisma.document.create({
          data: {
            submissionId,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            url,
            publicId,
          },
        });
        documents.push(doc);
      } catch (fileErr) {
        console.error(`[Documents] Failed to upload file ${file.originalname}:`, fileErr.message);
        // Continue with other files if one fails
      }
    }

    if (documents.length === 0) {
      return res.status(400).json({ error: 'Failed to upload any documents.' });
    }

    res.status(201).json({ message: `${documents.length} document(s) uploaded.`, documents });
  } catch (err) {
    console.error('[Documents] Submission upload error:', err);
    next(err);
  }
}

/**
 * GET /api/documents/listing/:listingId — Admin: list documents for a listing.
 */
async function listListingDocuments(req, res, next) {
  try {
    const { listingId } = req.params;
    const documents = await prisma.document.findMany({
      where: { listingId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(documents);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/documents/submission/:submissionId — Admin: list documents for a submission.
 */
async function listSubmissionDocuments(req, res, next) {
  try {
    const submissionId = parseInt(req.params.submissionId, 10);
    const documents = await prisma.document.findMany({
      where: { submissionId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(documents);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/documents/:id/status — Admin: approve or reject a document.
 */
async function updateDocumentStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, reviewNote } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Approved or Rejected.' });
    }

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        status,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        reviewNote: reviewNote || null,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: `DOCUMENT_${status.toUpperCase()}`,
      module: 'documents',
      recordId: String(id),
      ipAddress: req.ip,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadListingDocuments,
  uploadSubmissionDocuments,
  listListingDocuments,
  listSubmissionDocuments,
  updateDocumentStatus,
};
