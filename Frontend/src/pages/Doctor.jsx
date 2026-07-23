import React, { useState } from 'react';
import SearchBar from '../components/doctors/SearchBar';
import FilterSection from '../components/doctors/FilterSection';
import DoctorsList from '../components/doctors/DoctorList';

const Doctor = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    specialty: '',
    availability: '',
    rating: '',
    experience: '',
  });

  return (
    <div className="bg-slate-50 dark:bg-slate-950 py-10">
      <div className="container-custom relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-10 rounded-[2rem] bg-white px-6 py-10 shadow-lg ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-700/60 sm:px-10 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary-600 dark:text-primary-400">
              Doctor Search
            </p>
            <h1 className="mt-5 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
              Find the right doctor with faster search and better filters
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
              Search by name, specialty, hospital, location, or profession. Then refine results with availability,
              rating, and experience filters for a cleaner doctor discovery experience.
            </p>
          </div>
        </section>

        <section className="card mb-10 p-5 sm:p-6">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </section>

        <div className="flex flex-col gap-10 lg:flex-row">
          <aside className="w-full flex-shrink-0 lg:w-80">
            <div className="lg:sticky lg:top-24">
              <FilterSection filters={filters} setFilters={setFilters} />
            </div>
          </aside>

          <main className="flex-1">
            <DoctorsList searchQuery={searchQuery} filters={filters} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Doctor;