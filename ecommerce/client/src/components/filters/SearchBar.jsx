import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ value, onSearch }) {
  const [input, setInput] = useState(value || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(input.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-muted" />
      <input
        type="text"
        placeholder="Search cars by brand, model, or keyword..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-20 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-primary-accent px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
      >
        Search
      </button>
    </form>
  );
}
