import { Link } from 'react-router-dom';
import { Heart, MapPin, Fuel, Gauge, Calendar } from 'lucide-react';
import { formatPrice, formatMileage, optimizeCloudinaryUrl } from '../../utils/helpers';

export default function CarCard({ car, onToggleFavorite, isFavorited }) {
  const primaryImage = car.images?.[0]?.url;
  const optimizedImage = primaryImage ? optimizeCloudinaryUrl(primaryImage, 400) : null;

  return (
    <div className="card group">
      {/* Image */}
      <Link to={`/cars/${car.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-gray-100">
        {optimizedImage ? (
          <img
            src={optimizedImage}
            alt={car.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-200 text-gray-400">
            <span className="text-sm">No Image</span>
          </div>
        )}

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(car.id);
            }}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-md transition-colors hover:bg-white"
          >
            <Heart
              className={`h-4 w-4 ${isFavorited ? 'fill-status-error text-status-error' : 'text-gray-400'}`}
            />
          </button>
        )}

        {/* Condition Badge */}
        {car.condition === 'New' && (
          <span className="absolute left-3 top-3 rounded-full bg-status-success px-2.5 py-0.5 text-xs font-semibold text-white">
            New
          </span>
        )}
      </Link>

      {/* Details */}
      <div className="p-4">
        <Link to={`/cars/${car.slug}`}>
          <h3 className="text-base font-semibold text-gray-900 transition-colors hover:text-primary-accent line-clamp-1">
            {car.title}
          </h3>
        </Link>

        {/* Specs Row */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary-muted">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {car.year}
          </span>
          <span className="flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" /> {formatMileage(car.mileage)}
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" /> {car.fuelType}
          </span>
          <span>{car.transmission}</span>
        </div>

        {/* Location */}
        <div className="mt-2 flex items-center gap-1 text-xs text-secondary-muted">
          <MapPin className="h-3.5 w-3.5" /> {car.city}
        </div>

        {/* Price */}
        <div className="mt-3 flex items-end justify-between">
          <span className="text-lg font-bold text-primary-accent">{formatPrice(car.price)}</span>
          <Link
            to={`/cars/${car.slug}`}
            className="text-xs font-semibold text-primary-blue hover:underline"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
