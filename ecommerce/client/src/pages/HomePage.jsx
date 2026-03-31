import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carsAPI, favoritesAPI } from '../api/cars';
import { useAuth } from '../context/AuthContext';
import CarGrid from '../components/cars/CarGrid';
import CarCardSkeleton from '../components/ui/CarCardSkeleton';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import FilterSidebar from '../components/filters/FilterSidebar';
import SearchBar from '../components/filters/SearchBar';
import SortDropdown from '../components/filters/SortDropdown';
import Pagination from '../components/ui/Pagination';
import { SlidersHorizontal, X } from 'lucide-react';

const DEFAULT_FILTERS = {
  brand: '',
  model: '',
  vehicleType: '',
  minPrice: '',
  maxPrice: '',
  minYear: '',
  maxYear: '',
  fuelType: '',
  transmission: '',
  city: '',
  search: '',
};

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  // Build query params (strip empty values)
  const queryParams = {
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')),
    sort,
    page,
    limit: 12,
  };

  // Fetch cars
  const { data, isLoading } = useQuery({
    queryKey: ['cars', queryParams],
    queryFn: () => carsAPI.list(queryParams).then(r => r.data),
    placeholderData: (prev) => prev,
  });

  // Fetch favorites (if logged in)
  const { data: favoritesData } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesAPI.list().then(r => r.data),
    enabled: isAuthenticated,
  });

  const favoritedIds = favoritesData?.map(f => f.carId) || [];

  // Toggle favorite mutation
  const toggleFavMutation = useMutation({
    mutationFn: (carId) => {
      if (favoritedIds.includes(carId)) {
        return favoritesAPI.remove(carId);
      }
      return favoritesAPI.add(carId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleToggleFavorite = useCallback((carId) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    toggleFavMutation.mutate(carId);
  }, [isAuthenticated, toggleFavMutation]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cars for Sale</h1>
        <p className="mt-1 text-sm text-secondary-muted">
          {data?.pagination?.total?.toLocaleString() || 0} cars available
        </p>
      </div>

      {/* Search + Sort Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-lg">
          <SearchBar value={filters.search} onSearch={handleSearch} />
        </div>
        <div className="flex items-center gap-3">
          <SortDropdown value={sort} onChange={(v) => { setSort(v); setPage(1); }} />
          <button
            onClick={() => setMobileSidebar(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebar && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebar(false)} />
            <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-surface-light p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg font-semibold">Filters</span>
                <button onClick={() => setMobileSidebar(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterSidebar filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />
            </div>
          </div>
        )}

        {/* Car Grid */}
        <div className="flex-1">
          <ErrorBoundary>
          {isLoading ? (
            <CarCardSkeleton count={6} />
          ) : (
            <>
              <CarGrid
                cars={data?.data || []}
                onToggleFavorite={handleToggleFavorite}
                favoritedIds={favoritedIds}
              />
              {data?.pagination && (
                <div className="mt-8">
                  <Pagination
                    page={data.pagination.page}
                    totalPages={data.pagination.totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
