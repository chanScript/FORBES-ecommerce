import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { carsAPI } from '../api/cars';
import { sellerRequestsAPI } from '../api/sellerRequests';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatPrice, getStatusBadgeClass } from '../utils/helpers';
import { Plus, Eye, Edit, Trash2, Car, AlertCircle, Clock, CheckCircle, XCircle, Send } from 'lucide-react';

export default function SellerDashboard() {
  const { user, isSeller, isUser, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [requestReason, setRequestReason] = useState('');

  // Seller request status query (for non-seller users)
  const { data: requestData, isLoading: requestLoading } = useQuery({
    queryKey: ['sellerRequest', 'my'],
    queryFn: () => sellerRequestsAPI.getMy().then(r => r.data),
    enabled: !isSeller,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['myListings'],
    queryFn: () => carsAPI.myListings().then(r => r.data.data),
    enabled: isSeller,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => carsAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myListings'] }),
  });

  const submitRequestMutation = useMutation({
    mutationFn: (reason) => sellerRequestsAPI.submit({ reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sellerRequest', 'my'] }),
  });

  // Show seller request flow if not yet a seller
  if (!isSeller) {
    if (requestLoading) return <LoadingSpinner size="lg" className="h-96" />;

    const request = requestData?.request;

    // Request is approved but user hasn't refreshed their role yet
    if (request?.status === 'Approved') {
      return (
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-status-success" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Request Approved!</h1>
          <p className="mt-2 text-secondary-muted">
            Your seller request has been approved. Please refresh to access your seller dashboard.
          </p>
          <button
            onClick={() => refreshUser().then(() => window.location.reload())}
            className="btn-primary mt-6"
          >
            Refresh My Account
          </button>
        </div>
      );
    }

    // Has a pending request
    if (request?.status === 'Pending') {
      return (
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <Clock className="mx-auto h-16 w-16 text-status-warning" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Request Pending</h1>
          <p className="mt-2 text-secondary-muted">
            Your request to become a seller is being reviewed by an admin. You&apos;ll be notified once it&apos;s processed.
          </p>
          <div className="mt-6 rounded-xl border border-status-warning/20 bg-status-warning/5 p-4 text-left">
            <p className="text-sm font-medium text-gray-700">Submitted on</p>
            <p className="text-sm text-secondary-muted">{new Date(request.createdAt).toLocaleDateString()}</p>
            {request.reason && (
              <>
                <p className="mt-3 text-sm font-medium text-gray-700">Your reason</p>
                <p className="text-sm text-secondary-muted">{request.reason}</p>
              </>
            )}
          </div>
        </div>
      );
    }

    // Has a rejected request — allow re-submit
    if (request?.status === 'Rejected') {
      return (
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <XCircle className="mx-auto h-16 w-16 text-status-error" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Request Rejected</h1>
          <p className="mt-2 text-secondary-muted">
            Your previous seller request was not approved.
          </p>
          {request.adminNote && (
            <div className="mt-4 rounded-xl border border-status-error/20 bg-status-error/5 p-4 text-left">
              <p className="text-sm font-medium text-status-error">Reason for rejection:</p>
              <p className="mt-1 text-sm text-gray-700">{request.adminNote}</p>
            </div>
          )}
          <div className="mt-6 text-left">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Submit a new request (optional reason)
            </label>
            <textarea
              rows={3}
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              placeholder="Tell us why you'd like to become a seller..."
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
            />
            <button
              onClick={() => submitRequestMutation.mutate(requestReason)}
              disabled={submitRequestMutation.isPending}
              className="btn-primary mt-3 flex w-full items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              {submitRequestMutation.isPending ? 'Submitting...' : 'Resubmit Request'}
            </button>
            {submitRequestMutation.isError && (
              <p className="mt-2 text-sm text-status-error">{submitRequestMutation.error?.response?.data?.error || 'Failed to submit.'}</p>
            )}
          </div>
        </div>
      );
    }

    // No request yet — show the form
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Car className="mx-auto h-16 w-16 text-primary-accent" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Become a Seller</h1>
        <p className="mt-2 text-secondary-muted">
          Request seller access to start listing vehicles on the marketplace. An admin will review your request.
        </p>
        <div className="mt-6 text-left">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Why do you want to become a seller? (optional)
          </label>
          <textarea
            rows={3}
            value={requestReason}
            onChange={(e) => setRequestReason(e.target.value)}
            placeholder="Tell us about yourself and why you'd like to sell vehicles..."
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
          />
          <button
            onClick={() => submitRequestMutation.mutate(requestReason)}
            disabled={submitRequestMutation.isPending}
            className="btn-primary mt-3 flex w-full items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            {submitRequestMutation.isPending ? 'Submitting...' : 'Submit Seller Request'}
          </button>
          {submitRequestMutation.isError && (
            <p className="mt-2 text-sm text-status-error">{submitRequestMutation.error?.response?.data?.error || 'Failed to submit.'}</p>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner size="lg" className="h-96" />;

  const listings = data || [];

  const stats = {
    total: listings.length,
    approved: listings.filter(c => c.status === 'Approved').length,
    pending: listings.filter(c => c.status === 'Pending').length,
    rejected: listings.filter(c => c.status === 'Rejected').length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="mt-1 text-sm text-secondary-muted">Welcome, {user?.name}</p>
        </div>
        <Link to="/seller/submit" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Listings', value: stats.total, color: 'text-primary-header' },
          { label: 'Approved', value: stats.approved, color: 'text-status-success' },
          { label: 'Pending', value: stats.pending, color: 'text-status-warning' },
          { label: 'Rejected', value: stats.rejected, color: 'text-status-error' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-secondary-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Listings Table */}
      {listings.length === 0 ? (
        <div className="mt-12 text-center">
          <Car className="mx-auto h-16 w-16 text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">No Listings Yet</h2>
          <p className="mt-1 text-secondary-muted">Create your first car listing to get started.</p>
          <Link to="/seller/submit" className="btn-primary mt-4 inline-block">Submit a Car</Link>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-surface-card">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Car</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-surface-light">
              {listings.map((car) => (
                <tr key={car.id} className="hover:bg-surface-card/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {car.images?.[0] ? (
                        <img src={car.images[0].url} alt="" className="h-12 w-16 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-surface-card">
                          <Car className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{car.title}</p>
                        <p className="text-xs text-secondary-muted">{car.year}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">{formatPrice(car.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(car.status)}`}>
                      {car.status === 'Rejected' && <AlertCircle className="h-3 w-3" />}
                      {car.status}
                    </span>
                    {car.rejectionReason && (
                      <p className="mt-1 text-xs text-status-error">{car.rejectionReason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-secondary-muted">
                    {new Date(car.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {car.status === 'Approved' && (
                        <Link to={`/cars/${car.slug}`} className="rounded-lg p-1.5 text-gray-500 hover:bg-surface-card">
                          <Eye className="h-4 w-4" />
                        </Link>
                      )}
                      <Link to={`/seller/submit?edit=${car.id}`} className="rounded-lg p-1.5 text-gray-500 hover:bg-surface-card">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => { if (window.confirm('Delete this listing?')) deleteMutation.mutate(car.id); }}
                        className="rounded-lg p-1.5 text-status-error hover:bg-status-error/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
