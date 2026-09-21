import { useEffect, useState } from 'react';
import { getAllPublicDoctors } from '../services/doctorService.js';
import { DoctorContext } from './doctorContext.js';

const normalizeDoctor = (doctor) => ({
  ...doctor,
  id: doctor.id,
  name: doctor.user?.fullName || 'Medical Specialist',
  image: doctor.user?.avatar || '',
  specialty: doctor.specialization || 'General Medicine',
  hospital: doctor.hospital || doctor.department?.name || 'Clinic',
  location: doctor.hospital || doctor.department?.name || 'Clinic',
  experience: doctor.experience || 0,
  consultationFee: doctor.consultationFee || 0,
  rating: Number(doctor.rating || 0).toFixed(1),
  reviews: doctor.totalReviews || 0,
  bio: doctor.bio || 'Experienced healthcare professional dedicated to patient care.',
  education: Array.isArray(doctor.qualifications) ? doctor.qualifications.join(', ') : 'Qualified medical professional',
  languages: doctor.languages || [],
  availability: doctor.availableDays?.length ? 'This Week' : 'Next Week',
});

export const DoctorProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAllPublicDoctors({ page: 1, limit: 100 });
      setDoctors((result?.doctors || []).map(normalizeDoctor));
    } catch (requestError) {
      setError(requestError.message || 'Unable to load doctors.');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllPublicDoctors({ page: 1, limit: 100 })
      .then((result) => {
        setDoctors((result?.doctors || []).map(normalizeDoctor));
      })
      .catch((requestError) => {
        setError(requestError.message || 'Unable to load doctors.');
        setDoctors([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getDoctorById = (id) => doctors.find((doctor) => String(doctor.id) === String(id));

  const value = {
    doctors,
    loading,
    error,
    getDoctorById,
    refreshDoctors: fetchDoctors,
    setDoctors,
    setLoading,
    setError
  };

  return (
    <DoctorContext.Provider value={value}>
      {children}
    </DoctorContext.Provider>
  );
};