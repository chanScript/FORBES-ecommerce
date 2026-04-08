import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { carsAPI } from '../api/cars';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatPrice } from '../utils/helpers';
import {
  ArrowLeft, Calendar, Car, Phone, Mail, ExternalLink,
  ShieldCheck, User as UserIcon, Package
} from 'lucide-react';

export default function SellerProfilePage() {
  const { sellerId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['sellerProfile', sellerId],
    queryFn: () => carsAPI.getSellerProfile(sellerId).then(r => r.data),
    enabled: !!sellerId,
  });

  if (isLoading) return <LoadingSpinner className="h-96" />;

  if (!data?.seller) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <UserIcon className="mx-auto h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Seller Not Found</h2>
        <Link to="/browse" className="btn-primary mt-6 inline-block">Browse Listings</Link>
      </div>
    );
  }

  const { seller, listings } = data;
  const listingData = listings?.data || [];
  const totalListings = listings?.pagination?.total || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-secondary-muted">
        <Link to="/browse" className="flex items-center gap-1 hover:text-primary-accent transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>
        <span>/</span>
        <span className="text-gray-900">{seller.name}</span>
      </div>

      {/* Seller Header */}
      <div className="rounded-xl border p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-header text-primary-on-dark font-bold text-3xl flex-shrink-0">
            {seller.name?.charAt(0)?.toUpperCase()}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{seller.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-secondary-muted">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Member since {new Date(seller.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </span>
              {seller.phone && (
                <a href={`tel:${seller.phone}`} className="inline-flex items-center gap-1.5 text-primary-accent hover:underline">
                  <Phone className="h-4 w-4" /> {seller.phone}
                </a>
              )}
              {seller.email && (
                <a href={`mailto:${seller.email}`} className="inline-flex items-center gap-1.5 text-primary-accent hover:underline">
                  <Mail className="h-4 w-4" /> {seller.email}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-surface-card p-4 text-center">
            <Car className="mx-auto h-6 w-6 text-primary-accent" />
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalListings}</p>
            <p className="text-xs text-secondary-muted">Active Listings</p>
          </div>
          <div className="rounded-xl bg-surface-card p-4 text-center">
            <ShieldCheck className="mx-auto h-6 w-6 text-status-success" />
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {seller.role === 'Seller' || seller.role === 'Admin' ? 'Verified' : 'User'}
            </p>
            <p className="text-xs text-secondary-muted">Seller Status</p>
          </div>
          <div className="rounded-xl bg-surface-card p-4 text-center">
            <Calendar className="mx-auto h-6 w-6 text-primary-blue" />
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {Math.floor((Date.now() - new Date(seller.memberSince).getTime()) / (1000 * 60 * 60 * 24 * 30))}
            </p>
            <p className="text-xs text-secondary-muted">Months Active</p>
          </div>
        </div>
      </div>

      {/* Seller Listings */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Listings by {seller.name} ({totalListings})
        </h2>

        {listingData.length === 0 ? (
          <div className="rounded-xl border p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-secondary-muted">No active listings at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listingData.map((listing) => (
              <Link
                key={listing.id}
                to={`/listings/${listing.slug}`}
                className="group overflow-hidden rounded-xl border transition-shadow hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  {listing.images?.[0]?.url ? (
                    <img
                      src={listing.images[0].url}
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">No Image</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-accent transition-colors">
                    {listing.title}
                  </h3>
                  <p className="mt-1 text-xs text-secondary-muted">
                    {listing.brand?.name && `${listing.brand.name} · `}
                    {listing.vehicleType?.name && `${listing.vehicleType.name} · `}
                    {listing.year || listing.city}
                  </p>
                  <p className="mt-2 text-lg font-bold text-primary-accent">{formatPrice(listing.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
