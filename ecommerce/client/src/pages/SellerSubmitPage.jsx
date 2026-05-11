import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingsAPI } from '../api/cars';
import { documentsAPI } from '../api/documents';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Upload, X, AlertCircle, FileText } from 'lucide-react';

const FUEL_TYPES = ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'LPG'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'];
const CONDITIONS = ['New', 'Used'];
const VEHICLE_SUBTYPES = [
  { value: 'Car', label: 'Car' },
  { value: 'Motorcycle', label: 'Motorcycle' },
  { value: 'Truck', label: 'Truck' },
];
const REAL_ESTATE_SUBTYPES = [
  { value: 'HouseAndLot', label: 'House & Lot' },
  { value: 'VacantLot', label: 'Vacant Lot' },
  { value: 'CommercialProperty', label: 'Commercial Property' },
];
const FURNISHING_OPTIONS = ['Unfurnished', 'SemiFurnished', 'FullyFurnished'];
const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD'];
const BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Coupe', 'Wagon', 'Truck', 'MPV', 'Crossover'];
const OVERALL_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'];

const FEATURE_OPTIONS = [
  { key: 'infotainment', label: 'Touchscreen / Infotainment' },
  { key: 'soundSystem', label: 'Premium Sound System' },
  { key: 'navigation', label: 'Navigation / GPS' },
  { key: 'bluetooth', label: 'Bluetooth / USB / AUX' },
  { key: 'keylessEntry', label: 'Keyless Entry / Push Start' },
  { key: 'cruiseControl', label: 'Cruise Control' },
  { key: 'climateControl', label: 'Climate Control' },
  { key: 'powerWindows', label: 'Power Windows' },
  { key: 'powerSeats', label: 'Power Seats' },
  { key: 'sunroof', label: 'Sunroof / Moonroof' },
];

const SAFETY_OPTIONS = [
  { key: 'airbags', label: 'Airbags (Front / Side / Curtain)' },
  { key: 'abs', label: 'ABS (Anti-lock Braking)' },
  { key: 'ebd', label: 'EBD (Electronic Brake Distribution)' },
  { key: 'tractionControl', label: 'Traction Control' },
  { key: 'stabilityControl', label: 'Stability Control' },
  { key: 'parkingSensors', label: 'Parking Sensors (Front / Rear)' },
  { key: 'reverseCamera', label: 'Reverse Camera' },
  { key: 'camera360', label: '360 Camera' },
  { key: 'blindSpot', label: 'Blind Spot Monitoring' },
  { key: 'laneDeparture', label: 'Lane Departure Warning' },
  { key: 'adaptiveCruise', label: 'Adaptive Cruise Control' },
  { key: 'alarm', label: 'Alarm / Immobilizer' },
];

const OWNERSHIP_OPTIONS = [
  { key: 'registeredOwner', label: 'Registered Owner' },
  { key: 'orCrAvailable', label: 'OR/CR Available' },
  { key: 'fullyPaid', label: 'Fully Paid' },
  { key: 'withEncumbrance', label: 'With Encumbrance / Loan' },
  { key: 'openDeedOfSale', label: 'Open Deed of Sale' },
];

const INITIAL_FORM = {
  category: 'Vehicle',
  vehicleSubtype: 'Car',
  realEstateSubtype: 'HouseAndLot',
  // Vehicle fields
  brand: '', model: '', bodyType: '', year: new Date().getFullYear(),
  mileage: '', fuelType: 'Gasoline', transmission: 'Automatic',
  color: '', seats: '', engineCapacity: '',
  engineType: '', horsepower: '', torque: '', fuelEconomy: '', topSpeed: '',
  variant: '', interiorColor: '', drivetrain: '', plateNumber: '', vinNumber: '',
  features: {}, safetyFeatures: {},
  overallCondition: '', accidentHistory: '', serviceHistoryAvailable: '',
  previousOwners: '', lastMaintenanceDate: '', tiresCondition: '', knownIssues: '',
  ownershipDetails: {},
  // Real estate fields
  lotArea: '', floorArea: '', bedrooms: '', bathrooms: '', parkingSpaces: '',
  furnishingStatus: 'Unfurnished', propertyAge: '', titleType: '',
  // Shared
  price: '', condition: 'Used', city: '', description: '',
  negotiable: false, reasonForSelling: '', viewingAvailability: '',
};

export default function SellerSubmitPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');

  const isVehicle = form.category === 'Vehicle';
  const isRealEstate = form.category === 'RealEstate';

  // If editing, load existing listing
  const { data: editListing, isLoading: editLoading } = useQuery({
    queryKey: ['editListing', editId],
    queryFn: () => listingsAPI.myListings().then(r => r.data.data.find(c => c.id === editId)),
    enabled: !!editId,
  });

  useEffect(() => {
    if (editListing) {
      setForm({
        category: editListing.category || 'Vehicle',
        vehicleSubtype: editListing.vehicleSubtype || 'Car',
        realEstateSubtype: editListing.realEstateSubtype || 'HouseAndLot',
        brand: editListing.brand || '',
        model: editListing.model || '',
        bodyType: editListing.bodyType || '',
        year: editListing.year || new Date().getFullYear(),
        mileage: editListing.mileage || '',
        fuelType: editListing.fuelType || 'Gasoline',
        transmission: editListing.transmission || 'Automatic',
        color: editListing.color || '',
        seats: editListing.seats || '',
        engineCapacity: editListing.engineCapacity || '',
        engineType: editListing.engineType || '',
        horsepower: editListing.horsepower || '',
        torque: editListing.torque || '',
        fuelEconomy: editListing.fuelEconomy || '',
        topSpeed: editListing.topSpeed || '',
        variant: editListing.variant || '',
        interiorColor: editListing.interiorColor || '',
        drivetrain: editListing.drivetrain || '',
        plateNumber: editListing.plateNumber || '',
        vinNumber: editListing.vinNumber || '',
        features: editListing.features || {},
        safetyFeatures: editListing.safetyFeatures || {},
        overallCondition: editListing.overallCondition || '',
        accidentHistory: editListing.accidentHistory != null ? editListing.accidentHistory : '',
        serviceHistoryAvailable: editListing.serviceHistoryAvailable != null ? editListing.serviceHistoryAvailable : '',
        previousOwners: editListing.previousOwners ?? '',
        lastMaintenanceDate: editListing.lastMaintenanceDate || '',
        tiresCondition: editListing.tiresCondition || '',
        knownIssues: editListing.knownIssues || '',
        ownershipDetails: editListing.ownershipDetails || {},
        lotArea: editListing.lotArea || '',
        floorArea: editListing.floorArea || '',
        bedrooms: editListing.bedrooms || '',
        bathrooms: editListing.bathrooms || '',
        parkingSpaces: editListing.parkingSpaces || '',
        furnishingStatus: editListing.furnishingStatus || 'Unfurnished',
        propertyAge: editListing.propertyAge || '',
        titleType: editListing.titleType || '',
        price: editListing.price,
        condition: editListing.condition || 'Used',
        city: editListing.city || '',
        description: editListing.description || '',
        negotiable: editListing.negotiable || false,
        reasonForSelling: editListing.reasonForSelling || '',
        viewingAvailability: editListing.viewingAvailability || '',
      });
      setExistingImages(editListing.images || []);
    }
  }, [editListing]);

  const submitMutation = useMutation({
    mutationFn: async (payload) => {
      let listing;
      if (editId) {
        listing = (await listingsAPI.update(editId, payload)).data;
      } else {
        listing = (await listingsAPI.create(payload)).data;
      }
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((img) => formData.append('images', img));
        await listingsAPI.uploadImages(listing.id, formData);
      }
      if (documents.length > 0) {
        await documentsAPI.uploadForListing(listing.id, documents);
      }
      return listing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      navigate('/seller/dashboard');
    },
    onError: (err) => {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Submission failed.');
    },
  });

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + images.length + files.length;
    if (totalImages > 10) {
      setError('Maximum 10 images per listing.');
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeNewImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  const handleDocSelect = (e) => {
    const files = Array.from(e.target.files);
    if (documents.length + files.length > 5) {
      setError('Maximum 5 documents per listing.');
      return;
    }
    setDocuments(prev => [...prev, ...files]);
  };

  const removeDoc = (idx) => setDocuments(prev => prev.filter((_, i) => i !== idx));

  const handleDeleteExistingImage = async (imageId) => {
    try {
      if (editId) await listingsAPI.deleteImage(editId, imageId);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch {
      setError('Failed to delete image.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      category: form.category,
      price: parseFloat(form.price),
      condition: form.condition,
      city: form.city,
      description: form.description,
      negotiable: form.negotiable,
      reasonForSelling: form.reasonForSelling || null,
      viewingAvailability: form.viewingAvailability || null,
    };

    if (isVehicle) {
      payload.vehicleSubtype = form.vehicleSubtype;
      payload.brand = form.brand || null;
      payload.model = form.model || null;
      payload.bodyType = form.bodyType || null;
      payload.year = parseInt(form.year);
      payload.mileage = parseInt(form.mileage);
      payload.fuelType = form.fuelType;
      payload.transmission = form.transmission;
      payload.color = form.color || null;
      payload.seats = form.seats ? parseInt(form.seats) : null;
      payload.engineCapacity = form.engineCapacity ? parseInt(form.engineCapacity) : null;
      payload.engineType = form.engineType || null;
      payload.horsepower = form.horsepower ? parseInt(form.horsepower) : null;
      payload.torque = form.torque ? parseInt(form.torque) : null;
      payload.fuelEconomy = form.fuelEconomy ? parseFloat(form.fuelEconomy) : null;
      payload.topSpeed = form.topSpeed ? parseInt(form.topSpeed) : null;
      payload.variant = form.variant || null;
      payload.interiorColor = form.interiorColor || null;
      payload.drivetrain = form.drivetrain || null;
      payload.plateNumber = form.plateNumber || null;
      payload.vinNumber = form.vinNumber || null;
      payload.features = Object.keys(form.features).length > 0 ? form.features : null;
      payload.safetyFeatures = Object.keys(form.safetyFeatures).length > 0 ? form.safetyFeatures : null;
      payload.overallCondition = form.overallCondition || null;
      payload.accidentHistory = form.accidentHistory !== '' ? form.accidentHistory : null;
      payload.serviceHistoryAvailable = form.serviceHistoryAvailable !== '' ? form.serviceHistoryAvailable : null;
      payload.previousOwners = form.previousOwners ? parseInt(form.previousOwners) : null;
      payload.lastMaintenanceDate = form.lastMaintenanceDate || null;
      payload.tiresCondition = form.tiresCondition || null;
      payload.knownIssues = form.knownIssues || null;
      payload.ownershipDetails = Object.keys(form.ownershipDetails).length > 0 ? form.ownershipDetails : null;
    } else {
      payload.realEstateSubtype = form.realEstateSubtype;
      payload.lotArea = form.lotArea ? parseFloat(form.lotArea) : null;
      payload.floorArea = form.floorArea ? parseFloat(form.floorArea) : null;
      payload.bedrooms = form.bedrooms ? parseInt(form.bedrooms) : null;
      payload.bathrooms = form.bathrooms ? parseInt(form.bathrooms) : null;
      payload.parkingSpaces = form.parkingSpaces ? parseInt(form.parkingSpaces) : null;
      payload.furnishingStatus = form.furnishingStatus || null;
      payload.propertyAge = form.propertyAge ? parseInt(form.propertyAge) : null;
      payload.titleType = form.titleType || null;
    }

    submitMutation.mutate(payload);
  };

  if (editId && editLoading) return <LoadingSpinner size="lg" className="h-96" />;

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent';

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">
        {editId ? 'Edit Listing' : 'New Listing'}
      </h1>
      <p className="mt-1 text-sm text-secondary-muted">
        {editId ? 'Update your listing details.' : 'Fill in the details below to create a listing.'}
      </p>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-status-error/10 px-4 py-3 text-sm text-status-error">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Category Selection */}
        {!editId && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Category *</label>
            <div className="flex gap-3">
              {[{ value: 'Vehicle', label: 'Vehicle' }, { value: 'RealEstate', label: 'Real Estate' }].map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat.value })}
                  className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${form.category === cat.value ? 'border-primary-accent bg-primary-accent/5 text-primary-accent' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subtype */}
        {!editId && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {isVehicle ? 'Vehicle Type' : 'Property Type'} *
            </label>
            <div className="flex flex-wrap gap-2">
              {(isVehicle ? VEHICLE_SUBTYPES : REAL_ESTATE_SUBTYPES).map(sub => (
                <button
                  key={sub.value}
                  type="button"
                  onClick={() => setForm({ ...form, [isVehicle ? 'vehicleSubtype' : 'realEstateSubtype']: sub.value })}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${(isVehicle ? form.vehicleSubtype : form.realEstateSubtype) === sub.value ? 'border-primary-accent bg-primary-accent text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========== VEHICLE FIELDS ========== */}
        {isVehicle && (
          <>
            {/* ── Basic Vehicle Information ── */}
            <div className="border-t pt-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Basic Vehicle Information</h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Brand *</label>
                    <input type="text" required value={form.brand} placeholder="e.g. Toyota"
                      onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Model *</label>
                    <input type="text" required value={form.model} placeholder="e.g. Vios"
                      onChange={(e) => setForm({ ...form, model: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Variant / Trim</label>
                    <input type="text" value={form.variant} placeholder="e.g. Sport, LX, V"
                      onChange={(e) => setForm({ ...form, variant: e.target.value })} className={inputCls} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Body Type *</label>
                    <select required value={form.bodyType} onChange={(e) => setForm({ ...form, bodyType: e.target.value })} className={inputCls}>
                      <option value="">Select body type</option>
                      {BODY_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Year *</label>
                    <input type="number" required min={1990} max={new Date().getFullYear() + 1} value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Mileage (km) *</label>
                    <input type="number" required min={0} value={form.mileage}
                      onChange={(e) => setForm({ ...form, mileage: e.target.value })} className={inputCls} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Exterior Color</label>
                    <input type="text" value={form.color} placeholder="e.g. White"
                      onChange={(e) => setForm({ ...form, color: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Interior Color</label>
                    <input type="text" value={form.interiorColor} placeholder="e.g. Black"
                      onChange={(e) => setForm({ ...form, interiorColor: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Seats</label>
                    <input type="number" min={1} max={20} value={form.seats}
                      onChange={(e) => setForm({ ...form, seats: e.target.value })} className={inputCls} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Fuel Type *</label>
                    <select required value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} className={inputCls}>
                      {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Transmission *</label>
                    <select required value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })} className={inputCls}>
                      {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Drivetrain</label>
                    <select value={form.drivetrain} onChange={(e) => setForm({ ...form, drivetrain: e.target.value })} className={inputCls}>
                      <option value="">Select</option>
                      {DRIVETRAINS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Plate Number</label>
                    <input type="text" value={form.plateNumber} placeholder="e.g. ABC 1234"
                      onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">VIN / Chassis Number</label>
                    <input type="text" value={form.vinNumber} placeholder="Vehicle Identification Number"
                      onChange={(e) => setForm({ ...form, vinNumber: e.target.value })} className={inputCls} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Engine & Performance Specs ── */}
            <div className="border-t pt-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Engine & Performance</h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Engine Size (cc)</label>
                    <input type="number" min={0} value={form.engineCapacity}
                      onChange={(e) => setForm({ ...form, engineCapacity: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Engine Type</label>
                    <input type="text" value={form.engineType} placeholder="e.g. Inline-4, V6"
                      onChange={(e) => setForm({ ...form, engineType: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Horsepower (HP)</label>
                    <input type="number" min={0} value={form.horsepower}
                      onChange={(e) => setForm({ ...form, horsepower: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Torque (Nm)</label>
                    <input type="number" min={0} value={form.torque}
                      onChange={(e) => setForm({ ...form, torque: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Fuel Economy (km/L)</label>
                    <input type="number" min={0} step="0.1" value={form.fuelEconomy}
                      onChange={(e) => setForm({ ...form, fuelEconomy: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Top Speed (km/h)</label>
                    <input type="number" min={0} value={form.topSpeed}
                      onChange={(e) => setForm({ ...form, topSpeed: e.target.value })} className={inputCls} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Features & Technology ── */}
            <div className="border-t pt-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Features & Technology</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {FEATURE_OPTIONS.map(opt => (
                  <label key={opt.key} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${form.features[opt.key] ? 'border-primary-accent bg-primary-accent/5 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="checkbox" checked={!!form.features[opt.key]}
                      onChange={(e) => setForm({ ...form, features: { ...form.features, [opt.key]: e.target.checked } })}
                      className="h-4 w-4 rounded border-gray-300 text-primary-accent focus:ring-primary-accent" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* ── Safety Features ── */}
            <div className="border-t pt-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Safety Features</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SAFETY_OPTIONS.map(opt => (
                  <label key={opt.key} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${form.safetyFeatures[opt.key] ? 'border-status-success bg-status-success/5 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="checkbox" checked={!!form.safetyFeatures[opt.key]}
                      onChange={(e) => setForm({ ...form, safetyFeatures: { ...form.safetyFeatures, [opt.key]: e.target.checked } })}
                      className="h-4 w-4 rounded border-gray-300 text-status-success focus:ring-status-success" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* ── Condition & History ── */}
            <div className="border-t pt-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Condition & History</h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Overall Condition</label>
                    <select value={form.overallCondition} onChange={(e) => setForm({ ...form, overallCondition: e.target.value })} className={inputCls}>
                      <option value="">Select</option>
                      {OVERALL_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Accident History</label>
                    <select value={form.accidentHistory === '' ? '' : form.accidentHistory ? 'yes' : 'no'}
                      onChange={(e) => setForm({ ...form, accidentHistory: e.target.value === '' ? '' : e.target.value === 'yes' })} className={inputCls}>
                      <option value="">Select</option>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Service History Available</label>
                    <select value={form.serviceHistoryAvailable === '' ? '' : form.serviceHistoryAvailable ? 'yes' : 'no'}
                      onChange={(e) => setForm({ ...form, serviceHistoryAvailable: e.target.value === '' ? '' : e.target.value === 'yes' })} className={inputCls}>
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Previous Owners</label>
                    <input type="number" min={0} value={form.previousOwners}
                      onChange={(e) => setForm({ ...form, previousOwners: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Last Maintenance Date</label>
                    <input type="text" value={form.lastMaintenanceDate} placeholder="e.g. March 2026"
                      onChange={(e) => setForm({ ...form, lastMaintenanceDate: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Tires Condition</label>
                    <input type="text" value={form.tiresCondition} placeholder="e.g. Good, New, 80%"
                      onChange={(e) => setForm({ ...form, tiresCondition: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Known Issues</label>
                  <textarea rows={3} value={form.knownIssues} placeholder="Describe any known issues (if any)"
                    onChange={(e) => setForm({ ...form, knownIssues: e.target.value })} className={inputCls} />
                </div>
              </div>
            </div>

            {/* ── Ownership & Documents ── */}
            <div className="border-t pt-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Ownership & Documents</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {OWNERSHIP_OPTIONS.map(opt => (
                  <label key={opt.key} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${form.ownershipDetails[opt.key] ? 'border-primary-accent bg-primary-accent/5 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="checkbox" checked={!!form.ownershipDetails[opt.key]}
                      onChange={(e) => setForm({ ...form, ownershipDetails: { ...form.ownershipDetails, [opt.key]: e.target.checked } })}
                      className="h-4 w-4 rounded border-gray-300 text-primary-accent focus:ring-primary-accent" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ========== REAL ESTATE FIELDS ========== */}
        {isRealEstate && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Lot Area (sqm)</label>
                <input type="number" min={0} step="0.01" value={form.lotArea}
                  onChange={(e) => setForm({ ...form, lotArea: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Floor Area (sqm)</label>
                <input type="number" min={0} step="0.01" value={form.floorArea}
                  onChange={(e) => setForm({ ...form, floorArea: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Property Age (yrs)</label>
                <input type="number" min={0} value={form.propertyAge}
                  onChange={(e) => setForm({ ...form, propertyAge: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Bedrooms</label>
                <input type="number" min={0} value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Bathrooms</label>
                <input type="number" min={0} value={form.bathrooms}
                  onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Parking Spaces</label>
                <input type="number" min={0} value={form.parkingSpaces}
                  onChange={(e) => setForm({ ...form, parkingSpaces: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Furnishing</label>
                <select value={form.furnishingStatus} onChange={(e) => setForm({ ...form, furnishingStatus: e.target.value })} className={inputCls}>
                  {FURNISHING_OPTIONS.map(f => <option key={f} value={f}>{f.replace(/([A-Z])/g, ' $1').trim()}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title Type</label>
                <input type="text" placeholder="e.g. Clean Title, TCT, CCT" value={form.titleType}
                  onChange={(e) => setForm({ ...form, titleType: e.target.value })} className={inputCls} />
              </div>
            </div>
          </>
        )}

        {/* ========== SHARED FIELDS ========== */}
        <div className="border-t pt-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Pricing & Location</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Price (₱) *</label>
              <input type="number" required min={0} step="0.01" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Condition *</label>
              <select required value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className={inputCls}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">City *</label>
              <input type="text" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} />
            </div>
          </div>
        </div>

        {/* ── Selling Details ── */}
        <div className="border-t pt-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Selling Details</h2>
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={form.negotiable}
                onChange={(e) => setForm({ ...form, negotiable: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary-accent focus:ring-primary-accent" />
              <span className="text-sm font-medium text-gray-700">Price is Negotiable</span>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Reason for Selling</label>
                <input type="text" value={form.reasonForSelling} placeholder="e.g. Upgrading, Moving abroad"
                  onChange={(e) => setForm({ ...form, reasonForSelling: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Availability for Viewing</label>
                <input type="text" value={form.viewingAvailability} placeholder="e.g. Weekends only, Anytime"
                  onChange={(e) => setForm({ ...form, viewingAvailability: e.target.value })} className={inputCls} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
        </div>

        {/* Images */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Photos ({existingImages.length + images.length}/10)
          </label>

          {existingImages.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-3">
              {existingImages.map((img) => (
                <div key={img.id} className="group relative h-24 w-32 overflow-hidden rounded-lg">
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => handleDeleteExistingImage(img.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="group relative h-24 w-32 overflow-hidden rounded-lg">
                  <img src={URL.createObjectURL(img)} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => removeNewImage(idx)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-primary-accent">
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-secondary-muted">Click to upload photos</span>
            <span className="text-xs text-gray-400">JPG, PNG, WebP (max 5MB each)</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageSelect} className="hidden" />
          </label>
        </div>

        {/* Documents */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Documents ({documents.length}/5)
          </label>
          <p className="mb-3 text-xs text-secondary-muted">
            Upload supporting documents such as OR/CR, deed of sale, title, etc.
          </p>

          {documents.length > 0 && (
            <div className="mb-3 space-y-2">
              {documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                    <span className="text-xs text-secondary-muted flex-shrink-0">({(doc.size / 1024).toFixed(0)} KB)</span>
                  </div>
                  <button type="button" onClick={() => removeDoc(idx)} className="ml-2 rounded p-1 text-gray-400 hover:text-status-error">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-primary-accent">
            <FileText className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-secondary-muted">Click to upload documents</span>
            <span className="text-xs text-gray-400">PDF, JPG, PNG (max 10MB each)</span>
            <input type="file" accept=".pdf,image/jpeg,image/png,image/webp" multiple onChange={handleDocSelect} className="hidden" />
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t pt-6">
          <button type="submit" disabled={submitMutation.isPending} className="btn-primary disabled:opacity-50">
            {submitMutation.isPending ? 'Saving...' : editId ? 'Update Listing' : 'Submit Listing'}
          </button>
          <button type="button" onClick={() => navigate('/seller/dashboard')} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
