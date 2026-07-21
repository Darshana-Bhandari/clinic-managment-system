import React, { createContext, useContext, useState, useMemo } from 'react';
import { doctorsData } from '../utils/dummyData';

const DoctorContext = createContext();

export const useDoctorContext = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctorContext must be used within a DoctorProvider');
  }
  return context;
};

export const DoctorProvider = ({ children }) => {
  const [doctors, setDoctors] = useState(doctorsData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDoctorById = (id) => {
    return doctors.find(doctor => doctor.id === id);
  };

  const value = useMemo(() => ({
    doctors,
    loading,
    error,
    getDoctorById,
    setDoctors,
    setLoading,
    setError
  }), [doctors, loading, error]);

  return (
    <DoctorContext.Provider value={value}>
      {children}
    </DoctorContext.Provider>
  );
};