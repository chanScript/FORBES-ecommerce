import { useState } from 'react';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { applicationsAPI } from '../../api/cars';

export default function ApplyNowModal({ isOpen, onClose, serviceType }) {
  const [form, setForm] = useState({ fullName: '', email: '', address: '' });
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
      await applicationsAPI.create({ ...form, serviceType });
      setSuccess(true);
      setForm({ fullName: '', email: '', address: '' });
    } catch (err) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    setForm({ fullName: '', email: '', address: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div
        className="w-full max-w-md rounded-xl bg-surface-light p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Apply Now</h3>
          <button onClick={handleClose} className="rounded p-1 hover:bg-surface-card">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <p className="mt-1 text-sm text-secondary-muted">
          {serviceType?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </p>

        {success ? (
          <div className="mt-6 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-status-success" />
            <h4 className="mt-3 text-lg font-semibold text-gray-900">Application Submitted!</h4>
            <p className="mt-1 text-sm text-secondary-muted">
              We&apos;ll contact you shortly. Check your email for confirmation.
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
              <label htmlFor="applyFullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="applyFullName"
                name="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none"
                placeholder="Juan Dela Cruz"
              />
            </div>
            <div>
              <label htmlFor="applyEmail" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="applyEmail"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none"
                placeholder="juan@email.com"
              />
            </div>
            <div>
              <label htmlFor="applyAddress" className="block text-sm font-medium text-gray-700">
                Complete Address
              </label>
              <textarea
                id="applyAddress"
                name="address"
                required
                rows={3}
                value={form.address}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-accent focus:outline-none"
                placeholder="House/Unit No., Street, Barangay, City, Province"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex w-full items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
