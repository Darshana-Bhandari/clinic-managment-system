import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, MailCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/authHooks.js';
import { resendVerificationEmail, verifyEmail } from '../Redux/slices/authSlice.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

const VerifyEmail = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const email = location.state?.email || localStorage.getItem('pending_verification_email') || '';
  const [otp, setOtp] = useState('');
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setFieldError('Enter the 6-digit code sent to your email.');
      return;
    }
    setFieldError('');
    const result = await dispatch(verifyEmail({ email, otp }));
    if (verifyEmail.fulfilled.match(result)) {
      localStorage.removeItem('pending_verification_email');
      navigate('/login', { replace: true, state: { verifiedEmail: email } });
    }
  };

  const handleResend = async () => {
    if (email) await dispatch(resendVerificationEmail(email));
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
          <MailCheck size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verify your email</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Enter the 6-digit code sent to {email || 'your email address'}.
        </p>
      </div>

      {!email && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">Your verification email is missing. Please register again.</p>}
      {error && <div className="mb-4 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Verification code"
          name="otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          icon={<KeyRound size={18} />}
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
          error={Boolean(fieldError)}
          helperText={fieldError}
          disabled={isLoading || !email}
          required
        />
        <Button type="submit" fullWidth size="lg" loading={isLoading} disabled={isLoading || !email}>Verify email</Button>
      </form>

      <button type="button" onClick={handleResend} disabled={isLoading || !email} className="mt-4 w-full text-sm font-medium text-primary hover:underline disabled:opacity-50">
        Send a new code
      </button>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already verified? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
};

export default VerifyEmail;