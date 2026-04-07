import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../api/cars';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import { formatPrice } from '../utils/helpers';
import {
  ClipboardList, Eye, Check, X, RotateCcw, AlertTriangle,
  Mail, Phone, User, ArrowRight, Package
} from 'lucide-react';

const STATUS_STYLES = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

const CATEGORY_LABELS = {
  Vehicle: 'Vehicle',
  RealEstate: 'Real Estate',
};

const SUBTYPE_LABELS = {
  Car: 'Car', Motorcycle: 'Motorcycle', Truck: 'Truck',
  HouseAndLot: 'House & Lot', VacantLot: 'Vacant Lot', CommercialProperty: 'Commercial Property',
};

export default function AdminSubmissionsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [viewId, setViewId] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [convertError, setConvertError] = useState(null);

  // List
  const { data, isLoading } = useQuery({
    queryKey: ['adminSubmissions', page, statusFilter],
    queryFn: () => adminAPI.listSubmissions({ page, limit: 15, status: statusFilter || undefined }).then(r => r.data),
  });

  // Detail
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['adminSubmission', viewId],
    queryFn: () => adminAPI.getSubmission(viewId).then(r => r.data),
    enabled: !!viewId,
  });

  // Mutations
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['adminSubmissions'] });
    queryClient.invalidateQueries({ queryKey: ['adminSubmission'] });
  };

  const approveMutation = useMutation({
    mutationFn: (id) => adminAPI.approveSubmission(id),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminAPI.rejectSubmission(id, reason),
    onSuccess: () => { setRejectId(null); setRejectReason(''); invalidate(); },
  });

  const convertMutation = useMutation({
    mutationFn: (id) => adminAPI.convertSubmission(id),
    onSuccess: () => { setViewId(null); setConvertError(null); invalidate(); },
    onError: (err) => {
      const msg = err?.response?.data?.error || 'Failed to convert submission.';
      setConvertError(msg);
    },
  });

  const handleConvert = (id) => {
    if (!window.confirm('Convert this submission into a live listing?')) return;
    setConvertError(null);
    convertMutation.mutate(id);
  };

  const submissions = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ClipboardList className="h-6 w-6 text-primary-accent" /> Seller Submissions
          </h1>
          <p className="mt-1 text-sm text-secondary-muted">Review and convert anonymous seller submissions into listings</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {convertError && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-status-error/30 bg-status-error/10 px-4 py-3 text-sm text-status-error">
          <span>{convertError}</span>
          <button onClick={() => setConvertError(null)} className="ml-4 font-medium underline">Dismiss</button>
        </div>
      )}

      {/* Submissions Table */}
      {isLoading ? (
        <LoadingSpinner className="h-64" />
      ) : submissions.length === 0 ? (
        <div className="mt-12 text-center">
          <Package className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-secondary-muted">No submissions found.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-surface-card">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Submitter</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-surface-light">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-surface-card/50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{sub.fullName}</p>
                      <p className="text-xs text-secondary-muted">{sub.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {CATEGORY_LABELS[sub.category] || sub.category}
                      {(sub.vehicleSubtype || sub.realEstateSubtype) && (
                        <span className="text-xs text-secondary-muted block">
                          {SUBTYPE_LABELS[sub.vehicleSubtype || sub.realEstateSubtype]}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{sub.price ? formatPrice(sub.price) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[sub.status] || ''}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-secondary-muted">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewId(sub.id)}
                          className="rounded p-1.5 text-gray-500 hover:bg-surface-card"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {sub.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => approveMutation.mutate(sub.id)}
                              className="rounded p-1.5 text-status-success hover:bg-status-success/10"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setRejectId(sub.id)}
                              className="rounded p-1.5 text-status-error hover:bg-status-error/10"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {sub.status === 'Approved' && !sub.convertedListing && (
                          <button
                            onClick={() => handleConvert(sub.id)}
                            disabled={convertMutation.isPending}
                            className="rounded p-1.5 text-primary-accent hover:bg-primary-accent/10 disabled:opacity-50"
                            title="Convert to Listing"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      {/* Reject Modal */}
      {rejectId && (
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
              <button onClick={() => { setRejectId(null); setRejectReason(''); }} className="btn-outline text-sm">Cancel</button>
              <button
                onClick={() => rejectMutation.mutate({ id: rejectId, reason: rejectReason })}
                className="rounded-lg bg-status-error px-4 py-2 text-sm font-medium text-white"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {viewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-surface-light p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Submission Details</h3>
              <button onClick={() => setViewId(null)} className="rounded p-1 hover:bg-surface-card">
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailLoading ? (
              <LoadingSpinner className="h-32" />
            ) : detail ? (
              <div className="mt-4 space-y-4">
                {/* Contact */}
                <div className="rounded-lg bg-surface-card p-4">
                  <h4 className="text-sm font-semibold text-gray-700">Contact Info</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /> {detail.fullName}</p>
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /> {detail.email}</p>
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /> {detail.phone}</p>
                  </div>
                </div>

                {/* Property Info */}
                <div className="rounded-lg bg-surface-card p-4">
                  <h4 className="text-sm font-semibold text-gray-700">Property Info</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>Category:</strong> {CATEGORY_LABELS[detail.category]}</p>
                    {detail.vehicleSubtype && <p><strong>Type:</strong> {SUBTYPE_LABELS[detail.vehicleSubtype]}</p>}
                    {detail.realEstateSubtype && <p><strong>Type:</strong> {SUBTYPE_LABELS[detail.realEstateSubtype]}</p>}
                    {detail.price && <p><strong>Asking Price:</strong> {formatPrice(detail.price)}</p>}
                  </div>
                </div>

                {/* Details */}
                <div className="rounded-lg bg-surface-card p-4">
                  <h4 className="text-sm font-semibold text-gray-700">Details</h4>
                  <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{detail.propertyDetails}</p>
                </div>

                {/* Images */}
                {detail.images?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700">Photos</h4>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {detail.images.map((img) => (
                        <img key={img.id} src={img.url} alt="" className="rounded-lg object-cover aspect-video" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {detail.status === 'Pending' && (
                  <div className="flex gap-2 border-t pt-4">
                    <button
                      onClick={() => { approveMutation.mutate(detail.id); setViewId(null); }}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" /> Approve
                    </button>
                    <button
                      onClick={() => { setViewId(null); setRejectId(detail.id); }}
                      className="rounded-lg border border-status-error px-4 py-2 text-sm font-medium text-status-error hover:bg-status-error/5"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {detail.convertedListing ? (
                  <div className="border-t pt-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-status-success">
                      <Check className="h-4 w-4" /> Converted to listing: <strong>{detail.convertedListing.title}</strong>
                    </p>
                  </div>
                ) : detail.status === 'Approved' && (
                  <div className="border-t pt-4">
                    <button
                      onClick={() => handleConvert(detail.id)}
                      disabled={convertMutation.isPending}
                      className="btn-primary flex items-center gap-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                      {convertMutation.isPending ? 'Converting...' : 'Convert to Listing'}
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
