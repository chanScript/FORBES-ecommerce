import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingsAPI, brandsAPI, modelsAPI, vehicleTypesAPI } from '../api/cars';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ManageableSelect from '../components/ui/ManageableSelect';
import { Upload, X, AlertCircle } from 'lucide-react';

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

const INITIAL_FORM = {
  category: 'Vehicle',
  vehicleSubtype: 'Car',
  realEstateSubtype: 'HouseAndLot',
  // Vehicle fields
  brandId: '', modelId: '', vehicleTypeId: '', year: new Date().getFullYear(),
  mileage: '', fuelType: 'Gasoline', transmission: 'Automatic',
  color: '', seats: '', engineCapacity: '',
  // Real estate fields
  lotArea: '', floorArea: '', bedrooms: '', bathrooms: '', parkingSpaces: '',
  furnishingStatus: 'Unfurnished', propertyAge: '', titleType: '',
  // Shared
  price: '', condition: 'Used', city: '', description: '',
};

export default function SellerSubmitPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [error, setError] = useState('');

  const isVehicle = form.category === 'Vehicle';
  const isRealEstate = form.category === 'RealEstate';

  // Fetch reference data (vehicle-specific)
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsAPI.list().then(r => r.data),
    enabled: isVehicle,
  });

  const { data: vehicleTypes } = useQuery({
    queryKey: ['vehicleTypes'],
    queryFn: () => vehicleTypesAPI.list().then(r => r.data),
    enabled: isVehicle,
  });

  const { data: models } = useQuery({
    queryKey: ['models', form.brandId],
    queryFn: () => modelsAPI.list(form.brandId).then(r => r.data),
    enabled: isVehicle && !!form.brandId,
  });

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
        brandId: editListing.brandId || '',
        modelId: editListing.modelId || '',
        vehicleTypeId: editListing.vehicleTypeId || '',
        year: editListing.year || new Date().getFullYear(),
        mileage: editListing.mileage || '',
        fuelType: editListing.fuelType || 'Gasoline',
        transmission: editListing.transmission || 'Automatic',
        color: editListing.color || '',
        seats: editListing.seats || '',
        engineCapacity: editListing.engineCapacity || '',
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
    };

    if (isVehicle) {
      payload.vehicleSubtype = form.vehicleSubtype;
      payload.brandId = form.brandId || undefined;
      payload.modelId = form.modelId || undefined;
      payload.vehicleTypeId = form.vehicleTypeId || undefined;
      payload.year = parseInt(form.year);
      payload.mileage = parseInt(form.mileage);
      payload.fuelType = form.fuelType;
      payload.transmission = form.transmission;
      payload.color = form.color || null;
      payload.seats = form.seats ? parseInt(form.seats) : null;
      payload.engineCapacity = form.engineCapacity ? parseInt(form.engineCapacity) : null;
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
            <div className="grid gap-4 sm:grid-cols-3">
              <ManageableSelect label="Brand" required value={form.brandId} options={brands || []} placeholder="Select Brand"
                onChange={(v) => setForm({ ...form, brandId: v, modelId: '' })}
                onCreate={async (name) => { await brandsAPI.create(name); queryClient.invalidateQueries({ queryKey: ['brands'] }); }}
                onDelete={async (id) => { await brandsAPI.delete(id); queryClient.invalidateQueries({ queryKey: ['brands'] }); }}
              />
              <ManageableSelect label="Model" required disabled={!form.brandId} value={form.modelId} options={models || []} placeholder="Select Model"
                onChange={(v) => setForm({ ...form, modelId: v })}
                onCreate={async (name) => { await modelsAPI.create(name, parseInt(form.brandId, 10)); queryClient.invalidateQueries({ queryKey: ['models', form.brandId] }); }}
                onDelete={async (id) => { await modelsAPI.delete(id); queryClient.invalidateQueries({ queryKey: ['models', form.brandId] }); }}
              />
              <ManageableSelect label="Body Type" required value={form.vehicleTypeId} options={vehicleTypes || []} placeholder="Select Type"
                onChange={(v) => setForm({ ...form, vehicleTypeId: v })}
                onCreate={async (name) => { await vehicleTypesAPI.create(name); queryClient.invalidateQueries({ queryKey: ['vehicleTypes'] }); }}
                onDelete={async (id) => { await vehicleTypesAPI.delete(id); queryClient.invalidateQueries({ queryKey: ['vehicleTypes'] }); }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
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
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Engine (cc)</label>
                <input type="number" min={0} value={form.engineCapacity}
                  onChange={(e) => setForm({ ...form, engineCapacity: e.target.value })} className={inputCls} />
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Color</label>
                <input type="text" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Seats</label>
                <input type="number" min={1} max={20} value={form.seats}
                  onChange={(e) => setForm({ ...form, seats: e.target.value })} className={inputCls} />
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
