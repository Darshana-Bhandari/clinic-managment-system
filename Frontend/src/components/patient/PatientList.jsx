import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCw, Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllPatients } from '../../services/patientServices.js';

const PatientList = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [search, setSearch] = useState('');
    const [gender, setGender] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [filters, setFilters] = useState({ search: '', gender: '', bloodGroup: '' });

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllPatients({
                page: pagination.page,
                limit: pagination.limit,
                ...filters,
            });
            setPatients(data?.patients || []);
            setPagination((current) => ({ ...current, ...(data?.pagination || {}) }));
        } catch (requestError) {
            const message = requestError.response?.data?.message || 'Failed to fetch patients';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.limit, pagination.page]);

    useEffect(() => {
        const request = setTimeout(fetchPatients, 0);
        return () => clearTimeout(request);
    }, [fetchPatients]);

    const handleSearch = (event) => {
        event.preventDefault();
        setPagination((current) => ({ ...current, page: 1 }));
        setFilters({ search: search.trim(), gender, bloodGroup });
    };

    const handleReset = () => {
        setSearch('');
        setGender('');
        setBloodGroup('');
        setPagination((current) => ({ ...current, page: 1 }));
        setFilters({ search: '', gender: '', bloodGroup: '' });
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > pagination.totalPages || page === pagination.page) return;
        setPagination((current) => ({ ...current, page }));
    };

    const getPatientName = (patient) => patient.user?.fullName || 'Unnamed patient';
    const getInitials = (patient) => getPatientName(patient).split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

    return (
        <section className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Patient list</h2>
                    <p className="mt-1 text-sm text-slate-500">Browse patient records from the clinical registry.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users className="h-4 w-4" />
                    <span>{pagination.total} total patients</span>
                </div>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or phone" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </div>
                <select value={gender} onChange={(event) => setGender(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                    <option value="">All genders</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                </select>
                <input value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value)} placeholder="Blood group" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:w-32" />
                <button type="submit" className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Search</button>
                <button type="button" onClick={handleReset} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Reset</button>
            </form>

            {error && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                    <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</span>
                    <button type="button" onClick={fetchPatients} className="inline-flex items-center gap-1 font-semibold hover:underline"><RefreshCw className="h-3.5 w-3.5" /> Retry</button>
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Patient</th>
                                <th className="px-5 py-3 font-semibold">Contact</th>
                                <th className="px-5 py-3 font-semibold">Gender</th>
                                <th className="px-5 py-3 font-semibold">Blood group</th>
                                <th className="px-5 py-3 font-semibold">Appointments</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading && <tr><td colSpan="5" className="p-10 text-center text-slate-500">Loading patient records...</td></tr>}
                            {!loading && patients.map((patient) => (
                                <tr key={patient.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">{getInitials(patient)}</span><div><p className="font-semibold text-slate-900 dark:text-white">{getPatientName(patient)}</p><p className="text-xs text-slate-400">{patient.id}</p></div></div></td>
                                    <td className="px-5 py-4"><p className="text-slate-700 dark:text-slate-300">{patient.user?.email || 'No email'}</p><p className="text-xs text-slate-400">{patient.user?.phone || 'No phone'}</p></td>
                                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{patient.gender || 'Not recorded'}</td>
                                    <td className="px-5 py-4"><span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">{patient.bloodGroup || 'Not recorded'}</span></td>
                                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{patient.appointments?.length || 0}</td>
                                </tr>
                            ))}
                            {!loading && patients.length === 0 && <tr><td colSpan="5" className="p-12 text-center text-slate-500">No patients found for the selected filters.</td></tr>}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-slate-800">
                    <p className="text-xs text-slate-500">Page {pagination.page} of {Math.max(pagination.totalPages, 1)}</p>
                    <div className="flex items-center gap-2">
                        <button type="button" aria-label="Previous page" disabled={pagination.page <= 1 || loading} onClick={() => handlePageChange(pagination.page - 1)} className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"><ChevronLeft className="h-4 w-4" /></button>
                        <button type="button" aria-label="Next page" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => handlePageChange(pagination.page + 1)} className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PatientList