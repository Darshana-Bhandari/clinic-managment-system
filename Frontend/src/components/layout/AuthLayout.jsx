import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(135deg,_#022c22_0%,_#0f766e_55%,_#0d9488_100%)]" />
      <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-80 w-80 rounded-full bg-teal-300/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-lg">
            <Plus className="h-6 w-6" strokeWidth={3} />
          </span>
          <span className="font-display text-2xl font-bold text-white">
            Medi<span className="text-amber-300">Care</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-white/15 bg-white/95 p-8 shadow-2xl backdrop-blur-xl dark:bg-slate-900/95">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
            <p className="mt-1.5 text-sm text-slate-500">Please sign in to access your account.</p>
          </div>
          <Outlet />
        </div>

        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </div>
  );
};

export default AuthLayout;