import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Lock, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/authHooks.js';
import { resetPasswordThunk } from '../Redux/slices/authSlice.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

const ResetPassword = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, pendingEmail } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: location.state?.email || pendingEmail || '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!formData.email) navigate('/forgot-password', { replace: true });
  }, [formData.email, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!/^\d{6}$/.test(formData.otp.trim())) next.otp = 'Enter the 6-digit code from your email';
    if (formData.newPassword.length < 6) next.newPassword = 'Password must be at least 6 characters';
    if (formData.newPassword !== formData.confirmPassword) next.confirmPassword = 'Passwords do not match';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    const result = await dispatch(resetPasswordThunk({
      email: formData.email,
      otp: formData.otp.trim(),
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    }));
    if (resetPasswordThunk.fulfilled.match(result)) setCompleted(true);
  };

  if (completed) {
    return (
      <div className="text-center">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">Password updated</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your password has been reset successfully.</p>
        <Link to="/login" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 mb-4">
          <KeyRound size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Use the code sent to {formData.email}.</p>
      </div>

      {error && <div className="mb-4 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input label="Reset code" name="otp" type="text" inputMode="numeric" maxLength={6} placeholder="123456" icon={<KeyRound size={18} />} value={formData.otp} onChange={handleChange} error={Boolean(fieldErrors.otp)} helperText={fieldErrors.otp} disabled={isLoading} required />
        <Input label="New password" name="newPassword" type="password" placeholder="••••••••" icon={<Lock size={18} />} value={formData.newPassword} onChange={handleChange} error={Boolean(fieldErrors.newPassword)} helperText={fieldErrors.newPassword} autoComplete="new-password" disabled={isLoading} required />
        <Input label="Confirm password" name="confirmPassword" type="password" placeholder="••••••••" icon={<Lock size={18} />} value={formData.confirmPassword} onChange={handleChange} error={Boolean(fieldErrors.confirmPassword)} helperText={fieldErrors.confirmPassword} autoComplete="new-password" disabled={isLoading} required />
        <Button type="submit" fullWidth size="lg" loading={isLoading} icon={<KeyRound size={18} />} iconPosition="left" disabled={isLoading}>
          Reset password
        </Button>
      </form>

      {isLoading && <div className="mt-6"><LoadingSpinner size="sm" text="Updating password..." /></div>}

      <Link to="/forgot-password" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft size={16} /> Request a new code
      </Link>
    </div>
  );
};

export default ResetPassword;