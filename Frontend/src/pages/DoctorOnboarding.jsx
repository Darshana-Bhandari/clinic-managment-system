import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, FileUp, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { submitDoctorOnboarding } from '../services/doctorService.js';
import { getAllDepartments } from '../services/departmentService.js';

const DoctorOnboarding = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    specialization: '',
    licenseNumber: '',
    qualifications: '',
    experience: '',
    hospital: '',
    department: '',
    consultationFee: '',
    bio: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const result = await getAllDepartments({ page: 1, limit: 100, isActive: true });
        setDepartments(result.departments || result || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not load departments.');
      }
    };
    loadDepartments();
  }, []);

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.specialization || !form.licenseNumber || certificates.length === 0) {
      toast.error('Add your specialty, license number, and at least one certificate.');
      return;
    }

    setIsSaving(true);
    try {
      await submitDoctorOnboarding(
        {
          ...form,
          qualifications: form.qualifications.split(',').map((item) => item.trim()).filter(Boolean),
        },
        { profilePicture, certificates },
      );
      localStorage.removeItem('doctor_onboarding_pending');
      toast.success('Your documents were submitted for review.');
      navigate('/doctor', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not submit your doctor profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
          <Stethoscope className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Complete your doctor profile</h1>
          <p className="mt-1 text-sm text-slate-500">Share your professional details so the clinic can review your application.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Specialty" name="specialization" placeholder="Cardiology" value={form.specialization} onChange={handleChange} required disabled={isSaving} />
          <Input label="Medical license number" name="licenseNumber" placeholder="Your registration number" value={form.licenseNumber} onChange={handleChange} required disabled={isSaving} />
          <Input label="Qualifications" name="qualifications" placeholder="MBBS, MD (comma-separated)" value={form.qualifications} onChange={handleChange} disabled={isSaving} />
          <Input label="Years of experience" name="experience" type="number" min="1" placeholder="5" value={form.experience} onChange={handleChange} disabled={isSaving} />
          <Input label="Hospital or clinic" name="hospital" placeholder="Where you practice" value={form.hospital} onChange={handleChange} disabled={isSaving} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="department">Department</label>
            <select id="department" name="department" value={form.department} onChange={handleChange} disabled={isSaving} className="input w-full">
              <option value="">Select a department</option>
              {departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <Input label="Consultation fee (NPR)" name="consultationFee" type="number" min="1" placeholder="1500" value={form.consultationFee} onChange={handleChange} disabled={isSaving} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="bio">Short professional bio</label>
          <textarea id="bio" name="bio" value={form.bio} onChange={handleChange} maxLength={500} rows={4} placeholder="Tell patients briefly about your experience and approach." className="input w-full" disabled={isSaving} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
            <span className="mb-2 flex items-center gap-2 font-semibold"><FileUp className="h-4 w-4" /> Profile photo</span>
            <input type="file" accept="image/*" onChange={(event) => setProfilePicture(event.target.files?.[0] || null)} disabled={isSaving} />
          </label>
          <label className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
            <span className="mb-2 flex items-center gap-2 font-semibold"><BadgeCheck className="h-4 w-4" /> Certificates and license</span>
            <input type="file" accept="application/pdf,image/*" multiple onChange={(event) => setCertificates(Array.from(event.target.files || []))} disabled={isSaving} />
            <span className="mt-2 block text-xs text-slate-400">Upload at least one clear certificate. Maximum 10 files, 10 MB each.</span>
          </label>
        </div>

        <div className="flex items-center justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
          <Button type="submit" loading={isSaving} disabled={isSaving} icon={<BadgeCheck className="h-4 w-4" />}>Submit for review</Button>
        </div>
      </form>
    </div>
  );
};

export default DoctorOnboarding;