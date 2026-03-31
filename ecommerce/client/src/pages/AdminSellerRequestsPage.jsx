import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerRequestsAPI } from '../api/sellerRequests';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import { Check, X, AlertTriangle, UserCheck, Clock, Users } from 'lucide-react';

const TABS = [
  { key: 'all', label: 'All Requests' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Approved', label: 'Approved' },
  { key: 'Rejected', label: 'Rejected' },
];

const STATUS_BADGE = {
  Pending: 'badge-pending',
  Approved: 'badge-approved',
  Rejected: 'badge-rejected',
};

export default function AdminSellerRequestsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [rejectId, setRejectId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const queryParams = { page, limit: 15 };
  if (tab !== 'all') queryParams.status = tab;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'sellerRequests', tab, page],
    queryFn: () => sellerRequestsAPI.adminList(queryParams).then(r => r.data),
    placeholderData: (prev) => prev,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'sellerRequests'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'sellerRequestCount'] });
  };

  const approveMutation = useMutation({
    mutationFn: (id) => sellerRequestsAPI.adminApprove(id),
    onSuccess: invalidateAll,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, adminNote }) => sellerRequestsAPI.adminReject(id, adminNote),
    onSuccess: () => { setRejectId(null); setRejectNote(''); invalidateAll(); },
  });

  const requests = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <div className="flex items-center gap-3">
        <UserCheck className="h-7 w-7 text-primary-accent" />
        <h1 className="text-2xl font-bold text-gray-900">Seller Requests</h1>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1); }}
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
              <h3 className="font-semibold">Reject Seller Request</h3>
            </div>
            <textarea
              rows={3}
              placeholder="Reason for rejection (optional)..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="mt-4 w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={() => { setRejectId(null); setRejectNote(''); }} className="btn-outline text-sm">Cancel</button>
              <button
                onClick={() => rejectMutation.mutate({ id: rejectId, adminNote: rejectNote })}
                disabled={rejectMutation.isPending}
                className="rounded-lg bg-status-error px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner className="h-64" />
      ) : requests.length === 0 ? (
        <div className="mt-12 text-center">
          <Users className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-secondary-muted">No seller requests found.</p>
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-xl border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-surface-card">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-surface-light">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-card/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{req.user?.name}</p>
                        <p className="text-xs text-secondary-muted">{req.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-xs truncate text-sm text-gray-700">{req.reason || '—'}</p>
                      {req.adminNote && (
                        <p className="mt-1 max-w-xs truncate text-xs text-status-error">Note: {req.adminNote}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[req.status] || ''}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-secondary-muted">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {req.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => approveMutation.mutate(req.id)}
                              disabled={approveMutation.isPending}
                              className="rounded p-1.5 text-status-success hover:bg-status-success/10"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setRejectId(req.id)}
                              className="rounded p-1.5 text-status-error hover:bg-status-error/10"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {req.status === 'Approved' && (
                          <span className="flex items-center gap-1 text-xs text-status-success">
                            <Check className="h-3 w-3" /> Approved
                          </span>
                        )}
                        {req.status === 'Rejected' && (
                          <span className="flex items-center gap-1 text-xs text-status-error">
                            <X className="h-3 w-3" /> Rejected
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="mt-6">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
