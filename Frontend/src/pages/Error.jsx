import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Stethoscope, Compass } from 'lucide-react';
import Button from '../components/ui/Button';

const Error = () => {
  return (
    <div className="flex-center min-h-[75vh] px-4">
      <div className="text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
          <Compass className="h-10 w-10 animate-float" />
        </span>
        <p className="mt-6 font-display text-7xl font-extrabold text-gradient sm:text-8xl">404</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-lg text-slate-600 dark:text-slate-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/">
            <Button variant="primary" size="lg" icon={<Home className="h-5 w-5" />}>Go Home</Button>
          </Link>
          <Link to="/doctors">
            <Button variant="outline" size="lg" icon={<Stethoscope className="h-5 w-5" />}>Find Doctors</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error;