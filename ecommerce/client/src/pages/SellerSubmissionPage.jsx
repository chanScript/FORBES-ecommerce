import { useState } from 'react';
import { submissionsAPI } from '../api/cars';
import { documentsAPI } from '../api/documents';
import { Upload, X, AlertCircle, CheckCircle, Send, FileText } from 'lucide-react';

const CATEGORIES = [
  { value: 'Vehicle', label: 'Vehicle', subtypes: [
    { value: 'Car', label: 'Car' },
    { value: 'Motorcycle', label: 'Motorcycle' },
    { value: 'Truck', label: 'Truck' },
  ]},
  { value: 'RealEstate', label: 'Real Estate', subtypes: [
    { value: 'HouseAndLot', label: 'House & Lot' },
    { value: 'VacantLot', label: 'Vacant Lot' },
    { value: 'CommercialProperty', label: 'Commercial Property' },
  ]},
];

const FUEL_TYPES = ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'LPG'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'];
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

const INITIAL_VEHICLE = {
  brand: '', model: '', variant: '', bodyType: '', year: new Date().getFullYear(),
  mileage: '', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: '',
  color: '', interiorColor: '', seats: '',
  engineCapacity: '', engineType: '', horsepower: '', torque: '', fuelEconomy: '', topSpeed: '',
  plateNumber: '', vinNumber: '',
  features: {}, safetyFeatures: {},
  overallCondition: '', accidentHistory: '', serviceHistoryAvailable: '',
  previousOwners: '', lastMaintenanceDate: '', tiresCondition: '', knownIssues: '',
  ownershipDetails: {},
  negotiable: false, reasonForSelling: '', viewingAvailability: '',
};

export default function SellerSubmissionPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    category: '',
    vehicleSubtype: '',
    realEstateSubtype: '',
    propertyDetails: '',
    price: '',
  });
  const [vehicle, setVehicle] = useState(INITIAL_VEHICLE);
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedCategory = CATEGORIES.find(c => c.value === form.category);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10) {
      setError('Maximum 10 images.');
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  const handleDocSelect = (e) => {
    const files = Array.from(e.target.files);
    if (documents.length + files.length > 5) {
      setError('Maximum 5 documents.');
      return;
    }
    setDocuments(prev => [...prev, ...files]);
  };

  const removeDoc = (idx) => setDocuments(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('category', form.category);
      if (form.category === 'Vehicle' && form.vehicleSubtype) {
        formData.append('vehicleSubtype', form.vehicleSubtype);
      }
      if (form.category === 'RealEstate' && form.realEstateSubtype) {
        formData.append('realEstateSubtype', form.realEstateSubtype);
      }
      if (form.propertyDetails) formData.append('propertyDetails', form.propertyDetails);
      if (form.price) formData.append('price', form.price);

      if (form.category === 'Vehicle') {
        formData.append('vehicleData', JSON.stringify(vehicle));
      }

      images.forEach((img) => formData.append('images', img));

      const res = await submissionsAPI.create(formData);
      if (documents.length > 0 && res.data?.id) {
        await documentsAPI.uploadForSubmission(res.data.id, documents);
      }
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-status-success" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Submission Received!</h1>
        <p className="mt-2 text-secondary-muted">
          Thank you for your submission. Our team will review it and get back to you at <strong>{form.email}</strong>.
        </p>
        <button
          onClick={() => { setSuccess(false); setForm({ fullName: '', email: '', phone: '', category: '', vehicleSubtype: '', realEstateSubtype: '', propertyDetails: '', price: '' }); setVehicle(INITIAL_VEHICLE); setImages([]); setDocuments([]); }}
          className="btn-primary mt-6"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Sell Your Property</h1>
      <p className="mt-1 text-sm text-secondary-muted">
        No account needed. Fill in the details below and our team will review your submission.
      </p>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-status-error/10 px-4 py-3 text-sm text-status-error">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Contact Info */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
              />
            </div>
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Property Category</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setForm({ ...form, category: cat.value, vehicleSubtype: '', realEstateSubtype: '' })}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  form.category === cat.value
                    ? 'border-primary-accent bg-primary-accent/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-900">{cat.label}</p>
                <p className="mt-1 text-xs text-secondary-muted">
                  {cat.subtypes.map(s => s.label).join(', ')}
                </p>
              </button>
            ))}
          </div>

          {/* Subtype */}
          {selectedCategory && (
            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Type *</label>
              <select
                required
                value={form.category === 'Vehicle' ? form.vehicleSubtype : form.realEstateSubtype}
                onChange={(e) => {
                  if (form.category === 'Vehicle') setForm({ ...form, vehicleSubtype: e.target.value });
                  else setForm({ ...form, realEstateSubtype: e.target.value });
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
              >
                <option value="">Select type...</option>
                {selectedCategory.subtypes.map((st) => (
                  <option key={st.value} value={st.value}>{st.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── Vehicle Details ── */}
        {form.category === 'Vehicle' && (
          <>
            {/* Basic Vehicle Information */}
            <div className="border-t pt-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Basic Vehicle Information</h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Brand *</label>
                    <input type="text" required value={vehicle.brand} placeholder="e.g. Toyota"
                      onChange={(e) => setVehicle({ ...vehicle, brand: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Model *</label>
                    <input type="text" required value={vehicle.model} placeholder="e.g. Vios"
                      onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Variant / Trim</label>
                    <input type="text" value={vehicle.variant} placeholder="e.g. Sport, LX, V"
                      onChange={(e) => setVehicle({ ...vehicle, variant: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Body Type *</label>
                    <select required value={vehicle.bodyType}
                      onChange={(e) => setVehicle({ ...vehicle, bodyType: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent">
                      <option value="">Select body type</option>
                      {BODY_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Year *</label>
                    <input type="number" required min={1990} max={new Date().getFullYear() + 1} value={vehicle.year}
                      onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Mileage (km) *</label>
                    <input type="number" required min={0} value={vehicle.mileage}
                      onChange={(e) => setVehicle({ ...vehicle, mileage: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Exterior Color</label>
                    <input type="text" value={vehicle.color} placeholder="e.g. White"
                      onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Interior Color</label>
                    <input type="text" value={vehicle.interiorColor} placeholder="e.g. Black"
                      onChange={(e) => setVehicle({ ...vehicle, interiorColor: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Seats</label>
                    <input type="number" min={1} max={20} value={vehicle.seats}
                      onChange={(e) => setVehicle({ ...vehicle, seats: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Fuel Type *</label>
                    <select required value={vehicle.fuelType}
                      onChange={(e) => setVehicle({ ...vehicle, fuelType: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent">
                      {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Transmission *</label>
                    <select required value={vehicle.transmission}
                      onChange={(e) => setVehicle({ ...vehicle, transmission: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent">
                      {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Drivetrain</label>
                    <select value={vehicle.drivetrain}
                      onChange={(e) => setVehicle({ ...vehicle, drivetrain: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent">
                      <option value="">Select</option>
                      {DRIVETRAINS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Plate Number</label>
                    <input type="text" value={vehicle.plateNumber} placeholder="e.g. ABC 1234"
                      onChange={(e) => setVehicle({ ...vehicle, plateNumber: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">VIN / Chassis Number</label>
                    <input type="text" value={vehicle.vinNumber} placeholder="Vehicle Identification Number"
                      onChange={(e) => setVehicle({ ...vehicle, vinNumber: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                </div>
              </div>
            </div>

            {/* Engine & Performance */}
            <div className="border-t pt-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Engine & Performance</h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Engine Size (cc)</label>
                    <input type="number" min={0} value={vehicle.engineCapacity}
                      onChange={(e) => setVehicle({ ...vehicle, engineCapacity: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Engine Type</label>
                    <input type="text" value={vehicle.engineType} placeholder="e.g. Inline-4, V6"
                      onChange={(e) => setVehicle({ ...vehicle, engineType: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Horsepower (HP)</label>
                    <input type="number" min={0} value={vehicle.horsepower}
                      onChange={(e) => setVehicle({ ...vehicle, horsepower: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Torque (Nm)</label>
                    <input type="number" min={0} value={vehicle.torque}
                      onChange={(e) => setVehicle({ ...vehicle, torque: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Fuel Economy (km/L)</label>
                    <input type="number" min={0} step="0.1" value={vehicle.fuelEconomy}
                      onChange={(e) => setVehicle({ ...vehicle, fuelEconomy: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Top Speed (km/h)</label>
                    <input type="number" min={0} value={vehicle.topSpeed}
                      onChange={(e) => setVehicle({ ...vehicle, topSpeed: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                </div>
              </div>
            </div>

            {/* Features & Technology */}
            <div className="border-t pt-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Features & Technology</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {FEATURE_OPTIONS.map(opt => (
                  <label key={opt.key} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${vehicle.features[opt.key] ? 'border-primary-accent bg-primary-accent/5 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="checkbox" checked={!!vehicle.features[opt.key]}
                      onChange={(e) => setVehicle({ ...vehicle, features: { ...vehicle.features, [opt.key]: e.target.checked } })}
                      className="h-4 w-4 rounded border-gray-300 text-primary-accent focus:ring-primary-accent" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Safety Features */}
            <div className="border-t pt-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Safety Features</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SAFETY_OPTIONS.map(opt => (
                  <label key={opt.key} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${vehicle.safetyFeatures[opt.key] ? 'border-status-success bg-status-success/5 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="checkbox" checked={!!vehicle.safetyFeatures[opt.key]}
                      onChange={(e) => setVehicle({ ...vehicle, safetyFeatures: { ...vehicle.safetyFeatures, [opt.key]: e.target.checked } })}
                      className="h-4 w-4 rounded border-gray-300 text-status-success focus:ring-status-success" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Condition & History */}
            <div className="border-t pt-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Condition & History</h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Overall Condition</label>
                    <select value={vehicle.overallCondition}
                      onChange={(e) => setVehicle({ ...vehicle, overallCondition: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent">
                      <option value="">Select</option>
                      {OVERALL_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Accident History</label>
                    <select value={vehicle.accidentHistory === '' ? '' : vehicle.accidentHistory ? 'yes' : 'no'}
                      onChange={(e) => setVehicle({ ...vehicle, accidentHistory: e.target.value === '' ? '' : e.target.value === 'yes' })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent">
                      <option value="">Select</option>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Service History Available</label>
                    <select value={vehicle.serviceHistoryAvailable === '' ? '' : vehicle.serviceHistoryAvailable ? 'yes' : 'no'}
                      onChange={(e) => setVehicle({ ...vehicle, serviceHistoryAvailable: e.target.value === '' ? '' : e.target.value === 'yes' })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent">
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Previous Owners</label>
                    <input type="number" min={0} value={vehicle.previousOwners}
                      onChange={(e) => setVehicle({ ...vehicle, previousOwners: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Last Maintenance Date</label>
                    <input type="text" value={vehicle.lastMaintenanceDate} placeholder="e.g. March 2026"
                      onChange={(e) => setVehicle({ ...vehicle, lastMaintenanceDate: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Tires Condition</label>
                    <input type="text" value={vehicle.tiresCondition} placeholder="e.g. Good, New, 80%"
                      onChange={(e) => setVehicle({ ...vehicle, tiresCondition: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Known Issues</label>
                  <textarea rows={3} value={vehicle.knownIssues} placeholder="Describe any known issues (if any)"
                    onChange={(e) => setVehicle({ ...vehicle, knownIssues: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                </div>
              </div>
            </div>

            {/* Ownership & Documents */}
            <div className="border-t pt-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Ownership & Documents</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {OWNERSHIP_OPTIONS.map(opt => (
                  <label key={opt.key} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${vehicle.ownershipDetails[opt.key] ? 'border-primary-accent bg-primary-accent/5 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="checkbox" checked={!!vehicle.ownershipDetails[opt.key]}
                      onChange={(e) => setVehicle({ ...vehicle, ownershipDetails: { ...vehicle.ownershipDetails, [opt.key]: e.target.checked } })}
                      className="h-4 w-4 rounded border-gray-300 text-primary-accent focus:ring-primary-accent" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Selling Details */}
            <div className="border-t pt-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Selling Details</h2>
              <div className="space-y-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={vehicle.negotiable}
                    onChange={(e) => setVehicle({ ...vehicle, negotiable: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary-accent focus:ring-primary-accent" />
                  <span className="text-sm font-medium text-gray-700">Price is Negotiable</span>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Reason for Selling</label>
                    <input type="text" value={vehicle.reasonForSelling} placeholder="e.g. Upgrading, Moving abroad"
                      onChange={(e) => setVehicle({ ...vehicle, reasonForSelling: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Availability for Viewing</label>
                    <input type="text" value={vehicle.viewingAvailability} placeholder="e.g. Weekends only, Anytime"
                      onChange={(e) => setVehicle({ ...vehicle, viewingAvailability: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Real Estate / General Description ── */}
        {form.category === 'RealEstate' && (
          <div className="border-t pt-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">Property Details *</label>
            <p className="mb-2 text-xs text-secondary-muted">
              Describe your property — include location, size, features, and any important notes.
            </p>
            <textarea required rows={6} value={form.propertyDetails}
              onChange={(e) => setForm({ ...form, propertyDetails: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
          </div>
        )}

        {/* ── Asking Price ── */}
        {form.category && (
          <div className="border-t pt-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Asking Price</h2>
            <div className="max-w-xs">
              <label className="mb-1 block text-sm font-medium text-gray-700">Price (₱)</label>
              <input type="number" min={0} step="0.01" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Optional"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
            </div>
          </div>
        )}

        {/* ── Photos ── */}
        {form.category && (
          <div className="border-t pt-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Photos ({images.length}/10)
            </label>

            {images.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="group relative h-24 w-32 overflow-hidden rounded-lg">
                    <img src={URL.createObjectURL(img)} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)}
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
        )}

        {/* ── Documents ── */}
        {form.category && (
          <div className="border-t pt-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Documents ({documents.length}/5)
            </label>
            <p className="mb-3 text-xs text-secondary-muted">
              Upload supporting documents such as OR/CR, deed of sale, title, etc. (optional)
            </p>

            {documents.length > 0 && (
              <div className="mb-3 space-y-2">
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span className="truncate text-sm text-gray-700">{doc.name}</span>
                      <span className="flex-shrink-0 text-xs text-secondary-muted">({(doc.size / 1024).toFixed(0)} KB)</span>
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
        )}

        {/* ── Submit ── */}
        <div className="border-t pt-6">
          <button
            type="submit"
            disabled={submitting || !form.category}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
