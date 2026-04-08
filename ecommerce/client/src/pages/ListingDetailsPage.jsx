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
  Users, Phone, ArrowLeft, Share2, Send, CheckCircle,
  Home, Maximize, BedDouble, Bath, ParkingCircle, Sofa, FileText, Package,
  Zap, ShieldCheck, Wrench, ClipboardList, Tag, ThumbsUp, AlertTriangle, Check, X as XIcon
} from 'lucide-react';

const SUBTYPE_LABELS = {
  Car: 'Car', Motorcycle: 'Motorcycle', Truck: 'Truck',
  HouseAndLot: 'House & Lot', VacantLot: 'Vacant Lot', CommercialProperty: 'Commercial Property',
};

const FEATURE_LABELS = {
  infotainment: 'Infotainment System', soundSystem: 'Premium Sound System',
  navigation: 'Navigation / GPS', bluetooth: 'Bluetooth', keylessEntry: 'Keyless Entry',
  cruiseControl: 'Cruise Control', climateControl: 'Climate Control',
  powerWindows: 'Power Windows', powerSeats: 'Power Seats', sunroof: 'Sunroof / Moonroof',
  rearCamera: 'Rear Camera', dashCam: 'Dash Camera',
};

const SAFETY_LABELS = {
  airbags: 'Airbags', abs: 'ABS', ebd: 'EBD',
  tractionControl: 'Traction Control', stabilityControl: 'Stability Control',
  parkingSensors: 'Parking Sensors', reverseCamera: 'Reverse Camera',
  camera360: '360 Camera', blindSpot: 'Blind Spot Monitor',
  laneDeparture: 'Lane Departure Warning', adaptiveCruise: 'Adaptive Cruise Control',
  alarm: 'Security Alarm',
};

const OWNERSHIP_LABELS = {
  registeredOwner: 'Registered Owner', orCrAvailable: 'OR/CR Available',
  fullyPaid: 'Fully Paid', withEncumbrance: 'With Encumbrance',
  openDeedOfSale: 'Open Deed of Sale',
};

const VEHICLE_TABS = [
  { id: 'overview', label: 'Overview', icon: ClipboardList },
  { id: 'features', label: 'Features & Tech', icon: Zap },
  { id: 'safety', label: 'Safety', icon: ShieldCheck },
  { id: 'condition', label: 'Condition', icon: Wrench },
  { id: 'ownership', label: 'Ownership', icon: FileText },
];

function HighlightBadge({ icon: Icon, label, variant = 'default' }) {
  const colors = {
    default: 'bg-surface-card text-gray-700 border-gray-200',
    accent: 'bg-primary-accent/10 text-primary-accent border-primary-accent/20',
    success: 'bg-status-success/10 text-status-success border-status-success/20',
    warning: 'bg-status-warning/10 text-yellow-700 border-status-warning/20',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${colors[variant]}`}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

function SpecCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg bg-surface-card p-3">
      <Icon className="h-5 w-5 text-primary-accent" />
      <p className="mt-1 text-xs text-secondary-muted">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function ListingDetailsPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryData, setInquiryData] = useState({ name: '', email: '', phone: '', message: '' });
  const [activeTab, setActiveTab] = useState('overview');

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', slug],
    queryFn: () => listingsAPI.getBySlug(slug).then(r => r.data),
  });

  const { data: similarListings } = useQuery({
    queryKey: ['similarListings', listing?.id],
    queryFn: () => listingsAPI.getSimilar(listing.id).then(r => r.data),
    enabled: !!listing?.id,
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
  const subtype = isVehicle ? SUBTYPE_LABELS[listing.vehicleSubtype] : SUBTYPE_LABELS[listing.realEstateSubtype];

  // Build highlights
  const highlights = [];
  if (isVehicle) {
    if (listing.negotiable) highlights.push({ label: 'Negotiable', icon: Tag, variant: 'accent' });
    if (listing.overallCondition === 'Excellent') highlights.push({ label: 'Excellent Condition', icon: ThumbsUp, variant: 'success' });
    else if (listing.overallCondition === 'Good') highlights.push({ label: 'Good Condition', icon: ThumbsUp, variant: 'success' });
    if (listing.accidentHistory === false) highlights.push({ label: 'No Accidents', icon: ShieldCheck, variant: 'success' });
    else if (listing.accidentHistory === true) highlights.push({ label: 'Accident History', icon: AlertTriangle, variant: 'warning' });
    if (listing.ownershipDetails?.registeredOwner) highlights.push({ label: 'Registered Owner', icon: Check, variant: 'success' });
    if (listing.ownershipDetails?.fullyPaid) highlights.push({ label: 'Fully Paid', icon: Check, variant: 'success' });
    if (listing.fuelType === 'Electric') highlights.push({ label: 'Electric', icon: Zap, variant: 'accent' });
    if (listing.fuelType === 'Hybrid') highlights.push({ label: 'Hybrid', icon: Zap, variant: 'accent' });
  }

  // Vehicle specs
  const overviewSpecs = isVehicle ? [
    listing.year && { icon: Calendar, label: 'Year', value: listing.year },
    listing.mileage != null && { icon: Gauge, label: 'Mileage', value: formatMileage(listing.mileage) },
    listing.fuelType && { icon: Fuel, label: 'Fuel Type', value: listing.fuelType },
    listing.transmission && { icon: Settings, label: 'Transmission', value: listing.transmission },
    listing.vehicleType?.name && { icon: Package, label: 'Body Type', value: listing.vehicleType.name },
    listing.color && { icon: Palette, label: 'Exterior Color', value: listing.color },
    listing.interiorColor && { icon: Palette, label: 'Interior Color', value: listing.interiorColor },
    listing.seats && { icon: Users, label: 'Seats', value: listing.seats },
    listing.engineCapacity && { icon: Settings, label: 'Engine Size', value: listing.engineCapacity + 'cc' },
    listing.engineType && { icon: Settings, label: 'Engine Type', value: listing.engineType },
    listing.drivetrain && { icon: Settings, label: 'Drivetrain', value: listing.drivetrain },
    listing.variant && { icon: Tag, label: 'Variant', value: listing.variant },
    listing.horsepower && { icon: Zap, label: 'Horsepower', value: listing.horsepower + ' HP' },
    listing.torque && { icon: Zap, label: 'Torque', value: listing.torque + ' Nm' },
    listing.fuelEconomy && { icon: Fuel, label: 'Fuel Economy', value: listing.fuelEconomy + ' km/L' },
    listing.topSpeed && { icon: Gauge, label: 'Top Speed', value: listing.topSpeed + ' km/h' },
  ].filter(Boolean) : [];

  // Real estate specs
  const realEstateSpecs = isRealEstate ? [
    listing.lotArea && { icon: Maximize, label: 'Lot Area', value: listing.lotArea + ' sqm' },
    listing.floorArea && { icon: Maximize, label: 'Floor Area', value: listing.floorArea + ' sqm' },
    listing.bedrooms != null && { icon: BedDouble, label: 'Bedrooms', value: listing.bedrooms },
    listing.bathrooms != null && { icon: Bath, label: 'Bathrooms', value: listing.bathrooms },
    listing.parkingSpaces != null && { icon: ParkingCircle, label: 'Parking', value: listing.parkingSpaces },
    listing.furnishingStatus && { icon: Sofa, label: 'Furnishing', value: listing.furnishingStatus.replace(/([A-Z])/g, ' $1').trim() },
    listing.propertyAge != null && { icon: Calendar, label: 'Property Age', value: listing.propertyAge + ' years' },
    listing.titleType && { icon: FileText, label: 'Title', value: listing.titleType },
  ].filter(Boolean) : [];

  // Features & Safety data
  const featureEntries = listing.features ? Object.entries(listing.features).filter(([, v]) => v) : [];
  const safetyEntries = listing.safetyFeatures ? Object.entries(listing.safetyFeatures).filter(([, v]) => v) : [];
  const condDetails = listing.conditionDetails || {};
  const ownDetails = listing.ownershipDetails || {};

  // Determine which vehicle tabs have content
  const visibleTabs = isVehicle ? VEHICLE_TABS.filter(tab => {
    if (tab.id === 'overview') return overviewSpecs.length > 0;
    if (tab.id === 'features') return featureEntries.length > 0;
    if (tab.id === 'safety') return safetyEntries.length > 0;
    if (tab.id === 'condition') return listing.overallCondition || Object.values(condDetails).some(Boolean);
    if (tab.id === 'ownership') return Object.keys(ownDetails).length > 0;
    return false;
  }) : [];

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
          <><span>/</span><span>{listing.brand.name}</span></>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2">
          <ImageGallery images={listing.images} />

          {/* Title + Actions */}
          <div className="mt-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-secondary-muted">
                <MapPin className="h-4 w-4" /> {listing.city}
                {listing.condition && <><span>&#8226;</span><span>{listing.condition}</span></>}
                {subtype && <><span>&#8226;</span><span>{subtype}</span></>}
              </div>
            </div>
            <div className="flex gap-2">
              {isAuthenticated && (
                <button onClick={() => toggleFavMutation.mutate()}
                  className="rounded-lg border border-gray-200 p-2.5 hover:bg-surface-card transition-colors">
                  <Heart className={`h-5 w-5 ${listing.isFavorited ? 'fill-status-error text-status-error' : 'text-gray-400'}`} />
                </button>
              )}
              <button className="rounded-lg border border-gray-200 p-2.5 hover:bg-surface-card transition-colors"
                onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                <Share2 className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary-accent">{formatPrice(listing.price)}</span>
            {listing.negotiable && <span className="text-sm text-status-success font-medium">Negotiable</span>}
          </div>

          {/* Quick Highlights */}
          {highlights.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {highlights.map((h, i) => <HighlightBadge key={i} {...h} />)}
            </div>
          )}

          {/* ═══ VEHICLE: Tabbed Specs ═══ */}
          {isVehicle && visibleTabs.length > 0 && (
            <div className="mt-8">
              <div className="flex gap-1 overflow-x-auto border-b">
                {visibleTabs.map(tab => (
                  <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-primary-accent text-primary-accent' : 'border-transparent text-secondary-muted hover:text-gray-700'}`}>
                    <tab.icon className="h-4 w-4" /> {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {overviewSpecs.map(spec => <SpecCard key={spec.label} {...spec} />)}
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {featureEntries.map(([key]) => (
                      <div key={key} className="flex items-center gap-2 rounded-lg bg-surface-card px-3 py-2.5 text-sm text-gray-700">
                        <Check className="h-4 w-4 text-primary-accent" />
                        {FEATURE_LABELS[key] || key}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'safety' && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {safetyEntries.map(([key]) => (
                      <div key={key} className="flex items-center gap-2 rounded-lg bg-status-success/5 px-3 py-2.5 text-sm text-gray-700">
                        <ShieldCheck className="h-4 w-4 text-status-success" />
                        {SAFETY_LABELS[key] || key}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'condition' && (
                  <div className="space-y-4">
                    {listing.overallCondition && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-secondary-muted">Overall:</span>
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${listing.overallCondition === 'Excellent' ? 'bg-status-success/10 text-status-success' : listing.overallCondition === 'Good' ? 'bg-primary-accent/10 text-primary-accent' : listing.overallCondition === 'Fair' ? 'bg-status-warning/10 text-yellow-700' : 'bg-status-error/10 text-status-error'}`}>
                          {listing.overallCondition}
                        </span>
                      </div>
                    )}
                    {listing.previousOwners != null && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-secondary-muted">Previous Owners:</span>
                        <span className="font-medium text-gray-900">{listing.previousOwners}</span>
                      </div>
                    )}
                    {listing.accidentHistory != null && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-secondary-muted">Accident History:</span>
                        <span className={`flex items-center gap-1 font-medium ${listing.accidentHistory ? 'text-status-warning' : 'text-status-success'}`}>
                          {listing.accidentHistory ? <><AlertTriangle className="h-4 w-4" /> Yes</> : <><ShieldCheck className="h-4 w-4" /> No</>}
                        </span>
                      </div>
                    )}
                    {Object.entries(condDetails).filter(([,v]) => v).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3 text-sm">
                        <span className="text-secondary-muted capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'ownership' && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {Object.entries(ownDetails).map(([key, value]) => (
                      <div key={key} className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${value ? 'border-status-success/30 bg-status-success/5 text-gray-700' : 'border-gray-200 bg-gray-50 text-secondary-muted'}`}>
                        {value ? <Check className="h-4 w-4 text-status-success" /> : <XIcon className="h-4 w-4 text-gray-400" />}
                        {OWNERSHIP_LABELS[key] || key}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ REAL ESTATE: Specs Grid ═══ */}
          {isRealEstate && realEstateSpecs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">Property Details</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {realEstateSpecs.map(spec => <SpecCard key={spec.label} {...spec} />)}
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

          {/* Reason for Selling */}
          {listing.reasonForSelling && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">Reason for Selling</h2>
              <p className="mt-2 text-sm text-gray-700">{listing.reasonForSelling}</p>
            </div>
          )}

          {/* Selling Details */}
          {listing.sellingDetails?.viewingAvailability && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">Viewing Availability</h2>
              <p className="mt-2 text-sm text-gray-700">{listing.sellingDetails.viewingAvailability}</p>
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">Description</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">{listing.description}</p>
            </div>
          )}

          {/* ═══ Similar Listings ═══ */}
          {similarListings && similarListings.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-gray-900">Similar Listings</h2>
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                {similarListings.map(item => (
                  <Link key={item.id} to={`/listings/${item.slug}`}
                    className="min-w-[220px] max-w-[220px] shrink-0 rounded-xl border bg-surface-light shadow-sm transition-shadow hover:shadow-md">
                    <div className="h-36 overflow-hidden rounded-t-xl bg-gray-100">
                      {item.images?.[0] ? (
                        <img src={item.images[0].url} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-300"><Package className="h-10 w-10" /></div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="mt-0.5 text-xs text-secondary-muted">{item.city}</p>
                      <p className="mt-1 text-sm font-bold text-primary-accent">{formatPrice(item.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
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
                  <a href={`tel:${listing.seller.phone}`} className="btn-primary mt-4 flex w-full items-center justify-center gap-2">
                    <Phone className="h-4 w-4" /> Call Seller
                  </a>
                )}
              </div>
            )}

            {/* Inquiry Form */}
            <div className="rounded-xl border bg-surface-light p-6">
              <h3 className="text-lg font-semibold text-gray-900">Interested?</h3>
              <p className="mt-1 text-sm text-secondary-muted">Send an inquiry - no account needed.</p>

              {inquiryMutation.isSuccess ? (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-status-success bg-status-success/10 px-4 py-3 text-sm font-medium text-status-success">
                  <CheckCircle className="h-4 w-4" /> Inquiry sent! We'll be in touch.
                </div>
              ) : showInquiryForm ? (
                <div className="mt-4 space-y-3">
                  <input type="text" placeholder="Your Name *" value={inquiryData.name}
                    onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  <input type="email" placeholder="Your Email *" value={inquiryData.email}
                    onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  <input type="tel" placeholder="Phone (optional)" value={inquiryData.phone}
                    onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  <textarea value={inquiryData.message} onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                    placeholder="Add a message (optional)..." rows={3}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  <div className="flex gap-2">
                    <button onClick={() => inquiryMutation.mutate(inquiryData)}
                      disabled={inquiryMutation.isPending || !inquiryData.name || !inquiryData.email}
                      className="btn-primary flex flex-1 items-center justify-center gap-2 disabled:opacity-50">
                      <Send className="h-4 w-4" /> {inquiryMutation.isPending ? 'Sending...' : 'Send Inquiry'}
                    </button>
                    <button onClick={() => setShowInquiryForm(false)} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
                  </div>
                  {inquiryMutation.isError && (
                    <p className="text-xs text-status-error">{inquiryMutation.error?.response?.data?.error || 'Failed to send.'}</p>
                  )}
                </div>
              ) : (
                <button onClick={() => setShowInquiryForm(true)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-status-success px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-status-success/90">
                  <Send className="h-4 w-4" /> I'm Interested
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