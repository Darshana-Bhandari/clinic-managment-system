import React, { useState, useEffect } from 'react';
import Input from '../ui/Input';

const SearchBar = ({ searchQuery, setSearchQuery, onSearch }) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

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
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <Input
          type="text"
          placeholder="Search by name, specialty, or location..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          icon="🔍"
          className="pr-12"
        />
        {localQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
      
      <button
        type="submit"
        className="btn btn-primary whitespace-nowrap"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;