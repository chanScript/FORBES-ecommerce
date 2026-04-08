import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../api/cars';
import { documentsAPI } from '../api/documents';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatPrice } from '../utils/helpers';
import {
  ArrowLeft, ClipboardList, User, Mail, Phone, MapPin,
  Check, X, ArrowRight, AlertTriangle, FileText, Download,
  Image as ImageIcon, ChevronLeft, ChevronRight, Calendar, Tag, Package
} from 'lucide-react';

const STATUS_STYLES = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

const DOC_STATUS_STYLES = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

const SUBTYPE_LABELS = {
  Car: 'Car', Motorcycle: 'Motorcycle', Truck: 'Truck',
  HouseAndLot: 'House & Lot', VacantLot: 'Vacant Lot', CommercialProperty: 'Commercial Property',
};

export default function AdminSubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentImg, setCurrentImg] = useState(0);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [convertError, setConvertError] = useState(null);

  const { data: submission, isLoading } = useQuery({
    queryKey: ['adminSubmission', id],
    queryFn: () => adminAPI.getSubmission(id).then(r => r.data),
    enabled: !!id,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['submissionDocuments', id],
    queryFn: () => documentsAPI.listBySubmission(id).then(r => r.data),
    enabled: !!id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['adminSubmission', id] });
    queryClient.invalidateQueries({ queryKey: ['adminSubmissions'] });
    queryClient.invalidateQueries({ queryKey: ['submissionDocuments', id] });
  };

  const approveMutation = useMutation({
    mutationFn: () => adminAPI.approveSubmission(parseInt(id)),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: (reason) => adminAPI.rejectSubmission(parseInt(id), reason),
    onSuccess: () => { setRejectOpen(false); setRejectReason(''); invalidate(); },
  });

  const convertMutation = useMutation({
    mutationFn: () => adminAPI.convertSubmission(parseInt(id)),
    onSuccess: () => { setConvertError(null); invalidate(); },
    onError: (err) => setConvertError(err?.response?.data?.error || 'Failed to convert.'),
  });

  const docStatusMutation = useMutation({
    mutationFn: ({ docId, status, reviewNote }) => documentsAPI.updateStatus(docId, status, reviewNote),
    onSuccess: invalidate,
  });

  if (isLoading) return <LoadingSpinner className="h-96" />;

  if (!submission) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <Package className="mx-auto h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Submission Not Found</h2>
        <Link to="/admin/submissions" className="btn-primary mt-6 inline-block">Back to Submissions</Link>
      </div>
    );
  }

  const images = submission.images || [];
  const isPending = submission.status === 'Pending';
  const isApproved = submission.status === 'Approved';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-secondary-muted">
        <button onClick={() => navigate('/admin/submissions')} className="flex items-center gap-1 hover:text-primary-accent transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Submissions
        </button>
        <span>/</span>
        <span className="text-gray-900">Submission #{submission.id}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ClipboardList className="h-6 w-6 text-primary-accent" /> Submission #{submission.id}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-secondary-muted">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[submission.status]}`}>
              {submission.status}
            </span>
            <span>{new Date(submission.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {isPending && (
            <>
              <button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-status-success px-4 py-2 text-sm font-medium text-white transition hover:bg-status-success/90 disabled:opacity-50"
              >
                <Check className="h-4 w-4" /> Approve
              </button>
              <button
                onClick={() => setRejectOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-status-error px-4 py-2 text-sm font-medium text-white transition hover:bg-status-error/90"
              >
                <X className="h-4 w-4" /> Reject
              </button>
            </>
          )}
          {isApproved && !submission.convertedListing && (
            <button
              onClick={() => {
                if (window.confirm('Convert this submission into a live listing?')) {
                  setConvertError(null);
                  convertMutation.mutate();
                }
              }}
              disabled={convertMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-primary-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-accent/90 disabled:opacity-50"
            >
              <ArrowRight className="h-4 w-4" /> Convert to Listing
            </button>
          )}
          {submission.convertedListing && (
            <Link
              to={`/listings/${submission.convertedListing.slug}`}
              className="flex items-center gap-1.5 rounded-lg bg-primary-blue px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-blue/90"
            >
              View Listing
            </Link>
          )}
        </div>
      </div>

      {convertError && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-status-error/30 bg-status-error/10 px-4 py-3 text-sm text-status-error">
          <span>{convertError}</span>
          <button onClick={() => setConvertError(null)} className="ml-4 font-medium underline">Dismiss</button>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Left Column: Images + Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          {images.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Photos ({images.length})</h3>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={images[currentImg]?.url}
                  alt={`Submission photo ${currentImg + 1}`}
                  className="h-full w-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImg((prev) => (prev - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImg((prev) => (prev + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                      {currentImg + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImg(idx)}
                      className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                        idx === currentImg ? 'border-primary-accent' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Property / Vehicle Details */}
          <div className="rounded-xl border p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Property Details</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-secondary-muted">Category</span>
                <p className="font-medium text-gray-900">
                  {submission.category === 'Vehicle' ? 'Vehicle' : 'Real Estate'}
                </p>
              </div>
              {(submission.vehicleSubtype || submission.realEstateSubtype) && (
                <div>
                  <span className="text-secondary-muted">Subtype</span>
                  <p className="font-medium text-gray-900">
                    {SUBTYPE_LABELS[submission.vehicleSubtype || submission.realEstateSubtype]}
                  </p>
                </div>
              )}
              {submission.price && (
                <div>
                  <span className="text-secondary-muted">Asking Price</span>
                  <p className="font-medium text-primary-accent">{formatPrice(submission.price)}</p>
                </div>
              )}
            </div>

            <div className="mt-4 border-t pt-4">
              <span className="text-sm text-secondary-muted">Description / Details</span>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{submission.propertyDetails}</p>
            </div>

            {submission.adminNote && (
              <div className="mt-4 rounded-lg bg-surface-card p-3">
                <span className="text-sm font-medium text-gray-700">Admin Note</span>
                <p className="mt-1 text-sm text-gray-600">{submission.adminNote}</p>
              </div>
            )}
          </div>

          {/* Documents */}
          {documents.length > 0 && (
            <div className="rounded-xl border p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Documents ({documents.length})
              </h3>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {doc.fileType?.includes('pdf') ? (
                        <FileText className="h-8 w-8 text-red-500 flex-shrink-0" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-blue-500 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                        <p className="text-xs text-secondary-muted">
                          {(doc.fileSize / 1024).toFixed(0)} KB ·{' '}
                          <span className={`font-medium ${DOC_STATUS_STYLES[doc.status]?.split(' ')[1] || ''}`}>
                            {doc.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded p-1.5 text-gray-500 hover:bg-surface-card"
                        title="View / Download"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      {doc.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => docStatusMutation.mutate({ docId: doc.id, status: 'Approved' })}
                            className="rounded p-1.5 text-status-success hover:bg-status-success/10"
                            title="Approve Document"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => docStatusMutation.mutate({ docId: doc.id, status: 'Rejected' })}
                            className="rounded p-1.5 text-status-error hover:bg-status-error/10"
                            title="Reject Document"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Contact Info */}
        <div className="space-y-6">
          <div className="rounded-xl border p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-header text-primary-on-dark font-bold">
                  {submission.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{submission.fullName}</p>
                  <p className="text-xs text-secondary-muted">Submitter</p>
                </div>
              </div>
              <a href={`mailto:${submission.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-accent transition-colors">
                <Mail className="h-4 w-4 text-secondary-muted" /> {submission.email}
              </a>
              <a href={`tel:${submission.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-accent transition-colors">
                <Phone className="h-4 w-4 text-secondary-muted" /> {submission.phone}
              </a>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Timeline</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-secondary-muted flex-shrink-0" />
                <div>
                  <p className="text-gray-700">Submitted</p>
                  <p className="text-xs text-secondary-muted">{new Date(submission.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {submission.reviewedAt && (
                <div className="flex items-start gap-2">
                  <Tag className="mt-0.5 h-4 w-4 text-secondary-muted flex-shrink-0" />
                  <div>
                    <p className="text-gray-700">{submission.status} by {submission.reviewer?.name || 'Admin'}</p>
                    <p className="text-xs text-secondary-muted">{new Date(submission.reviewedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
              {submission.convertedListing && (
                <div className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 text-primary-accent flex-shrink-0" />
                  <div>
                    <p className="text-gray-700">Converted to Listing</p>
                    <Link to={`/listings/${submission.convertedListing.slug}`} className="text-xs text-primary-accent hover:underline">
                      {submission.convertedListing.title}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-surface-light p-6 shadow-xl">
            <div className="flex items-center gap-2 text-status-error">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-semibold">Reject Submission</h3>
            </div>
            <textarea
              rows={3}
              placeholder="Rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-4 w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={() => { setRejectOpen(false); setRejectReason(''); }} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => rejectMutation.mutate(rejectReason)}
                disabled={rejectMutation.isPending}
                className="rounded-lg bg-status-error px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
