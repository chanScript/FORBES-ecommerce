import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api/cars';
import { sellerRequestsAPI } from '../api/sellerRequests';
import { inquiriesAPI } from '../api/inquiries';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { LayoutDashboard, ClipboardCheck, List, Trash2, UserCheck, MessageSquare } from 'lucide-react';

export default function AdminDashboard() {
  const { data: allCars, isLoading: allLoading } = useQuery({
    queryKey: ['admin', 'allCars'],
    queryFn: () => adminAPI.listAll({ limit: 1 }).then(r => r.data),
  });

  const { data: pendingCars, isLoading: pendingLoading } = useQuery({
    queryKey: ['admin', 'pending'],
    queryFn: () => adminAPI.listPending().then(r => r.data),
  });

  const { data: trashCars, isLoading: trashLoading } = useQuery({
    queryKey: ['admin', 'trash'],
    queryFn: () => adminAPI.listTrash().then(r => r.data),
  });

  const { data: sellerRequests, isLoading: sellerReqLoading } = useQuery({
    queryKey: ['admin', 'sellerRequestCount'],
    queryFn: () => sellerRequestsAPI.adminList({ status: 'Pending', limit: 1 }).then(r => r.data),
  });

  const { data: inquiryCountData, isLoading: inquiryLoading } = useQuery({
    queryKey: ['inquiryCount'],
    queryFn: () => inquiriesAPI.adminCount().then(r => r.data),
  });

  const isLoading = allLoading || pendingLoading || trashLoading || sellerReqLoading || inquiryLoading;

  if (isLoading) return <LoadingSpinner size="lg" className="h-96" />;

  const totalCount = allCars?.pagination?.total || 0;
  const pendingCount = pendingCars?.length || 0;
  const trashCount = trashCars?.length || 0;
  const sellerReqCount = sellerRequests?.pagination?.total || 0;
  const inquiryCount = inquiryCountData?.count || 0;

  const cards = [
    { label: 'Total Listings', value: totalCount, icon: List, link: '/admin/listings', color: 'bg-primary-blue' },
    { label: 'Pending Approval', value: pendingCount, icon: ClipboardCheck, link: '/admin/listings?tab=pending', color: 'bg-status-warning' },
    { label: 'Seller Requests', value: sellerReqCount, icon: UserCheck, link: '/admin/seller-requests', color: 'bg-primary-accent' },
    { label: 'New Inquiries', value: inquiryCount, icon: MessageSquare, link: '/admin/inquiries', color: 'bg-primary-blue' },
    { label: 'In Trash', value: trashCount, icon: Trash2, link: '/admin/listings?tab=trash', color: 'bg-status-error' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-7 w-7 text-primary-accent" />
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.link}
            className="card flex items-center gap-4 p-6 transition-shadow hover:shadow-lg"
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${c.color} text-white`}>
              <c.icon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{c.value}</p>
              <p className="text-sm text-secondary-muted">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className="mt-8 rounded-xl border border-status-warning/30 bg-status-warning/5 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <ClipboardCheck className="h-5 w-5 text-status-warning" />
            {pendingCount} Listings Awaiting Approval
          </h2>
          <p className="mt-1 text-sm text-secondary-muted">
            Review and approve or reject new car submissions.
          </p>
          <Link to="/admin/listings?tab=pending" className="btn-primary mt-4 inline-block">
            Review Now
          </Link>
        </div>
      )}

      {sellerReqCount > 0 && (
        <div className="mt-4 rounded-xl border border-primary-accent/30 bg-primary-accent/5 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <UserCheck className="h-5 w-5 text-primary-accent" />
            {sellerReqCount} Pending Seller Requests
          </h2>
          <p className="mt-1 text-sm text-secondary-muted">
            Users are requesting seller access. Review and approve or reject.
          </p>
          <Link to="/admin/seller-requests" className="btn-primary mt-4 inline-block">
            Review Requests
          </Link>
        </div>
      )}

      {inquiryCount > 0 && (
        <div className="mt-4 rounded-xl border border-primary-blue/30 bg-primary-blue/5 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <MessageSquare className="h-5 w-5 text-primary-blue" />
            {inquiryCount} New Customer Inquiries
          </h2>
          <p className="mt-1 text-sm text-secondary-muted">
            Customers are interested in vehicles. Follow up to close leads.
          </p>
          <Link to="/admin/inquiries" className="btn-primary mt-4 inline-block">
            View Inquiries
          </Link>
        </div>
      )}
    </div>
  );
}
