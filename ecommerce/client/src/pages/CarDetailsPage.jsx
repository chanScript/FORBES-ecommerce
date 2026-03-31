import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carsAPI, favoritesAPI } from '../api/cars';
import { useAuth } from '../context/AuthContext';
import ImageGallery from '../components/cars/ImageGallery';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatPrice, formatMileage } from '../utils/helpers';
import {
  Heart, MapPin, Fuel, Gauge, Calendar, Settings, Palette,
  Users, Phone, Mail, ArrowLeft, Share2, Car
} from 'lucide-react';

export default function CarDetailsPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: car, isLoading, error } = useQuery({
    queryKey: ['car', slug],
    queryFn: () => carsAPI.getBySlug(slug).then(r => r.data),
  });

  const toggleFavMutation = useMutation({
    mutationFn: () => {
      if (car.isFavorited) return favoritesAPI.remove(car.id);
      return favoritesAPI.add(car.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car', slug] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  if (isLoading) return <LoadingSpinner size="lg" className="h-96" />;

  if (error || !car) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
        <Car className="mx-auto h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Car Not Found</h2>
        <p className="mt-2 text-secondary-muted">This listing may have been removed or is no longer available.</p>
        <Link to="/" className="btn-primary mt-6 inline-block">Browse Cars</Link>
      </div>
    );
  }

  const specs = [
    { icon: Calendar, label: 'Year', value: car.year },
    { icon: Gauge, label: 'Mileage', value: formatMileage(car.mileage) },
    { icon: Fuel, label: 'Fuel Type', value: car.fuelType },
    { icon: Settings, label: 'Transmission', value: car.transmission },
    { icon: Car, label: 'Body Type', value: car.vehicleType?.name },
    { icon: Palette, label: 'Color', value: car.color || 'N/A' },
    { icon: Users, label: 'Seats', value: car.seats || 'N/A' },
    ...(car.engineCapacity ? [{ icon: Settings, label: 'Engine', value: `${car.engineCapacity}cc` }] : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-secondary-muted">
        <Link to="/" className="flex items-center gap-1 hover:text-primary-accent transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Listings
        </Link>
        <span>/</span>
        <span>{car.brand?.name}</span>
        <span>/</span>
        <span className="text-gray-900">{car.model?.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Images + Description */}
        <div className="lg:col-span-2">
          <ImageGallery images={car.images} />

          {/* Title + Actions */}
          <div className="mt-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{car.title}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-secondary-muted">
                <MapPin className="h-4 w-4" /> {car.city}
                <span>•</span>
                <span>{car.condition}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => toggleFavMutation.mutate()}
                  className="rounded-lg border border-gray-200 p-2.5 hover:bg-surface-card transition-colors"
                >
                  <Heart className={`h-5 w-5 ${car.isFavorited ? 'fill-status-error text-status-error' : 'text-gray-400'}`} />
                </button>
              )}
              <button
                className="rounded-lg border border-gray-200 p-2.5 hover:bg-surface-card transition-colors"
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
              >
                <Share2 className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="mt-4">
            <span className="text-3xl font-bold text-primary-accent">{formatPrice(car.price)}</span>
          </div>

          {/* Specifications Grid */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">Specifications</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {specs.map((spec) => (
                <div key={spec.label} className="rounded-lg bg-surface-card p-3">
                  <spec.icon className="h-5 w-5 text-primary-accent" />
                  <p className="mt-1 text-xs text-secondary-muted">{spec.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {car.description && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">Description</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                {car.description}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Seller Info */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl border bg-surface-light p-6">
            <h3 className="text-lg font-semibold text-gray-900">Seller Information</h3>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-header text-primary-on-dark font-bold text-lg">
                {car.seller?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{car.seller?.name}</p>
                <p className="text-xs text-secondary-muted">Verified Seller</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {car.seller?.phone && (
                <a
                  href={`tel:${car.seller.phone}`}
                  className="btn-primary flex w-full items-center justify-center gap-2"
                >
                  <Phone className="h-4 w-4" /> Call Seller
                </a>
              )}
              {car.seller?.email && (
                <a
                  href={`mailto:${car.seller.email}?subject=Inquiry about ${car.title}`}
                  className="btn-outline flex w-full items-center justify-center gap-2"
                >
                  <Mail className="h-4 w-4" /> Email Seller
                </a>
              )}
            </div>

            <div className="mt-6 rounded-lg bg-surface-card p-4 text-xs text-secondary-muted">
              <p className="font-semibold text-gray-700">Safety Tips</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Meet in a public place</li>
                <li>Inspect the car thoroughly</li>
                <li>Verify documents before paying</li>
                <li>Avoid wire transfers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
