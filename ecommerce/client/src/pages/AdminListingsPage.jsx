import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../api/cars';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import { formatPrice, getStatusBadgeClass } from '../utils/helpers';
import { Check, X, Trash2, RotateCcw, Eye, AlertTriangle, Car } from 'lucide-react';

const TABS = [
  { key: 'all', label: 'All Listings' },
  { key: 'pending', label: 'Pending' },
  { key: 'trash', label: 'Trash' },
];

export default function AdminListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'all';
  const { isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Queries
  const allQuery = useQuery({
    queryKey: ['admin', 'allListings', page],
    queryFn: () => adminAPI.listAll({ page, limit: 15 }).then(r => r.data),
    enabled: tab === 'all',
    placeholderData: (prev) => prev,
  });

  const pendingQuery = useQuery({
    queryKey: ['admin', 'pending'],
    queryFn: () => adminAPI.listPending().then(r => r.data),
    enabled: tab === 'pending',
  });

  const trashQuery = useQuery({
    queryKey: ['admin', 'trash'],
    queryFn: () => adminAPI.listTrash().then(r => r.data),
    enabled: tab === 'trash',
  });

  // Mutations
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin'] });
  };

  const approveMutation = useMutation({ mutationFn: (id) => adminAPI.approve(id), onSuccess: invalidateAll });
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminAPI.reject(id, reason),
    onSuccess: () => { setRejectId(null); setRejectReason(''); invalidateAll(); },
  });
  const softDeleteMutation = useMutation({ mutationFn: (id) => adminAPI.softDelete(id), onSuccess: invalidateAll });
  const restoreMutation = useMutation({ mutationFn: (id) => adminAPI.restore(id), onSuccess: invalidateAll });
  const forceDeleteMutation = useMutation({ mutationFn: (id) => adminAPI.forceDelete(id), onSuccess: invalidateAll });

  const switchTab = (key) => {
    setSearchParams({ tab: key });
    setPage(1);
  };

  const renderCarRow = (car, isTrash = false) => (
    <tr key={car.id} className="hover:bg-surface-card/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {car.images?.[0] ? (
            <img src={car.images[0].url} alt="" className="h-10 w-14 rounded object-cover" />
          ) : (
            <div className="flex h-10 w-14 items-center justify-center rounded bg-surface-card">
              <Car className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900 line-clamp-1">{car.title}</p>
            <p className="text-xs text-secondary-muted">{car.seller?.name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm">{formatPrice(car.price)}</td>
      <td className="px-4 py-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(car.status)}`}>
          {car.status}
        </span>
        {car.rejectionReason && (
          <p className="mt-1 max-w-xs truncate text-xs text-status-error" title={car.rejectionReason}>
            {car.rejectionReason}
          </p>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-secondary-muted">
        {new Date(car.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          {isTrash ? (
            <>
              <button
                onClick={() => restoreMutation.mutate(car.id)}
                className="rounded p-1.5 text-status-success hover:bg-status-success/10"
                title="Restore"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => { if (window.confirm('Permanently delete this listing? This cannot be undone.')) forceDeleteMutation.mutate(car.id); }}
                  className="rounded p-1.5 text-status-error hover:bg-status-error/10"
                  title="Permanently Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </>
          ) : (
            <>
              {car.status === 'Approved' && car.slug && (
                <a href={`/listings/${car.slug}`} target="_blank" rel="noreferrer" className="rounded p-1.5 text-gray-500 hover:bg-surface-card">
                  <Eye className="h-4 w-4" />
                </a>
              )}
              {car.status === 'Pending' && (
                <>
                  <button
                    onClick={() => approveMutation.mutate(car.id)}
                    className="rounded p-1.5 text-status-success hover:bg-status-success/10"
                    title="Approve"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setRejectId(car.id)}
                    className="rounded p-1.5 text-status-error hover:bg-status-error/10"
                    title="Reject"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => { if (window.confirm('Move to trash?')) softDeleteMutation.mutate(car.id); }}
                className="rounded p-1.5 text-gray-400 hover:bg-surface-card"
                title="Soft Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const isLoading = tab === 'all' ? allQuery.isLoading : tab === 'pending' ? pendingQuery.isLoading : trashQuery.isLoading;
  const cars = tab === 'all' ? (allQuery.data?.data || []) : tab === 'pending' ? (pendingQuery.data || []) : (trashQuery.data || []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Manage Listings</h1>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'border-b-2 border-primary-accent text-primary-accent'
                : 'text-secondary-muted hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-surface-light p-6 shadow-xl">
            <div className="flex items-center gap-2 text-status-error">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-semibold">Reject Listing</h3>
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
                disabled={!rejectReason.trim()}
                className="rounded-lg bg-status-error px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner className="h-64" />
      ) : cars.length === 0 ? (
        <div className="mt-12 text-center">
          <Car className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-secondary-muted">No listings found.</p>
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-xl border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-surface-card">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Listing</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-surface-light">
                {cars.map((car) => renderCarRow(car, tab === 'trash'))}
              </tbody>
            </table>
          </div>

          {tab === 'all' && allQuery.data?.pagination && (
            <div className="mt-6">
              <Pagination
                page={allQuery.data.pagination.page}
                totalPages={allQuery.data.pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
