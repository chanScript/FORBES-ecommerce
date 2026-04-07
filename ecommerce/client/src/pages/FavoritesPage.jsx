import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { favoritesAPI } from '../api/cars';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatPrice } from '../utils/helpers';
import { Heart, MapPin, Calendar, Gauge, Fuel, Car, Home } from 'lucide-react';

export default function FavoritesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesAPI.list().then(r => r.data),
  });

  const removeMutation = useMutation({
    mutationFn: (listingId) => favoritesAPI.remove(listingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  if (isLoading) return <LoadingSpinner size="lg" className="h-96" />;

  const favorites = data || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Heart className="h-7 w-7 text-primary-accent" />
        <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="mt-16 text-center">
          <Heart className="mx-auto h-16 w-16 text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">No Favorites Yet</h2>
          <p className="mt-1 text-secondary-muted">
            Browse the marketplace and save listings you&apos;re interested in.
          </p>
          <Link to="/" className="btn-primary mt-4 inline-block">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((fav) => {
            const listing = fav.listing;
            if (!listing) return null;
            const image = listing.images?.[0]?.url;
            const isVehicle = listing.category === 'Vehicle';

            return (
              <div key={fav.id} className="card group">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-card">
                  {image ? (
                    <img
                      src={image}
                      alt={listing.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      {isVehicle ? <Car className="h-12 w-12 text-gray-300" /> : <Home className="h-12 w-12 text-gray-300" />}
                    </div>
                  )}
                  <button
                    onClick={() => removeMutation.mutate(listing.id)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-primary-accent shadow-sm hover:bg-white"
                    title="Remove from favorites"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
                  <p className="mt-1 text-lg font-bold text-primary-accent">{formatPrice(listing.price)}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary-muted">
                    {isVehicle && listing.year && (
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{listing.year}</span>
                    )}
                    {isVehicle && listing.mileage != null && (
                      <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{Number(listing.mileage).toLocaleString()} km</span>
                    )}
                    {isVehicle && listing.fuelType && (
                      <span className="flex items-center gap-1"><Fuel className="h-3 w-3" />{listing.fuelType}</span>
                    )}
                    {!isVehicle && listing.lotArea && (
                      <span className="flex items-center gap-1">{listing.lotArea} sqm</span>
                    )}
                    {!isVehicle && listing.bedrooms != null && (
                      <span className="flex items-center gap-1">{listing.bedrooms} bed</span>
                    )}
                    {listing.city && (
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.city}</span>
                    )}
                  </div>
                  <Link
                    to={`/listings/${listing.slug}`}
                    className="mt-3 block text-center text-sm font-semibold text-primary-accent hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
