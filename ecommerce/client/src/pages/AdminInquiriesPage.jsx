import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inquiriesAPI } from '../api/inquiries';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/helpers';
import Pagination from '../components/ui/Pagination';
import {
  MessageSquare, Eye, CheckCircle, Clock, Phone, Mail,
  ExternalLink, Filter, Car
} from 'lucide-react';

const STATUS_STYLES = {
  New: { bg: 'bg-blue-100 text-blue-700', icon: Clock },
  Seen: { bg: 'bg-yellow-100 text-yellow-700', icon: Eye },
  Contacted: { bg: 'bg-green-100 text-green-700', icon: CheckCircle },
};

export default function AdminInquiriesPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminInquiries', page, statusFilter],
    queryFn: () => inquiriesAPI.adminList({ page, limit: 10, status: statusFilter || undefined }).then(r => r.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => inquiriesAPI.adminUpdateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInquiries'] });
      queryClient.invalidateQueries({ queryKey: ['inquiryCount'] });
    },
  });

  const inquiries = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary-accent" /> Customer Inquiries
          </h1>
          <p className="mt-1 text-sm text-secondary-muted">
            Manage customer interest and follow up on leads
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Seen">Seen</option>
            <option value="Contacted">Contacted</option>
          </select>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-accent border-t-transparent" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="rounded-xl border bg-surface-light p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-gray-500">No inquiries found.</p>
          </div>
        ) : (
          inquiries.map((inquiry) => {
            const style = STATUS_STYLES[inquiry.status] || STATUS_STYLES.New;
            const StatusIcon = style.icon;
            return (
              <div key={inquiry.id} className="rounded-xl border bg-surface-light p-5 transition-colors hover:border-primary-accent/20">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  {/* Left: User + Car Info */}
                  <div className="flex-1 space-y-3">
                    {/* Interested Customer */}
                    <div>
                      <span className="text-xs font-medium text-secondary-muted">Interested Customer</span>
                      <div className="mt-1 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-header text-primary-on-dark font-bold">
                          {inquiry.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{inquiry.name}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-muted">
                            <span className="inline-flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {inquiry.email}
                            </span>
                            {inquiry.phone && (
                              <a href={`tel:${inquiry.phone}`} className="inline-flex items-center gap-1 text-primary-accent hover:underline">
                                <Phone className="h-3 w-3" /> {inquiry.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Listing */}
                    <div>
                      <span className="text-xs font-medium text-secondary-muted">Listing of Interest</span>
                      <Link
                        to={`/listings/${inquiry.listing?.slug}`}
                        className="mt-1 flex items-center gap-3 rounded-lg border p-2 hover:bg-surface-card transition-colors group"
                      >
                        <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {inquiry.listing?.images?.[0]?.url ? (
                            <img src={inquiry.listing.images[0].url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center"><Car className="h-4 w-4 text-gray-400" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-accent">{inquiry.listing?.title}</p>
                          <p className="text-xs text-primary-accent font-bold">{formatPrice(inquiry.listing?.price)}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-300 flex-shrink-0" />
                      </Link>
                    </div>

                    {/* Seller */}
                    {inquiry.listing?.seller && (
                      <div className="text-xs text-secondary-muted">
                        <span className="font-medium">Seller:</span> {inquiry.listing.seller.name} ({inquiry.listing.seller.email})
                      </div>
                    )}

                    {/* Message */}
                    {inquiry.message && (
                      <div className="rounded-lg bg-surface-card p-3">
                        <p className="text-xs font-medium text-secondary-muted">Customer Message</p>
                        <p className="mt-1 text-sm text-gray-700">{inquiry.message}</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Status + Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${style.bg}`}>
                      <StatusIcon className="h-3 w-3" /> {inquiry.status}
                    </span>

                    <p className="text-xs text-secondary-muted">
                      {new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>

                    {/* Status Actions */}
                    <div className="flex gap-1">
                      {inquiry.status === 'New' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: inquiry.id, status: 'Seen' })}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium text-yellow-700 hover:bg-yellow-50 transition-colors"
                        >
                          <Eye className="inline h-3 w-3 mr-1" /> Mark Seen
                        </button>
                      )}
                      {inquiry.status !== 'Contacted' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: inquiry.id, status: 'Contacted' })}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
                        >
                          <CheckCircle className="inline h-3 w-3 mr-1" /> Mark Contacted
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
