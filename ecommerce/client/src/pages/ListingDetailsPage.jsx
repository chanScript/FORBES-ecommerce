import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingsAPI, favoritesAPI } from '../api/cars';
import { inquiriesAPI } from '../api/inquiries';
import { useAuth } from '../context/AuthContext';
import ImageGallery from '../components/cars/ImageGallery';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatPrice, formatMileage } from '../utils/helpers';
import {
  Heart, MapPin, Fuel, Gauge, Calendar, Settings, Palette,
  Users, Phone, Mail, ArrowLeft, Share2, Eye, Send, CheckCircle,
  Home, Maximize, BedDouble, Bath, ParkingCircle, Sofa, FileText, Package
} from 'lucide-react';

const SUBTYPE_LABELS = {
  Car: 'Car', Motorcycle: 'Motorcycle', Truck: 'Truck',
  HouseAndLot: 'House & Lot', VacantLot: 'Vacant Lot', CommercialProperty: 'Commercial Property',
};

export default function ListingDetailsPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryData, setInquiryData] = useState({ name: '', email: '', phone: '', message: '' });

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', slug],
    queryFn: () => listingsAPI.getBySlug(slug).then(r => r.data),
  });

  const toggleFavMutation = useMutation({
    mutationFn: () => {
      if (listing.isFavorited) return favoritesAPI.remove(listing.id);
      return favoritesAPI.add(listing.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', slug] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const inquiryMutation = useMutation({
    mutationFn: (data) => inquiriesAPI.submit(listing.id, data),
    onSuccess: () => {
      setShowInquiryForm(false);
      setInquiryData({ name: '', email: '', phone: '', message: '' });
    },
  });

  if (isLoading) return <LoadingSpinner size="lg" className="h-96" />;

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
        <Package className="mx-auto h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Listing Not Found</h2>
        <p className="mt-2 text-secondary-muted">This listing may have been removed or is no longer available.</p>
        <Link to="/" className="btn-primary mt-6 inline-block">Browse Listings</Link>
      </div>
    );
  }

  const isVehicle = listing.category === 'Vehicle';
  const isRealEstate = listing.category === 'RealEstate';

  // Build specs based on category
  const vehicleSpecs = isVehicle ? [
    listing.year && { icon: Calendar, label: 'Year', value: listing.year },
    listing.mileage != null && { icon: Gauge, label: 'Mileage', value: formatMileage(listing.mileage) },
    listing.fuelType && { icon: Fuel, label: 'Fuel Type', value: listing.fuelType },
    listing.transmission && { icon: Settings, label: 'Transmission', value: listing.transmission },
    listing.vehicleType?.name && { icon: Package, label: 'Body Type', value: listing.vehicleType.name },
    listing.color && { icon: Palette, label: 'Color', value: listing.color },
    listing.seats && { icon: Users, label: 'Seats', value: listing.seats },
    listing.engineCapacity && { icon: Settings, label: 'Engine', value: `${listing.engineCapacity}cc` },
  ].filter(Boolean) : [];

  const realEstateSpecs = isRealEstate ? [
    listing.lotArea && { icon: Maximize, label: 'Lot Area', value: `${listing.lotArea} sqm` },
    listing.floorArea && { icon: Maximize, label: 'Floor Area', value: `${listing.floorArea} sqm` },
    listing.bedrooms != null && { icon: BedDouble, label: 'Bedrooms', value: listing.bedrooms },
    listing.bathrooms != null && { icon: Bath, label: 'Bathrooms', value: listing.bathrooms },
    listing.parkingSpaces != null && { icon: ParkingCircle, label: 'Parking', value: listing.parkingSpaces },
    listing.furnishingStatus && { icon: Sofa, label: 'Furnishing', value: listing.furnishingStatus.replace(/([A-Z])/g, ' $1').trim() },
    listing.propertyAge != null && { icon: Calendar, label: 'Property Age', value: `${listing.propertyAge} years` },
    listing.titleType && { icon: FileText, label: 'Title', value: listing.titleType },
  ].filter(Boolean) : [];

  const specs = isVehicle ? vehicleSpecs : realEstateSpecs;

  const subtype = isVehicle
    ? SUBTYPE_LABELS[listing.vehicleSubtype]
    : SUBTYPE_LABELS[listing.realEstateSubtype];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-secondary-muted">
        <Link to="/" className="flex items-center gap-1 hover:text-primary-accent transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Listings
        </Link>
        <span>/</span>
        <span>{subtype || (isVehicle ? 'Vehicle' : 'Real Estate')}</span>
        {isVehicle && listing.brand?.name && (
          <>
            <span>/</span>
            <span>{listing.brand.name}</span>
          </>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Images + Description */}
        <div className="lg:col-span-2">
          <ImageGallery images={listing.images} />

          {/* Title + Actions */}
          <div className="mt-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-secondary-muted">
                <MapPin className="h-4 w-4" /> {listing.city}
                {listing.condition && <><span>•</span><span>{listing.condition}</span></>}
                {subtype && <><span>•</span><span>{subtype}</span></>}
              </div>
            </div>
            <div className="flex gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => toggleFavMutation.mutate()}
                  className="rounded-lg border border-gray-200 p-2.5 hover:bg-surface-card transition-colors"
                >
                  <Heart className={`h-5 w-5 ${listing.isFavorited ? 'fill-status-error text-status-error' : 'text-gray-400'}`} />
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
            <span className="text-3xl font-bold text-primary-accent">{formatPrice(listing.price)}</span>
          </div>

          {/* Specifications Grid */}
          {specs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">
                {isVehicle ? 'Specifications' : 'Property Details'}
              </h2>
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
          )}

          {/* Amenities (Real Estate) */}
          {isRealEstate && listing.amenities && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
              <p className="mt-3 text-sm text-gray-700">{listing.amenities}</p>
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">Description</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                {listing.description}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Seller Info + Inquiry */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-6">
            {/* Seller Info */}
            {listing.seller && (
              <div className="rounded-xl border bg-surface-light p-6">
                <h3 className="text-lg font-semibold text-gray-900">Seller Information</h3>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-header text-primary-on-dark font-bold text-lg">
                    {listing.seller.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{listing.seller.name}</p>
                    <p className="text-xs text-secondary-muted">Verified Seller</p>
                  </div>
                </div>
                {listing.seller.phone && (
                  <a
                    href={`tel:${listing.seller.phone}`}
                    className="btn-primary mt-4 flex w-full items-center justify-center gap-2"
                  >
                    <Phone className="h-4 w-4" /> Call Seller
                  </a>
                )}
              </div>
            )}

            {/* Inquiry Form — always visible, no login needed */}
            <div className="rounded-xl border bg-surface-light p-6">
              <h3 className="text-lg font-semibold text-gray-900">Interested?</h3>
              <p className="mt-1 text-sm text-secondary-muted">Send an inquiry — no account needed.</p>

              {inquiryMutation.isSuccess ? (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-status-success bg-status-success/10 px-4 py-3 text-sm font-medium text-status-success">
                  <CheckCircle className="h-4 w-4" /> Inquiry sent! We&apos;ll be in touch.
                </div>
              ) : showInquiryForm ? (
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={inquiryData.name}
                    onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
                  />
                  <input
                    type="email"
                    placeholder="Your Email *"
                    value={inquiryData.email}
                    onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={inquiryData.phone}
                    onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
                  />
                  <textarea
                    value={inquiryData.message}
                    onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                    placeholder="Add a message (optional)..."
                    rows={3}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => inquiryMutation.mutate(inquiryData)}
                      disabled={inquiryMutation.isPending || !inquiryData.name || !inquiryData.email}
                      className="btn-primary flex flex-1 items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {inquiryMutation.isPending ? 'Sending...' : 'Send Inquiry'}
                    </button>
                    <button
                      onClick={() => setShowInquiryForm(false)}
                      className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                  {inquiryMutation.isError && (
                    <p className="text-xs text-status-error">{inquiryMutation.error?.response?.data?.error || 'Failed to send.'}</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowInquiryForm(true)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-status-success px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-status-success/90"
                >
                  <Send className="h-4 w-4" /> I&apos;m Interested
                </button>
              )}
            </div>

            {/* Safety Tips */}
            <div className="rounded-xl border bg-surface-light p-6">
              <p className="text-xs font-semibold text-gray-700">Safety Tips</p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-xs text-secondary-muted">
                <li>Meet in a public place</li>
                <li>Inspect thoroughly before paying</li>
                <li>Verify documents and ownership</li>
                <li>Avoid wire transfers to unknown parties</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
