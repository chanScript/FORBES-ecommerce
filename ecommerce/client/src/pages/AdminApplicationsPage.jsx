import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../api/cars';
import api from '../api/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import { ClipboardList, Package, Trash2 } from 'lucide-react';

const STATUS_STYLES = {
  New: 'bg-yellow-100 text-yellow-700',
  Contacted: 'bg-blue-100 text-blue-700',
  Closed: 'bg-gray-100 text-gray-600',
};

const SERVICE_LABELS = {
  'car-insurance': 'Car Insurance',
  'truck-insurance': 'Truck Insurance',
  'motorcycle-insurance': 'Motorcycle Insurance',
  'ctpl-insurance': 'CTPL Insurance',
  'three-wheeler-insurance': 'Three-Wheeler Insurance',
  'used-car-finance': 'Used Car Finance',
  'sangla-or-cr': 'Sangla OR/CR',
  'personal-loans': 'Personal Loans',
  'or-cr-renewal': 'OR/CR Renewal',
  'title-transfer': 'Title Transfer',
  'partner-dealer': 'Partner Dealer',
  'loan-consultant': 'Loan Consultant',
};

export default function AdminApplicationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('New');
  const [serviceFilter, setServiceFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminApplications', page, statusFilter, serviceFilter],
    queryFn: () =>
      adminAPI
        .listApplications({
          page,
          limit: 15,
          status: statusFilter || undefined,
          serviceType: serviceFilter || undefined,
        })
        .then((r) => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminAPI.updateApplicationStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminApplications'] }),
  });

  const deleteAppMutation = useMutation({
    mutationFn: (id) => api.delete(`/applications/admin/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminApplications'] }),
  });

  const applications = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ClipboardList className="h-6 w-6 text-primary-accent" /> Service Applications
          </h1>
          <p className="mt-1 text-sm text-secondary-muted">
            Manage applications from Insurance, Finance, OR/CR, and Partner services
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Closed">Closed</option>
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }}
            className="rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none"
          >
            <option value="">All Services</option>
            {Object.entries(SERVICE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner className="h-64" />
      ) : applications.length === 0 ? (
        <div className="mt-12 text-center">
          <Package className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-secondary-muted">No applications found.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-surface-card">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Applicant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-surface-light">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-surface-card/50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{app.fullName}</p>
                      <p className="text-xs text-secondary-muted">{app.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {SERVICE_LABELS[app.serviceType] || app.serviceType}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-sm text-secondary-muted truncate">
                      {app.address}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={app.status}
                        onChange={(e) => statusMutation.mutate({ id: app.id, status: e.target.value })}
                        disabled={statusMutation.isPending}
                        className={`rounded-full border-0 px-2.5 py-0.5 text-xs font-medium focus:outline-none ${STATUS_STYLES[app.status] || ''}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-secondary-muted">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => { if (window.confirm('Delete this application?')) deleteAppMutation.mutate(app.id); }}
                          className="rounded p-1.5 text-status-error hover:bg-status-error/10"
                          title="Delete"
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

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
