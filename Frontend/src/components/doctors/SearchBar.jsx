import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import Input from '../ui/Input';

const SearchBar = ({ searchQuery, setSearchQuery, onSearch }) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debouncedQuery = useDebounce(localQuery, 300);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setSearchQuery(debouncedQuery);
    if (onSearch) onSearch(debouncedQuery);
  }, [debouncedQuery, setSearchQuery, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(localQuery);
    if (onSearch) onSearch(localQuery);
  };

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    if (onSearch) onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search by name, specialty, hospital, or location…"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          icon={<Search className="h-4.5 w-4.5" />}
          className="pr-10"
        />
        {localQuery && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 md:ml-4 md:justify-between md:flex-row md:items-center md:flex-1">
        <p className="text-sm text-slate-500 dark:text-slate-400 md:hidden">
          Try name, specialty, hospital, location, or profession.
        </p>
        <button type="submit" className="btn btn-primary whitespace-nowrap">
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;