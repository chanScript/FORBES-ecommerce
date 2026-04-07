import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { filtersAPI, brandsAPI } from '../../api/cars';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';

export default function FilterSidebar({ filters, onFilterChange, onReset }) {
  const isVehicle = !filters.category || filters.category === 'Vehicle';
  const isRealEstate = filters.category === 'RealEstate';

  const [expandedSections, setExpandedSections] = useState({
    brand: true,
    vehicleType: true,
    price: true,
    year: false,
    fuelType: false,
    transmission: false,
    city: false,
  });

  const { data: filterOptions } = useQuery({
    queryKey: ['filterOptions'],
    queryFn: () => filtersAPI.getOptions().then(r => r.data),
  });

  const [selectedBrandSlug, setSelectedBrandSlug] = useState(null);

  const { data: brandModels } = useQuery({
    queryKey: ['brandModels', selectedBrandSlug],
    queryFn: () => brandsAPI.getModels(selectedBrandSlug).then(r => r.data),
    enabled: !!selectedBrandSlug,
  });

  useEffect(() => {
    if (filters.brand && filterOptions) {
      const brand = filterOptions.brands?.find(b => b.slug === filters.brand || b.id === Number(filters.brand));
      setSelectedBrandSlug(brand?.slug || filters.brand || null);
    } else {
      setSelectedBrandSlug(null);
    }
  }, [filters.brand, filterOptions]);

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value, ...(key === 'brand' ? { model: '' } : {}) });
  };

  const activeCount = Object.entries(filters)
    .filter(([k]) => !['category', 'vehicleSubtype', 'realEstateSubtype'].includes(k))
    .filter(([, v]) => v !== '' && v !== undefined).length;

  if (!filterOptions) return null;

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="rounded-xl border bg-surface-light p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="rounded-full bg-primary-accent px-2 py-0.5 text-xs text-white">
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button onClick={onReset} className="text-xs font-medium text-primary-accent hover:underline">
              Clear All
            </button>
          )}
        </div>

        <p className="mb-4 text-xs text-secondary-muted">
          {(filterOptions.totalCount || 0).toLocaleString()} listings available
        </p>

        {/* Vehicle-specific filters */}
        {isVehicle && (
          <>
            {/* Brand Filter */}
            <FilterSection title="Brand" expanded={expandedSections.brand} onToggle={() => toggleSection('brand')}>
              <select
                value={filters.brand || ''}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
              >
                <option value="">All Brands</option>
                {filterOptions.brands?.map((b) => (
                  <option key={b.id} value={b.slug}>
                    {b.name} ({b._count?.listings ?? b._count?.cars ?? 0})
                  </option>
                ))}
              </select>

              {selectedBrandSlug && brandModels && (
                <select
                  value={filters.model || ''}
                  onChange={(e) => handleChange('model', e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
                >
                  <option value="">All Models</option>
                  {brandModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m._count?.listings ?? m._count?.cars ?? 0})
                    </option>
                  ))}
                </select>
              )}
            </FilterSection>

            {/* Vehicle Type */}
            <FilterSection title="Body Type" expanded={expandedSections.vehicleType} onToggle={() => toggleSection('vehicleType')}>
              <select
                value={filters.vehicleType || ''}
                onChange={(e) => handleChange('vehicleType', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
              >
                <option value="">All Types</option>
                {filterOptions.vehicleTypes?.map((vt) => (
                  <option key={vt.id} value={vt.slug}>
                    {vt.name} ({vt._count?.listings ?? vt._count?.cars ?? 0})
                  </option>
                ))}
              </select>
            </FilterSection>

            {/* Year */}
            <FilterSection title="Year" expanded={expandedSections.year} onToggle={() => toggleSection('year')}>
              <div className="flex gap-2">
                <input type="number" placeholder="From" value={filters.minYear || ''} onChange={(e) => handleChange('minYear', e.target.value)} className="w-1/2 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
                <input type="number" placeholder="To" value={filters.maxYear || ''} onChange={(e) => handleChange('maxYear', e.target.value)} className="w-1/2 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
              </div>
            </FilterSection>

            {/* Fuel Type */}
            <FilterSection title="Fuel Type" expanded={expandedSections.fuelType} onToggle={() => toggleSection('fuelType')}>
              <select value={filters.fuelType || ''} onChange={(e) => handleChange('fuelType', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent">
                <option value="">All Fuel Types</option>
                {filterOptions.fuelTypes?.map((f) => (
                  <option key={f.name} value={f.name}>{f.name} ({f.count})</option>
                ))}
              </select>
            </FilterSection>

            {/* Transmission */}
            <FilterSection title="Transmission" expanded={expandedSections.transmission} onToggle={() => toggleSection('transmission')}>
              <select value={filters.transmission || ''} onChange={(e) => handleChange('transmission', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent">
                <option value="">All</option>
                {filterOptions.transmissions?.map((t) => (
                  <option key={t.name} value={t.name}>{t.name} ({t.count})</option>
                ))}
              </select>
            </FilterSection>
          </>
        )}

        {/* Price Range (always shown) */}
        <FilterSection title="Price Range" expanded={expandedSections.price} onToggle={() => toggleSection('price')}>
          <div className="flex gap-2">
            <input type="number" placeholder="Min" value={filters.minPrice || ''} onChange={(e) => handleChange('minPrice', e.target.value)} className="w-1/2 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
            <input type="number" placeholder="Max" value={filters.maxPrice || ''} onChange={(e) => handleChange('maxPrice', e.target.value)} className="w-1/2 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent" />
          </div>
        </FilterSection>

        {/* City (always shown) */}
        <FilterSection title="City" expanded={expandedSections.city} onToggle={() => toggleSection('city')}>
          <select value={filters.city || ''} onChange={(e) => handleChange('city', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent">
            <option value="">All Cities</option>
            {filterOptions.cities?.slice(0, 30).map((c) => (
              <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
            ))}
          </select>
        </FilterSection>
      </div>
    </aside>
  );
}

function FilterSection({ title, expanded, onToggle, children }) {
  return (
    <div className="border-t border-gray-100 py-3">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between text-sm font-medium text-gray-700"
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && <div className="mt-2">{children}</div>}
    </div>
  );
}
