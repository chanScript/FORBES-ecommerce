import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { listingsAPI, favoritesAPI, filtersAPI } from '../api/cars';
import { useAuth } from '../context/AuthContext';
import CarGrid from '../components/cars/CarGrid';
import CarCardSkeleton from '../components/ui/CarCardSkeleton';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import FilterSidebar from '../components/filters/FilterSidebar';
import SearchBar from '../components/filters/SearchBar';
import SortDropdown from '../components/filters/SortDropdown';
import { SlidersHorizontal, X, Car, Truck, Home, Building2, LandPlot, Loader2 } from 'lucide-react';

const CATEGORY_TABS = [
  { key: '', label: 'All', icon: null },
  { key: 'Vehicle', label: 'Vehicles', icon: Car },
  { key: 'RealEstate', label: 'Real Estate', icon: Home },
];

const SUBTYPE_TABS = {
  Vehicle: [
    { key: '', label: 'All Vehicles' },
    { key: 'Car', label: 'Cars' },
    { key: 'Motorcycle', label: 'Motorcycles' },
    { key: 'Truck', label: 'Trucks' },
  ],
  RealEstate: [
    { key: '', label: 'All Properties' },
    { key: 'HouseAndLot', label: 'House & Lot' },
    { key: 'VacantLot', label: 'Vacant Lots' },
    { key: 'CommercialProperty', label: 'Commercial' },
  ],
};

const DEFAULT_FILTERS = {
  category: '',
  vehicleSubtype: '',
  realEstateSubtype: '',
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL search params (supports deep-linking from landing pages)
  const initialFilters = useMemo(() => {
    const f = { ...DEFAULT_FILTERS };
    const urlKeys = ['category', 'vehicleSubtype', 'realEstateSubtype', 'brand', 'model',
      'vehicleType', 'minPrice', 'maxPrice', 'minYear', 'maxYear', 'fuelType',
      'transmission', 'city', 'search'];
    for (const key of urlKeys) {
      const val = searchParams.get(key);
      if (val) f[key] = val;
    }
    return f;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);
  const [loadedPages, setLoadedPages] = useState([]);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  // Sync filters back to URL (skip empty values)
  useEffect(() => {
    const params = {};
    for (const [key, val] of Object.entries(filters)) {
      if (val) params[key] = val;
    }
    if (sort && sort !== 'newest') params.sort = sort;
    setSearchParams(params, { replace: true });
  }, [filters, sort, setSearchParams]);

  // Build query params (strip empty values)
  const queryParams = {
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')),
    sort,
    page,
    limit: 12,
  };

  // Fetch listings
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['listings', queryParams],
    queryFn: () => listingsAPI.list(queryParams).then(r => r.data),
    placeholderData: (prev) => prev,
  });

  // Accumulate pages for "Load More"
  const currentPageData = data?.data || [];
  const pagination = data?.pagination;

  // When data changes from a new page, accumulate 
  const allListings = useMemo(() => {
    if (page === 1) return currentPageData;
    // For subsequent pages, accumulate
    return [...loadedPages, ...currentPageData];
  }, [currentPageData, loadedPages, page]);

  const handleLoadMore = () => {
    if (pagination && page < pagination.totalPages) {
      setLoadedPages(allListings);
      setPage(prev => prev + 1);
    }
  };

  const hasMore = pagination && page < pagination.totalPages;

  // Fetch favorites (if logged in)
  const { data: favoritesData } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesAPI.list().then(r => r.data),
    enabled: isAuthenticated,
  });

  const favoritedIds = favoritesData?.map(f => f.listingId) || [];

  // Toggle favorite mutation
  const toggleFavMutation = useMutation({
    mutationFn: (listingId) => {
      if (favoritedIds.includes(listingId)) {
        return favoritesAPI.remove(listingId);
      }
      return favoritesAPI.add(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  // Fetch filter options (brands & vehicle types for quick nav)
  const { data: filterOptions } = useQuery({
    queryKey: ['filterOptions'],
    queryFn: () => filtersAPI.getOptions().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const handleToggleFavorite = useCallback((listingId) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    toggleFavMutation.mutate(listingId);
  }, [isAuthenticated, toggleFavMutation]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setLoadedPages([]);
  };

  const handleCategoryChange = (category) => {
    setFilters({ ...DEFAULT_FILTERS, category, search: filters.search });
    setPage(1);
    setLoadedPages([]);
  };

  const handleSubtypeChange = (subtype) => {
    if (filters.category === 'Vehicle') {
      setFilters({ ...filters, vehicleSubtype: subtype });
    } else if (filters.category === 'RealEstate') {
      setFilters({ ...filters, realEstateSubtype: subtype });
    }
    setPage(1);
    setLoadedPages([]);
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPage(1);
    setLoadedPages([]);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setSort('newest');
    setPage(1);
    setLoadedPages([]);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        <p className="mt-1 text-sm text-secondary-muted">
          {pagination?.total?.toLocaleString() || 0} listings available
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mb-6">
        <div className="flex gap-1 border-b">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleCategoryChange(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                filters.category === tab.key
                  ? 'border-b-2 border-primary-accent text-primary-accent'
                  : 'text-secondary-muted hover:text-gray-700'
              }`}
            >
              {tab.icon && <tab.icon className="h-4 w-4" />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Subtype pills */}
        {filters.category && SUBTYPE_TABS[filters.category] && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SUBTYPE_TABS[filters.category].map((sub) => {
              const activeSubtype = filters.category === 'Vehicle' ? filters.vehicleSubtype : filters.realEstateSubtype;
              return (
                <button
                  key={sub.key}
                  onClick={() => handleSubtypeChange(sub.key)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                    activeSubtype === sub.key
                      ? 'border-primary-accent bg-primary-accent text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-accent hover:text-primary-accent'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Search + Sort Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-lg">
          <SearchBar value={filters.search} onSearch={handleSearch} />
        </div>
        <div className="flex items-center gap-3">
          <SortDropdown value={sort} onChange={(v) => { setSort(v); setPage(1); setLoadedPages([]); }} />
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
          {isLoading && page === 1 ? (
            <CarCardSkeleton count={6} />
          ) : (
            <>
              <CarGrid
                cars={allListings}
                onToggleFavorite={handleToggleFavorite}
                favoritedIds={favoritedIds}
              />
              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isFetching}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-surface-light px-8 py-2.5 text-sm font-medium text-gray-700 transition hover:border-primary-accent hover:text-primary-accent disabled:opacity-50"
                  >
                    {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {isFetching ? 'Loading...' : 'Load More'}
                  </button>
                  <p className="mt-2 text-xs text-secondary-muted">
                    Showing {allListings.length} of {pagination?.total || 0} results
                  </p>
                </div>
              )}
              {!hasMore && allListings.length > 0 && (
                <p className="mt-8 text-center text-sm text-secondary-muted">
                  Showing all {allListings.length} results
                </p>
              )}
            </>
          )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
