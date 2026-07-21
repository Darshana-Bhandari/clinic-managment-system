import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {doctorsData } from '../utils/dummyData';
import  Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const doctor = doctorsData.find(d => d.id === parseInt(id));

  if (!doctor) {
    return (
      <div className="flex-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Doctor not found</h2>
          <p className="text-gray-500 mb-6">The doctor you're looking for doesn't exist.</p>
          <Link to="/doctors">
            <Button variant="primary">Back to Doctors</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12 animate-fade-in-up">
      <button
        onClick={() => navigate(-1)}
        className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-6 transition-colors"
      >
        ← Back
      </button>

      <Card className="overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <img
              src={doctor.image || '/src/assets/images/placeholder-doctor.png'}
              alt={doctor.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-primary-100 flex-shrink-0"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{doctor.name}</h1>
              <p className="text-xl text-primary-600 font-medium">{doctor.specialty}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold">{doctor.rating}</span>
                  <span className="text-gray-500">({doctor.reviews} reviews)</span>
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{doctor.experience} years experience</span>
                <span className="text-gray-500">•</span>
                <span className={`badge badge-${doctor.availability === 'Available Today' ? 'success' : 'info'}`}>
                  {doctor.availability}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <Button variant="primary" size="lg" fullWidth>
                Book Appointment
              </Button>
              <Button variant="outline" size="md" fullWidth>
                Save to Favorites
              </Button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
              
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Education</h3>
              <p className="text-gray-600">{doctor.education}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
              <div className="space-y-3">
                <div className="flex-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Hospital</span>
                  <span className="font-medium text-gray-900">{doctor.hospital}</span>
                </div>
                <div className="flex-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium text-gray-900">{doctor.location}</span>
                </div>
                <div className="flex-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-medium text-gray-900">Rs. {doctor.consultationFee}</span>
                </div>
                <div className="flex-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Languages</span>
                  <span className="font-medium text-gray-900">{doctor.languages.join(', ')}</span>
                </div>
                <div className="flex-between">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-medium text-gray-900">{doctor.experience} years</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability Schedule</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-success rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Available Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-primary-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">This Week</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-warning rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Next Week</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                <p>📅 Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>📅 Saturday: 9:00 AM - 2:00 PM</p>
                <p>📅 Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DoctorDetail;