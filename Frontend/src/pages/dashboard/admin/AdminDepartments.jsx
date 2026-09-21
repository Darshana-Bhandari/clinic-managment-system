import React, { useEffect, useState } from 'react';
import { Building2, Edit3, MapPin, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import SectionCard from '../../../components/sections/SectionCard.jsx';
import Button from '../../../components/ui/Button.jsx';
import { createDepartment, deleteDepartment, getAllDepartments, updateDepartment } from '../../../services/departmentService.js';

const emptyForm = { name: '', description: '', hospital: '', location: '', phone: '', email: '' };

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadDepartments = async () => {
    try {
      const result = await getAllDepartments({ page: 1, limit: 100 });
      setDepartments(result.departments || result || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load departments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (department) => {
    setEditingId(department.id);
    setForm({
      name: department.name || '',
      description: department.description || '',
      hospital: department.hospital || '',
      location: department.location || '',
      phone: department.phone || '',
      email: department.email || '',
    });
    setIsOpen(true);
  };

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await updateDepartment(editingId, form);
        toast.success('Department updated');
      } else {
        await createDepartment(form);
        toast.success('Department created');
      }
      setIsOpen(false);
      await loadDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save department');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (department) => {
    if (!window.confirm(`Delete ${department.name}?`)) return;
    try {
      await deleteDepartment(department.id);
      setDepartments((current) => current.filter((item) => item.id !== department.id));
      toast.success('Department deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete department');
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Departments"
        subtitle="Create and maintain the clinic departments used across the platform."
        action={<Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add department</Button>}
        bodyClassName="p-0"
      >
        {isLoading ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading departments...</p>
        ) : departments.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No departments have been created yet.</p>
            <Button size="sm" className="mt-4" icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Create first department</Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {departments.map((department) => (
              <div key={department.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{department.name}</h3>
                    <p className="mt-1 max-w-xl text-sm text-slate-500">{department.description || 'No description added.'}</p>
                    {(department.location || department.hospital) && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-400"><MapPin className="h-3.5 w-3.5" /> {department.location || department.hospital}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                  <span className="mr-2 text-xs text-slate-500">{department._count?.doctors || 0} doctors</span>
                  <button type="button" onClick={() => openEdit(department)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" title="Edit department"><Edit3 className="h-3.5 w-3.5" /> Edit</button>
                  <button type="button" onClick={() => handleDelete(department)} className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300" title="Delete department"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">{editingId ? 'Edit department' : 'Add department'}</h2>
                <p className="mt-1 text-xs text-slate-500">Keep department details clear for patients and staff.</p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name<input name="name" value={form.name} onChange={handleChange} required minLength={2} className="input mt-1.5 w-full" placeholder="Cardiology" /></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hospital<input name="hospital" value={form.hospital} onChange={handleChange} className="input mt-1.5 w-full" placeholder="Main clinic" /></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location<input name="location" value={form.location} onChange={handleChange} className="input mt-1.5 w-full" placeholder="2nd floor" /></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone<input name="phone" value={form.phone} onChange={handleChange} className="input mt-1.5 w-full" placeholder="+977 98XXXXXXXX" /></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 sm:col-span-2">Email<input name="email" type="email" value={form.email} onChange={handleChange} className="input mt-1.5 w-full" placeholder="department@clinic.com" /></label>
              </div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description<textarea name="description" value={form.description} onChange={handleChange} rows={3} maxLength={500} className="input mt-1.5 w-full" placeholder="What care does this department provide?" /></label>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800"><Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button type="submit" loading={isSaving} disabled={isSaving}>{editingId ? 'Save changes' : 'Create department'}</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepartments;