import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listingsAPI } from '../api/cars';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatPrice, getStatusBadgeClass } from '../utils/helpers';
import { Plus, Eye, Edit, Trash2, Package, AlertCircle, ShoppingBag } from 'lucide-react';
import ApplySellerModal from '../components/ui/ApplySellerModal';

export default function SellerDashboard() {
  const { user, isSeller } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['myListings'],
    queryFn: () => listingsAPI.myListings().then(r => r.data.data),
    enabled: isSeller,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => listingsAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myListings'] }),
  });

  // Non-sellers see apply button
  if (!isSeller) {
    return (
      <NonSellerView />
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
          <Package className="mx-auto h-16 w-16 text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">No Listings Yet</h2>
          <p className="mt-1 text-secondary-muted">Create your first listing to get started.</p>
          <Link to="/seller/submit" className="btn-primary mt-4 inline-block">New Listing</Link>
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
                          <Package className="h-5 w-5 text-gray-400" />
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
                        <Link to={`/listings/${car.slug}`} className="rounded-lg p-1.5 text-gray-500 hover:bg-surface-card">
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

function NonSellerView() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Become a Seller</h1>
      <p className="mt-2 text-secondary-muted">
        Apply to become a seller and start listing your vehicles or properties on our marketplace.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <button onClick={() => setModalOpen(true)} className="btn-primary inline-flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" /> Apply as Seller
        </button>
        <Link to="/" className="text-sm text-secondary-muted hover:text-primary-accent">Browse Marketplace</Link>
      </div>
      <ApplySellerModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
