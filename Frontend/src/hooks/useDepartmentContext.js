import { useContext } from 'react';
import { DepartmentContext } from '../contexts/departmentContext.js';

export const useDepartmentContext = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartmentContext must be used within a DepartmentProvider');
  }
  return context;
};