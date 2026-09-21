import { useEffect, useState } from 'react';
import { getAllDepartments } from '../services/departmentService.js';
import { DepartmentContext } from './departmentContext.js';

export const DepartmentProvider = ({ children }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllDepartments({ page: 1, limit: 100, isActive: true });
      setDepartments(result?.departments || []);
    } catch (requestError) {
      setDepartments([]);
      setError(requestError.message || 'Unable to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllDepartments({ page: 1, limit: 100, isActive: true })
      .then((result) => setDepartments(result?.departments || []))
      .catch((requestError) => {
        setDepartments([]);
        setError(requestError.message || 'Unable to load departments.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DepartmentContext.Provider
      value={{ departments, loading, error, refreshDepartments: fetchDepartments, setDepartments }}
    >
      {children}
    </DepartmentContext.Provider>
  );
};