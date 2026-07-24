import React, { useState, useMemo, useEffect } from 'react';
import { SearchX, ChevronLeft, ChevronRight } from 'lucide-react';
import DoctorCard from './DoctorCard';
import { doctorsData } from '../../utils/dummyData';

const DoctorsList = ({ searchQuery, filters }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const filteredDoctors = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

    return doctorsData.filter((doctor) => {
      const searchableText = [
        doctor.name,
        doctor.specialty,
        doctor.location,
        doctor.hospital,
        doctor.education,
        doctor.bio,
        doctor.availability,
        ...(doctor.languages || [])
      ]
        .join(' ')
        .toLowerCase();

      const searchMatch =
        queryTokens.length === 0 ||
        queryTokens.every((token) => searchableText.includes(token));

      const specialtyMatch = filters.specialty === '' || doctor.specialty === filters.specialty;
      const availabilityMatch = filters.availability === '' || doctor.availability === filters.availability;

      let ratingMatch = true;
      if (filters.rating !== '') {
        ratingMatch = doctor.rating >= parseFloat(filters.rating);
      }

      let experienceMatch = true;
      if (filters.experience !== '') {
        const expRange = filters.experience;
        if (expRange === '0-5') experienceMatch = doctor.experience <= 5;
        else if (expRange === '5-10') experienceMatch = doctor.experience > 5 && doctor.experience <= 10;
        else if (expRange === '10-15') experienceMatch = doctor.experience > 10 && doctor.experience <= 15;
        else if (expRange === '15+') experienceMatch = doctor.experience > 15;
      }

      return searchMatch && specialtyMatch && availabilityMatch && ratingMatch && experienceMatch;
    });
  }, [searchQuery, filters]);

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (filteredDoctors.length === 0) {
    return (
      <div className="card flex flex-col items-center p-12 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <SearchX className="h-8 w-8" />
        </span>
        <h3 className="mt-5 text-xl font-bold text-slate-800 dark:text-white">No doctors found</h3>
        <p className="mt-2 max-w-md text-slate-500">
          Try adjusting your search terms or filters to find the specialist you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-5 flex-wrap gap-2">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-900 dark:text-white">{paginatedDoctors.length}</span> of{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{filteredDoctors.length}</span> doctors
        </p>
        {filteredDoctors.length > itemsPerPage && (
          <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
        )}
      </div>

      <div className="stagger-children grid grid-cols-1 gap-6 md:grid-cols-2">
        {paginatedDoctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-primary-300 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) pageNum = i + 1;
            else if (currentPage <= 3) pageNum = i + 1;
            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
            else pageNum = currentPage - 2 + i;

            const active = currentPage === pageNum;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                    : 'border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-600 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-primary-300 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
            aria-label="Next page"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;