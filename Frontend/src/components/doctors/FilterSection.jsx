import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, X, Star } from 'lucide-react';
import { SPECIALTIES, AVAILABILITY_OPTIONS, RATING_OPTIONS, EXPERIENCE_RANGES } from '../../utils/constants';

const FilterSection = ({ filters, setFilters }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ specialty: '', availability: '', rating: '', experience: '' });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  return (
    <div className="card p-6">
      <div className="flex-between mb-5">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
          <SlidersHorizontal className="h-4.5 w-4.5 text-primary-600" /> Filters
        </h3>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors hover:text-primary-800"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="text-slate-400 transition-colors hover:text-slate-600 lg:hidden"
            aria-label="Toggle filters"
          >
            <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <div className={`space-y-5 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Specialty</label>
          <select
            value={filters.specialty}
            onChange={(e) => handleFilterChange('specialty', e.target.value)}
            className="select input"
          >
            {SPECIALTIES.map((specialty) => (
              <option key={specialty} value={specialty === 'All Specialties' ? '' : specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Availability</label>
          <select
            value={filters.availability}
            onChange={(e) => handleFilterChange('availability', e.target.value)}
            className="select input"
          >
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option} value={option === 'All' ? '' : option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Minimum Rating</label>
          <select
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
            className="select input"
          >
            {RATING_OPTIONS.map((option) => (
              <option key={option} value={option === 'All' ? '' : option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Experience (Years)</label>
          <div className="grid grid-cols-2 gap-2">
            {EXPERIENCE_RANGES.map((range) => {
              const active = filters.experience === range;
              return (
                <button
                  key={range}
                  onClick={() => handleFilterChange('experience', active ? '' : range)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                    active
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {range}
                </button>
              );
            })}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
            <p className="mb-2 text-xs font-medium text-slate-500">Active filters</p>
            <div className="flex flex-wrap gap-1.5">
              {filters.specialty && <span className="badge badge-primary">{filters.specialty}</span>}
              {filters.availability && <span className="badge badge-success">{filters.availability}</span>}
              {filters.rating && (
                <span className="badge badge-warning">
                  <Star className="h-3 w-3 fill-current" /> {filters.rating}
                </span>
              )}
              {filters.experience && <span className="badge badge-info">{filters.experience} yrs</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSection;