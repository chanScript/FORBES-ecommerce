import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, X, Check } from 'lucide-react';

/**
 * A select dropdown with inline Add / Remove capabilities.
 *
 * Props:
 *  - label          (string)   — field label
 *  - required       (boolean)
 *  - disabled       (boolean)
 *  - value          (string|number) — selected id
 *  - options        (array)    — [{ id, name }]
 *  - placeholder    (string)   — e.g. "Select Brand"
 *  - onChange        (fn)      — receives the new id (string)
 *  - onCreate       (fn)      — async (name) => newItem  — called when user adds
 *  - onDelete       (fn)      — async (id) => void       — called when user removes
 *  - isCreating     (boolean)
 */
export default function ManageableSelect({
  label,
  required = false,
  disabled = false,
  value,
  options = [],
  placeholder = 'Select…',
  onChange,
  onCreate,
  onDelete,
  isCreating = false,
}) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus();
  }, [adding]);

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setError('');
    try {
      await onCreate(trimmed);
      setNewName('');
      setAdding(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
    if (e.key === 'Escape') { setAdding(false); setNewName(''); setError(''); }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await onDelete(id);
      if (String(value) === String(id)) onChange('');
    } catch (err) {
      setError(err.response?.data?.error || 'Cannot delete — it may have associated listings.');
    }
  };

  return (
    <div>
      <label className="mb-1 flex items-center justify-between text-sm font-medium text-gray-700">
        <span>{label} {required && '*'}</span>
        {onCreate && !disabled && (
          <button
            type="button"
            onClick={() => setAdding(!adding)}
            className="flex items-center gap-1 text-xs font-semibold text-primary-accent hover:underline"
          >
            {adding ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            {adding ? 'Cancel' : 'Add New'}
          </button>
        )}
      </label>

      {/* Inline add form */}
      {adding && (
        <div className="mb-2 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`New ${label.replace(' *', '')} name…`}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={isCreating || !newName.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-accent text-white hover:bg-primary-accent/90 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <p className="mb-1 text-xs text-status-error">{error}</p>
      )}

      {/* Select dropdown */}
      <div className="relative">
        <select
          required={required}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-8 text-sm focus:border-primary-accent focus:outline-none focus:ring-1 focus:ring-primary-accent disabled:opacity-50"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>

      {/* Deletable list below select */}
      {onDelete && options.length > 0 && !disabled && (
        <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-gray-100 bg-surface-card">
          {options.filter((opt) => String(opt.id) !== String(value)).map((opt) => (
            <div
              key={opt.id}
              className="flex items-center justify-between px-3 py-1.5 text-sm"
            >
              <span
                className="flex-1 cursor-pointer truncate hover:text-primary-accent"
                onClick={() => onChange(String(opt.id))}
              >
                {opt.name}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(opt.id)}
                className="ml-2 flex-shrink-0 rounded p-1 text-gray-400 hover:bg-status-error/10 hover:text-status-error"
                title={`Remove ${opt.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
