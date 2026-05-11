import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl border bg-surface-light p-8 shadow-sm">
          <div className="mb-6 text-center">
            <UserPlus className="mx-auto h-10 w-10 text-primary-accent" />
            <h1 className="mt-3 text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="mt-1 text-sm text-secondary-muted">Join the marketplace</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-status-error/10 px-4 py-3 text-sm text-status-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone (optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
              />
              <p className="mt-1 text-xs text-secondary-muted">At least 8 characters</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-secondary-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-accent hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
