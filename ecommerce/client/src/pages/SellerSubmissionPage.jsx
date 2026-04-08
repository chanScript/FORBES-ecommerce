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
      formData.append('propertyDetails', form.propertyDetails);
      if (form.price) formData.append('price', form.price);
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
          onClick={() => { setSuccess(false); setForm({ fullName: '', email: '', phone: '', category: '', vehicleSubtype: '', realEstateSubtype: '', propertyDetails: '', price: '' }); setImages([]); setDocuments([]); }}
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

        {/* Property Details */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Property Details *</label>
          <p className="mb-2 text-xs text-secondary-muted">
            Describe your property — include brand/model/year for vehicles, or location/size/features for real estate.
          </p>
          <textarea
            required
            rows={6}
            value={form.propertyDetails}
            onChange={(e) => setForm({ ...form, propertyDetails: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
          />
        </div>

        {/* Asking Price */}
        <div className="max-w-xs">
          <label className="mb-1 block text-sm font-medium text-gray-700">Asking Price (₱)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="Optional"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
          />
        </div>

        {/* Images */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Photos ({images.length}/10)
          </label>

          {images.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="group relative h-24 w-32 overflow-hidden rounded-lg">
                  <img src={URL.createObjectURL(img)} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
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
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* Documents */}
        <div>
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

        {/* Submit */}
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
