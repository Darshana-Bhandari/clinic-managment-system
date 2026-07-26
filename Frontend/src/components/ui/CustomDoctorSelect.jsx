
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check, Search, UserCheck } from 'lucide-react';
import { doctorsData } from '../../utils/dummyData';

const CustomDoctorSelect = ({ value, onChange, label = 'Attending / Known Doctor *' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const selectedDoctor = doctorsData.find((d) => d.name === value) || doctorsData[0];

  const filteredDoctors = doctorsData.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()) ||
      d.hospital.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</label>}

      {/* Select Box Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm font-medium transition-all hover:border-slate-300 focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
            <UserCheck className="h-4 w-4" />
          </span>
          <div className="truncate">
            <span className="font-semibold text-slate-900 dark:text-white">{selectedDoctor.name}</span>
            <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">({selectedDoctor.specialty})</span>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {/* Search Box */}
          <div className="border-b border-slate-100 p-2 dark:border-slate-800">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doctor or specialty..."
                className="w-full rounded-lg bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:bg-white dark:bg-slate-800 dark:text-white dark:focus:bg-slate-950"
              />
            </div>
          </div>

          {/* Scrollable Doctors List */}
          <div className="max-h-48 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc) => {
                const isSelected = doc.name === value;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      onChange(doc.name);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-primary-50 text-primary-900 font-semibold dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {doc.specialty} · {doc.hospital.split(' ')[0]}
                      </p>
                    </div>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />}
                  </button>
                );
              })
            ) : (
              <p className="p-3 text-center text-xs text-slate-400">No doctors match your search.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDoctorSelect;