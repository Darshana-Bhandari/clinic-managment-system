import React, { useEffect, useState } from 'react';
import {
  Star,
  Briefcase,
  Wallet,
  UserPlus,
  Edit3,
  Trash2,
  X,
  KeyRound,
  UserX,
  Search,
  Eye,
  Stethoscope,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SectionCard from '../../../components/sections/SectionCard';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { getAllDoctors, updateDoctor } from '../../../services/doctorService';
import { createStaff, deleteStaff, toggleStaffStatus } from "../../../services/adminService";
import { getAllDepartments } from '../../../services/departmentService';
import { currency } from '../../../utils/dashboardData';
import { getInitials } from '../../../utils/helpers';

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'DOCTOR',
  departmentId: '',
  specialization: '',
  consultationFee: '',
  experience: '',
  hospital: '',
  bio: '',
  licenseNumber: '',
};

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingDoctor, setViewingDoctor] = useState(null);

  const loadDoctors = async () => {
    try {
      const result = await getAllDoctors({ page: 1, limit: 100 });
      const list = result.doctors || result || [];
      setDoctors(Array.isArray(list) ? list : []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const result = await getAllDepartments({ page: 1, limit: 100 });
      const list = result.departments || result || [];
      setDepartments(Array.isArray(list) ? list : []);
    } catch (_error) {
      // Silent — departments are optional for the form
    }
  };

  useEffect(() => {
    Promise.all([loadDoctors(), loadDepartments()]);
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setEditingDoctorId(null);
    setForm(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (doctor) => {
    const user = doctor.user || {};
    setEditingId(user.id || doctor.userId || doctor.id);
    setEditingDoctorId(doctor.id);
    setForm({
      fullName: user.fullName || doctor.fullName || '',
      email: user.email || doctor.email || '',
      phone: user.phone || doctor.phone || '',
      password: '',
      confirmPassword: '',
      role: 'DOCTOR',
      departmentId: doctor.departmentId || '',
      specialization: doctor.specialization || '',
      consultationFee: doctor.consultationFee ?? '',
      experience: doctor.experience ?? '',
      hospital: doctor.hospital || '',
      bio: doctor.bio || '',
      licenseNumber: doctor.licenseNumber || '',
    });
    setIsOpen(true);
  };

  const openView = (doctor) => {
    setViewingDoctor(doctor);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!editingId) {
      if (!form.password || form.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    setIsSaving(true);
    try {
      if (editingId && editingDoctorId) {
        const updatePayload = {
          specialization: form.specialization,
          consultationFee: form.consultationFee
            ? Number(form.consultationFee)
            : null,
          experience: form.experience ? Number(form.experience) : null,
          hospital: form.hospital,
          bio: form.bio,
          departmentId: form.departmentId || null,
          licenseNumber: form.licenseNumber,
        };
        await updateDoctor(editingDoctorId, updatePayload);
        toast.success('Doctor profile updated');
      } else {
        const createPayload = {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          confirmPassword: form.confirmPassword,
          role: 'DOCTOR',
          departmentId: form.departmentId || undefined,
          specialization: form.specialization || undefined,
          consultationFee: form.consultationFee
            ? Number(form.consultationFee)
            : undefined,
          experience: form.experience ? Number(form.experience) : undefined,
          hospital: form.hospital || undefined,
          bio: form.bio || undefined,
          licenseNumber: form.licenseNumber || undefined,
        };
        await createStaff(createPayload);
        toast.success('Doctor account created');
      }
      setIsOpen(false);
      await loadDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save doctor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (doctor) => {
    const userId = doctor.userId || doctor.user?.id;
    if (!userId) {
      toast.error('Doctor user ID not found');
      return;
    }
    const wasActive = doctor.user?.isActive ?? true;
    try {
      await toggleStaffStatus(userId);
      setDoctors((current) =>
        current.map((d) =>
          d.id === doctor.id
            ? { ...d, user: { ...(d.user || {}), isActive: !wasActive } }
            : d
        )
      );
      toast.success(
        `${doctor.user?.fullName || 'Doctor'} is now ${
          wasActive ? 'inactive' : 'active'
        }`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to update doctor status'
      );
    }
  };

  const handleDelete = async (doctor) => {
    const name = doctor.user?.fullName || 'this doctor';
    if (!window.confirm(`Delete ${name}?`)) return;
    const userId = doctor.userId || doctor.user?.id;
    if (!userId) {
      toast.error('Doctor user ID not found');
      return;
    }
    try {
      await deleteStaff(userId);
      setDoctors((current) => current.filter((d) => d.id !== doctor.id));
      toast.success('Doctor deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete doctor');
    }
  };

  const filteredDoctors = doctors.filter((d) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const fullName = (d.user?.fullName || d.fullName || '').toLowerCase();
    const specialty = (d.specialization || '').toLowerCase();
    const hospital = (d.hospital || '').toLowerCase();
    return (
      fullName.includes(query) ||
      specialty.includes(query) ||
      hospital.includes(query)
    );
  });

  const specialtyCount = new Set(
    doctors.map((d) => d.specialization).filter(Boolean)
  ).size;

  return (
    <div className="space-y-6">
      <SectionCard
        title="Doctors"
        subtitle={`${doctors.length} specialists across ${specialtyCount} departments`}
        bodyClassName="p-0"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors..."
                className="input pl-9 py-2 text-sm w-56"
              />
            </div>
            <Button
              size="sm"
              icon={<UserPlus className="h-4 w-4" />}
              onClick={openCreate}
            >
              Add doctor
            </Button>
          </div>
        }
      >
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner text="Loading doctors..." />
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="p-12 text-center">
            <Stethoscope className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              {searchQuery
                ? 'No doctors match your search.'
                : 'No doctors have been created yet.'}
            </p>
            {!searchQuery && (
              <Button
                size="sm"
                className="mt-4"
                icon={<UserPlus className="h-4 w-4" />}
                onClick={openCreate}
              >
                Create first doctor
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:bg-slate-900/30">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Doctor</th>
                  <th className="px-5 py-3 text-left font-semibold">
                    Department
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">Stats</th>
                  <th className="px-5 py-3 text-left font-semibold">Fee</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDoctors.map((d) => {
                  const user = d.user || {};
                  const name = user.fullName || d.fullName || 'Unnamed';
                  const isActive = user.isActive ?? true;
                  return (
                    <tr
                      key={d.id}
                      className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 text-sm font-bold text-white">
                            {getInitials(name)}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">
                              {name}
                            </p>
                            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                              {d.specialization || 'General Practice'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {user.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        <p>{d.department?.name || d.hospital || '—'}</p>
                        {d.experience && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                            <Briefcase className="h-3 w-3" /> {d.experience} yrs
                            experience
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {d.rating || '—'}
                            </span>
                          </div>
                          {d.totalReviews ? (
                            <span className="text-slate-400">
                              ({d.totalReviews} reviews)
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                          <Wallet className="h-4 w-4 text-slate-400" />
                          {currency(d.consultationFee || 0)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openView(d)}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            title="View doctor"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(d)}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            title="Edit doctor"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggle(d)}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-primary-700 hover:bg-slate-50 dark:border-slate-700 dark:text-primary-300 dark:hover:bg-slate-800"
                            title={isActive ? 'Deactivate' : 'Activate'}
                          >
                            {isActive ? (
                              <UserX className="h-3.5 w-3.5" />
                            ) : (
                              <KeyRound className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(d)}
                            className="flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300"
                            title="Delete doctor"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {editingId ? 'Edit doctor' : 'Add doctor'}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Maintain accurate doctor records for patients and staff.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Full name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={!!editingId}
                />
                <Input
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Department
                  </label>
                  <select
                    name="departmentId"
                    value={form.departmentId}
                    onChange={handleChange}
                    className="input mt-0 w-full"
                  >
                    <option value="">Select department</option>
                    {departments.map((dep) => (
                      <option key={dep.id} value={dep.id}>
                        {dep.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Specialization"
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  placeholder="Cardiology"
                />
                <Input
                  label="License number"
                  name="licenseNumber"
                  value={form.licenseNumber}
                  onChange={handleChange}
                  placeholder="NMC-XXX"
                />
                <Input
                  label="Years of experience"
                  name="experience"
                  type="number"
                  min="0"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="5"
                />
                <Input
                  label="Consultation fee (Rs.)"
                  name="consultationFee"
                  type="number"
                  min="0"
                  value={form.consultationFee}
                  onChange={handleChange}
                  placeholder="1500"
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Hospital / Clinic"
                    name="hospital"
                    value={form.hospital}
                    onChange={handleChange}
                    placeholder="Main clinic"
                  />
                </div>
                {!editingId && (
                  <>
                    <Input
                      label="Temporary password"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                    />
                    <Input
                      label="Confirm password"
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                    />
                  </>
                )}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={3}
                    maxLength={500}
                    className="input mt-0 w-full"
                    placeholder="Tell patients a bit about this doctor..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isSaving}
                  disabled={isSaving}
                >
                  {editingId ? 'Save changes' : 'Create doctor'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Doctor details
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingDoctor(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 text-lg font-bold text-white">
                {getInitials(
                  viewingDoctor.user?.fullName ||
                    viewingDoctor.fullName ||
                    'U'
                )}
              </span>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-lg">
                  {viewingDoctor.user?.fullName ||
                    viewingDoctor.fullName ||
                    'Unnamed'}
                </p>
                <p className="text-primary-600 dark:text-primary-400 font-medium">
                  {viewingDoctor.specialization || 'General Practice'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {viewingDoctor.user?.email || 'No email'}
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400">Department</p>
                <p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5">
                  {viewingDoctor.department?.name ||
                    viewingDoctor.hospital ||
                    '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Experience</p>
                <p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5">
                  {viewingDoctor.experience
                    ? `${viewingDoctor.experience} years`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Consultation Fee</p>
                <p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5">
                  {currency(viewingDoctor.consultationFee || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Rating</p>
                <p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {viewingDoctor.rating || '—'} (
                  {viewingDoctor.totalReviews || 0} reviews)
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400">Phone</p>
                <p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5">
                  {viewingDoctor.user?.phone ||
                    viewingDoctor.phone ||
                    'Not provided'}
                </p>
              </div>
              {viewingDoctor.bio && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">Bio</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5 leading-relaxed">
                    {viewingDoctor.bio}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-6 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewingDoctor(null)}
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={() => {
                  openEdit(viewingDoctor);
                  setViewingDoctor(null);
                }}
                icon={<Edit3 className="h-4 w-4" />}
              >
                Edit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;