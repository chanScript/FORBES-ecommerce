import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { filtersAPI } from '../api/cars';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Car, Search, DollarSign } from 'lucide-react';

const BUDGET_RANGES = [
  { label: 'Under ₱300K', min: '', max: '300000' },
  { label: '₱300K – ₱500K', min: '300000', max: '500000' },
  { label: '₱500K – ₱1M', min: '500000', max: '1000000' },
  { label: '₱1M – ₱2M', min: '1000000', max: '2000000' },
  { label: '₱2M – ₱5M', min: '2000000', max: '5000000' },
  { label: 'Above ₱5M', min: '5000000', max: '' },
];

export default function VehicleLandingPage() {
  const navigate = useNavigate();
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedBudget, setSelectedBudget] = useState(null);

  const { data: filterOptions, isLoading } = useQuery({
    queryKey: ['filterOptions'],
    queryFn: () => filtersAPI.getOptions().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const handleBrowse = () => {
    const params = new URLSearchParams({ category: 'Vehicle' });
    if (selectedBrand) params.set('brand', selectedBrand);
    if (selectedBudget) {
      if (selectedBudget.min) params.set('minPrice', selectedBudget.min);
      if (selectedBudget.max) params.set('maxPrice', selectedBudget.max);
    }
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-primary-header text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center lg:py-24">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-on-dark/20">
            <Car className="h-8 w-8 text-primary-on-dark" />
          </div>
          <h1 className="text-3xl font-bold lg:text-4xl">Vehicle Marketplace</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            Find your perfect vehicle. Browse thousands of cars, motorcycles, and trucks from trusted sellers.
          </p>
        </div>
      </section>

      {/* Selection */}
      <section className="mx-auto max-w-4xl px-4 py-12 lg:py-16">
        {isLoading ? (
          <LoadingSpinner className="h-64" />
        ) : (
          <div className="space-y-10">
            {/* Brand Selection */}
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Search className="h-5 w-5 text-primary-accent" /> Select a Brand
              </h2>
              <p className="mt-1 text-sm text-secondary-muted">Choose a brand or skip to see all vehicles</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedBrand('')}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    selectedBrand === ''
                      ? 'border-primary-accent bg-primary-accent text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-accent hover:text-primary-accent'
                  }`}
                >
                  All Brands
                </button>
                {filterOptions?.brands?.map((brand) => (
                  <button
                    key={brand.slug}
                    onClick={() => setSelectedBrand(brand.slug)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      selectedBrand === brand.slug
                        ? 'border-primary-accent bg-primary-accent text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-accent hover:text-primary-accent'
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Selection */}
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <DollarSign className="h-5 w-5 text-primary-accent" /> Select Budget Range
              </h2>
              <p className="mt-1 text-sm text-secondary-muted">Choose a budget range or skip to see all prices</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <button
                  onClick={() => setSelectedBudget(null)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                    !selectedBudget
                      ? 'border-primary-accent bg-primary-accent text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-accent hover:text-primary-accent'
                  }`}
                >
                  Any Budget
                </button>
                {BUDGET_RANGES.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => setSelectedBudget(range)}
                    className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                      selectedBudget?.label === range.label
                        ? 'border-primary-accent bg-primary-accent text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-accent hover:text-primary-accent'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Browse Button */}
            <div className="text-center">
              <button
                onClick={handleBrowse}
                className="btn-primary inline-flex items-center gap-2 !px-10 !py-3 text-lg"
              >
                <Search className="h-5 w-5" /> Browse Vehicles
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
