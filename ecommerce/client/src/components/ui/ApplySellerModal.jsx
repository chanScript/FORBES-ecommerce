import { useState } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { sellerRequestsAPI } from '../../api/sellerRequests';

const PRODUCT_TYPES = [
  { value: 'Vehicle', label: 'Vehicle (Cars, Motorcycles, Trucks)' },
  { value: 'RealEstate', label: 'Real Estate (House & Lot, Commercial, Vacant Lot)' },
  { value: 'Both', label: 'Both Vehicle and Real Estate' },
];

export default function ApplySellerModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ productType: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const reason = `Product Type: ${form.productType}${form.reason ? ` | ${form.reason}` : ''}`;
      await sellerRequestsAPI.submit({ reason });
      setSuccess(true);
      setForm({ productType: '', reason: '' });
    } catch (err) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    setForm({ productType: '', reason: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div
        className="w-full max-w-md rounded-xl bg-surface-light p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <ShoppingBag className="h-5 w-5 text-primary-accent" /> Apply as Seller
          </h3>
          <button onClick={handleClose} className="rounded p-1 hover:bg-surface-card">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <p className="mt-1 text-sm text-secondary-muted">
          Submit your application to become a seller. An admin will review and approve your request.
        </p>

        {success ? (
          <div className="mt-6 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-status-success" />
            <h4 className="mt-3 text-lg font-semibold text-gray-900">Application Submitted!</h4>
            <p className="mt-1 text-sm text-secondary-muted">
              Your seller application is under review. You will be notified once it is approved.
            </p>
            <button onClick={handleClose} className="btn-primary mt-4">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-status-error/10 px-3 py-2 text-sm text-status-error">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <div>
              <label htmlFor="sellerProductType" className="block text-sm font-medium text-gray-700">
                What do you want to sell? *
              </label>
              <select
                id="sellerProductType"
                name="productType"
                required
                value={form.productType}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none"
              >
                <option value="">Select product type...</option>
                {PRODUCT_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sellerReason" className="block text-sm font-medium text-gray-700">
                Tell us about your business (optional)
              </label>
              <textarea
                id="sellerReason"
                name="reason"
                rows={3}
                value={form.reason}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none"
                placeholder="Describe what you plan to sell, your experience, etc."
              />
            </div>
            <button
              type="submit"
              disabled={loading || !form.productType}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-accent px-4 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
