import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserCircle, Phone, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/authHooks.js';
import { registerUser, clearError } from '../Redux/slices/authSlice.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

const Register = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((s) => s.auth);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'PATIENT',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const validate = () => {
    const next = {};
    if (!formData.fullName.trim()) next.fullName = 'Full name is required';
    else if (formData.fullName.trim().length < 2) next.fullName = 'Name is too short';

    if (!formData.email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) next.email = 'Invalid email format';

    if (!formData.phone.trim()) next.phone = 'Phone number is required';
    else if (!/^[+\d][\d\s-]{7,}$/.test(formData.phone.trim())) next.phone = 'Invalid phone format';

    if (!formData.password) next.password = 'Password is required';
    else if (formData.password.length < 8) next.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) next.password = 'Use an uppercase letter, lowercase letter, and number';

    if (formData.password !== formData.confirmPassword)
      next.confirmPassword = 'Passwords do not match';

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await dispatch(registerUser({ ...formData, role: 'PATIENT' }));
    if (registerUser.fulfilled.match(result)) {
      localStorage.setItem('pending_verification_email', formData.email);
      dispatch({ type: 'auth/clearAuth' });
      navigate('/verify-email', { replace: true, state: { email: formData.email } });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 mb-4">
          <UserPlus size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Join us for a better healthcare experience
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Full Name"
          name="fullName"
          type="text"
          placeholder="John Doe"
          icon={<UserCircle size={18} />}
          value={formData.fullName}
          onChange={handleChange}
          error={!!fieldErrors.fullName}
          helperText={fieldErrors.fullName}
          required
          autoComplete="name"
          disabled={isLoading}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail size={18} />}
          value={formData.email}
          onChange={handleChange}
          error={!!fieldErrors.email}
          helperText={fieldErrors.email}
          required
          autoComplete="email"
          disabled={isLoading}
        />

        <Input
          label="Phone"
          name="phone"
          type="tel"
          placeholder="+977 98XXXXXXXX"
          icon={<Phone size={18} />}
          value={formData.phone}
          onChange={handleChange}
          error={!!fieldErrors.phone}
          helperText={fieldErrors.phone}
          required
          autoComplete="tel"
          disabled={isLoading}
        />

        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          icon={<Lock size={18} />}
          value={formData.password}
          onChange={handleChange}
          error={!!fieldErrors.password}
          helperText={fieldErrors.password}
          required
          autoComplete="new-password"
          disabled={isLoading}
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          icon={<Lock size={18} />}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={!!fieldErrors.confirmPassword}
          helperText={fieldErrors.confirmPassword}
          required
          autoComplete="new-password"
          disabled={isLoading}
        />

        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-primary focus:ring-primary"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
          />
          Show password
        </label>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isLoading}
          icon={<UserPlus size={18} />}
          iconPosition="left"
          disabled={isLoading}
        >
          Create account
        </Button>
      </form>

      {isLoading && (
        <div className="mt-6">
          <LoadingSpinner size="sm" text="Creating your account..." />
        </div>
      )}

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;