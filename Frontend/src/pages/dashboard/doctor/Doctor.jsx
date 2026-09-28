import { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

import SearchBar from '../components/doctors/SearchBar';
import FilterSection from '../components/doctors/FilterSection';
import DoctorsList from '../components/doctors/DoctorList';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { useDoctorContext } from '../hooks/useDoctorContext';

const Doctor = () => {
  const { doctors, loading, error, refreshDoctors } = useDoctorContext();

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
              Find a Doctor
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
              Browse and search our network of specialists by name or specialization, then use the
              filters to narrow down by availability, rating, and experience to find the right
              doctor for your needs.
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
            {loading ? (
              <div className="card flex flex-col items-center p-16 text-center">
                <LoadingSpinner size="lg" text="Loading doctors…" />
              </div>
            ) : error ? (
              <div className="card flex flex-col items-center p-12 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400">
                  <AlertTriangle className="h-8 w-8" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-slate-800 dark:text-white">
                  Couldn't load doctors
                </h3>
                <p className="mt-2 max-w-md text-slate-500">{error}</p>
                <Button
                  variant="primary"
                  className="mt-6"
                  onClick={refreshDoctors}
                  icon={<RefreshCw className="h-4 w-4" />}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <DoctorsList doctors={doctors} searchQuery={searchQuery} filters={filters} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Doctor;