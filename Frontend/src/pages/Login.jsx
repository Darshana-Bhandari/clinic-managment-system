import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/authHooks.js';
import { loginUser, clearError } from '../Redux/slices/authSlice.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

const redirectByRole = (role) => {
  const map = {
    ADMIN: '/admin',
    DOCTOR: '/doctor',
    RECEPTIONIST: '/staff',
    PATIENT: '/patient',
  };
  return map[role?.toUpperCase()] || '/';
};

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, isAuthenticated, user, error } = useAppSelector((s) => s.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || null;

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(from || redirectByRole(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const validate = () => {
    const next = {};
    if (!formData.email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) next.email = 'Invalid email format';
    if (!formData.password) next.password = 'Password is required';
    else if (formData.password.length < 6) next.password = 'Password must be at least 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await dispatch(loginUser(formData));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 mb-4">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Sign in to your account to continue
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail size={18} />}
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          required
          autoComplete="email"
          disabled={isLoading}
        />

        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          icon={<Lock size={18} />}
          iconPosition="left"
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          required
          autoComplete="current-password"
          disabled={isLoading}
        />
        <div className="-mt-2 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-primary focus:ring-primary"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show password
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isLoading}
          icon={<LogIn size={18} />}
          iconPosition="left"
          disabled={isLoading}
        >
          Sign in
        </Button>
      </form>

      {isLoading && (
        <div className="mt-6">
          <LoadingSpinner size="sm" text="Authenticating..." />
        </div>
      )}

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
};

export default Login;