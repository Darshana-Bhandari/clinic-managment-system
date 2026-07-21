import React from 'react';
import { Link } from 'react-router-dom';
import  Button  from '../components/ui/Button';

const Error = () => {
  return (
    <div className="flex-center min-h-[70vh]">
      <div className="text-center">
        <div className="text-9xl font-bold text-primary-600 mb-4 animate-float">404</div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="primary" size="lg">
              Go Home
            </Button>
          </Link>
          <Link to="/doctors">
            <Button variant="outline" size="lg">
              Find Doctors
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error;