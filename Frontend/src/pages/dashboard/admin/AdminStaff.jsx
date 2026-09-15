import React, { useEffect, useState } from 'react';
import { KeyRound, UserPlus, UsersRound, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import SectionCard from '../../../components/sections/SectionCard';
import { createStaff, listStaff, toggleStaffStatus } from '../../../services/adminServices';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'RECEPTIONIST',
};

const formatRole = (role) => role === 'DOCTOR' ? 'Doctor' : 'Receptionist';

const AdminStaff = () => {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadStaff = async () => {
    try {
      const response = await listStaff({ limit: 100 });
      setStaff(response?.staff || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load staff accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSaving(true);
    try {
      await createStaff(form);
      toast.success(`${formatRole(form.role)} account created`);
      setForm(initialForm);
      await loadStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create staff account');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (member) => {
    try {
      await toggleStaffStatus(member.id);
      setStaff((current) => current.map((item) => (
        item.id === member.id ? { ...item, isActive: !item.isActive } : item
      )));
      toast.success(`${member.fullName} is now ${member.isActive ? 'inactive' : 'active'}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update account status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <SectionCard title="Create staff account" subtitle="Only administrators can provision clinic access">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" name="fullName" value={form.fullName} onChange={handleChange} required />
            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
            <Input label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="role">
                Staff role
              </label>
              <select id="role" name="role" value={form.role} onChange={handleChange} className="input">
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="DOCTOR">Doctor</option>
              </select>
            </div>
            <Input label="Temporary password" name="password" type="password" value={form.password} onChange={handleChange} required autoComplete="new-password" />
            <Input label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required autoComplete="new-password" />
            <Button type="submit" fullWidth loading={isSaving} icon={<UserPlus size={17} />}>
              Create account
            </Button>
          </form>
        </SectionCard>

        <SectionCard title="Active staff directory" subtitle="Manage access for doctors and receptionists">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading staff accounts...</p>
          ) : staff.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center text-slate-500">
              <UsersRound className="h-8 w-8" />
              <p className="text-sm">No staff accounts have been created yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Staff member</th>
                    <th className="px-3 py-3 font-semibold">Role</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 text-right font-semibold">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {staff.map((member) => (
                    <tr key={member.id}>
                      <td className="px-3 py-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{member.fullName}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </td>
                      <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{formatRole(member.role)}</td>
                      <td className="px-3 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${member.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-right">
                        <button type="button" onClick={() => handleToggle(member)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-900">
                          {member.isActive ? <UserX size={15} /> : <KeyRound size={15} />}
                          {member.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default AdminStaff;