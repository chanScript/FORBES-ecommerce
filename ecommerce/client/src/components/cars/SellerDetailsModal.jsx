import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { carsAPI } from '../../api/cars';
import { formatPrice } from '../../utils/helpers';
import { X, Phone, Calendar, Car, ExternalLink } from 'lucide-react';

export default function SellerDetailsModal({ sellerId, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['sellerProfile', sellerId],
    queryFn: () => carsAPI.getSellerProfile(sellerId).then(r => r.data),
    enabled: !!sellerId,
  });

  if (!sellerId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-surface-light shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-light px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Seller Details</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-accent border-t-transparent" />
            </div>
          ) : data ? (
            <>
              {/* Seller Info */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-header text-primary-on-dark font-bold text-2xl">
                  {data.seller?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{data.seller?.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-secondary-muted">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Member since {new Date(data.seller?.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </span>
                    {data.seller?.phone && (
                      <a href={`tel:${data.seller.phone}`} className="inline-flex items-center gap-1 text-primary-accent hover:underline">
                        <Phone className="h-3.5 w-3.5" /> {data.seller.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-surface-card p-4 text-center">
                  <Car className="mx-auto h-6 w-6 text-primary-accent" />
                  <p className="mt-1 text-2xl font-bold text-gray-900">{data.listings?.pagination?.total || 0}</p>
                  <p className="text-xs text-secondary-muted">Active Listings</p>
                </div>
                <div className="rounded-xl bg-surface-card p-4 text-center">
                  <Calendar className="mx-auto h-6 w-6 text-primary-accent" />
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {data.seller?.role === 'Seller' || data.seller?.role === 'Admin' ? 'Verified' : 'User'}
                  </p>
                  <p className="text-xs text-secondary-muted">Seller Status</p>
                </div>
              </div>

              {/* Seller Listings */}
              {data.listings?.data?.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Vehicles by this Seller ({data.listings.pagination.total})
                  </h4>
                  <div className="space-y-3">
                    {data.listings.data.slice(0, 6).map((car) => (
                      <Link
                        key={car.id}
                        to={`/cars/${car.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-surface-card transition-colors group"
                      >
                        <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {car.images?.[0]?.url ? (
                            <img src={car.images[0].url} alt={car.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-400">No img</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-accent transition-colors">
                            {car.title}
                          </p>
                          <p className="text-xs text-secondary-muted">
                            {car.brand?.name} · {car.vehicleType?.name} · {car.year}
                          </p>
                          <p className="text-sm font-bold text-primary-accent mt-0.5">{formatPrice(car.price)}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-primary-accent flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="py-12 text-center text-secondary-muted">Seller not found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
