import CarCard from './CarCard';

export default function CarGrid({ cars, onToggleFavorite, favoritedIds = [] }) {
  if (!cars || cars.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
        <p className="text-secondary-muted">No cars found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {cars.map((car) => (
        <CarCard
          key={car.id}
          car={car}
          onToggleFavorite={onToggleFavorite}
          isFavorited={favoritedIds.includes(car.id)}
        />
      ))}
    </div>
  );
}
