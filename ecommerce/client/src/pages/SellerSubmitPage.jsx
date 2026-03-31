import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carsAPI, brandsAPI, modelsAPI, vehicleTypesAPI } from '../api/cars';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ManageableSelect from '../components/ui/ManageableSelect';
import { Upload, X, AlertCircle } from 'lucide-react';

const FUEL_TYPES = ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'LPG'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'];
const CONDITIONS = ['New', 'Used', 'Certified Pre-Owned'];

const INITIAL_FORM = {
  brandId: '', modelId: '', vehicleTypeId: '', year: new Date().getFullYear(),
  price: '', mileage: '', fuelType: 'Gasoline', transmission: 'Automatic',
  condition: 'Used', color: '', seats: '', engineCapacity: '',
  city: '', description: '',
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

  // Fetch reference data
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsAPI.list().then(r => r.data),
  });

  const { data: vehicleTypes } = useQuery({
    queryKey: ['vehicleTypes'],
    queryFn: () => vehicleTypesAPI.list().then(r => r.data),
  });

  const { data: models } = useQuery({
    queryKey: ['models', form.brandId],
    queryFn: () => modelsAPI.list(form.brandId).then(r => r.data),
    enabled: !!form.brandId,
  });

  // If editing, load existing car
  const { data: editCar, isLoading: editLoading } = useQuery({
    queryKey: ['editCar', editId],
    queryFn: () => carsAPI.myListings().then(r => r.data.data.find(c => c.id === editId)),
    enabled: !!editId,
  });

  useEffect(() => {
    if (editCar) {
      setForm({
        brandId: editCar.brandId || '',
        modelId: editCar.modelId || '',
        vehicleTypeId: editCar.vehicleTypeId || '',
        year: editCar.year,
        price: editCar.price,
        mileage: editCar.mileage,
        fuelType: editCar.fuelType,
        transmission: editCar.transmission,
        condition: editCar.condition,
        color: editCar.color || '',
        seats: editCar.seats || '',
        engineCapacity: editCar.engineCapacity || '',
        city: editCar.city || '',
        description: editCar.description || '',
      });
      setExistingImages(editCar.images || []);
    }
  }, [editCar]);

  // Submit car
  const submitMutation = useMutation({
    mutationFn: async (payload) => {
      let car;
      if (editId) {
        car = (await carsAPI.update(editId, payload)).data;
      } else {
        car = (await carsAPI.create(payload)).data;
      }
      // Upload new images if any
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((img) => formData.append('images', img));
        await carsAPI.uploadImages(car.id, formData);
      }
      return car;
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
      if (editId) await carsAPI.deleteImage(editId, imageId);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch {
      setError('Failed to delete image.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      year: parseInt(form.year),
      price: parseFloat(form.price),
      mileage: parseInt(form.mileage),
      seats: form.seats ? parseInt(form.seats) : null,
      engineCapacity: form.engineCapacity ? parseInt(form.engineCapacity) : null,
    };
    submitMutation.mutate(payload);
  };

  if (editId && editLoading) return <LoadingSpinner size="lg" className="h-96" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">
        {editId ? 'Edit Listing' : 'Submit a Car'}
      </h1>
      <p className="mt-1 text-sm text-secondary-muted">
        {editId ? 'Update your listing details.' : 'Fill in the details below to list your car.'}
      </p>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-status-error/10 px-4 py-3 text-sm text-status-error">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Brand + Model + Type */}
        <div className="grid gap-4 sm:grid-cols-3">
          <ManageableSelect
            label="Brand"
            required
            value={form.brandId}
            options={brands || []}
            placeholder="Select Brand"
            onChange={(v) => setForm({ ...form, brandId: v, modelId: '' })}
            onCreate={async (name) => {
              await brandsAPI.create(name);
              queryClient.invalidateQueries({ queryKey: ['brands'] });
            }}
            onDelete={async (id) => {
              await brandsAPI.delete(id);
              queryClient.invalidateQueries({ queryKey: ['brands'] });
            }}
          />
          <ManageableSelect
            label="Model"
            required
            disabled={!form.brandId}
            value={form.modelId}
            options={models || []}
            placeholder="Select Model"
            onChange={(v) => setForm({ ...form, modelId: v })}
            onCreate={async (name) => {
              await modelsAPI.create(name, parseInt(form.brandId, 10));
              queryClient.invalidateQueries({ queryKey: ['models', form.brandId] });
            }}
            onDelete={async (id) => {
              await modelsAPI.delete(id);
              queryClient.invalidateQueries({ queryKey: ['models', form.brandId] });
            }}
          />
          <ManageableSelect
            label="Body Type"
            required
            value={form.vehicleTypeId}
            options={vehicleTypes || []}
            placeholder="Select Type"
            onChange={(v) => setForm({ ...form, vehicleTypeId: v })}
            onCreate={async (name) => {
              await vehicleTypesAPI.create(name);
              queryClient.invalidateQueries({ queryKey: ['vehicleTypes'] });
            }}
            onDelete={async (id) => {
              await vehicleTypesAPI.delete(id);
              queryClient.invalidateQueries({ queryKey: ['vehicleTypes'] });
            }}
          />
        </div>

        {/* Year, Price, Mileage */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Year *</label>
            <input
              type="number"
              required
              min={1990}
              max={new Date().getFullYear() + 1}
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Price (₱) *</label>
            <input
              type="number"
              required
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Mileage (km) *</label>
            <input
              type="number"
              required
              min={0}
              value={form.mileage}
              onChange={(e) => setForm({ ...form, mileage: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
            />
          </div>
        </div>

        {/* Fuel, Transmission, Condition */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Fuel Type *</label>
            <select
              required
              value={form.fuelType}
              onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
            >
              {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Transmission *</label>
            <select
              required
              value={form.transmission}
              onChange={(e) => setForm({ ...form, transmission: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
            >
              {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Condition *</label>
            <select
              required
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
            >
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Color, Seats, Engine */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Color</label>
            <input
              type="text"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Seats</label>
            <input
              type="number"
              min={1}
              max={20}
              value={form.seats}
              onChange={(e) => setForm({ ...form, seats: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Engine (cc)</label>
            <input
              type="number"
              min={0}
              value={form.engineCapacity}
              onChange={(e) => setForm({ ...form, engineCapacity: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
            />
          </div>
        </div>

        {/* City */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">City *</label>
          <input
            type="text"
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
          />
        </div>

        {/* Images */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Photos ({existingImages.length + images.length}/10)
          </label>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-3">
              {existingImages.map((img) => (
                <div key={img.id} className="group relative h-24 w-32 overflow-hidden rounded-lg">
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingImage(img.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New Images Preview */}
          {images.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="group relative h-24 w-32 overflow-hidden rounded-lg">
                  <img src={URL.createObjectURL(img)} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Area */}
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-primary-accent">
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-secondary-muted">Click to upload photos</span>
            <span className="text-xs text-gray-400">JPG, PNG, WebP (max 5MB each)</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
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
