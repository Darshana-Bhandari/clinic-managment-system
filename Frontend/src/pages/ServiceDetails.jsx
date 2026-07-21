import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  // In a real app, fetch this from an API
  const serviceData = {
    'cardiology': {
      title: 'Cardiology',
      icon: '❤️',
      description: 'Comprehensive heart care services',
      longDescription: 'Our cardiology department provides state-of-the-art care for all heart conditions...',
      doctors: ['Dr. Ram Sharma', 'Dr. Hari Adhikari'],
      procedures: ['ECG', 'Echocardiogram', 'Cardiac Catheterization', 'Angioplasty'],
      availability: 'Monday - Saturday'
    },
    'dermatology': {
      title: 'Dermatology',
      icon: '🧴',
      description: 'Expert skin care services',
      longDescription: 'Our dermatology department offers comprehensive skin care...',
      doctors: ['Dr. Sita Gurung'],
      procedures: ['Skin Examination', 'Biopsy', 'Laser Treatment', 'Acne Therapy'],
      availability: 'Monday - Friday'
    }
    // Add more services as needed
  };

  const service = serviceData[serviceId];

  if (!service) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h1>
          <p className="text-gray-600 mb-6">The service you're looking for doesn't exist.</p>
          <Link to="/services">
            <Button variant="primary">Back to Services</Button>
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

      <Card className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-6xl">{service.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
            <p className="text-gray-600">{service.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Service</h3>
            <p className="text-gray-600 leading-relaxed">{service.longDescription}</p>
            
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Available Doctors</h3>
            <ul className="space-y-2">
              {service.doctors.map((doctor, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-600">
                  <span>👨‍⚕️</span> {doctor}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Procedures</h3>
            <ul className="space-y-2">
              {service.procedures.map((procedure, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-600">
                  <span className="text-primary-600">✓</span> {procedure}
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Availability</h3>
            <p className="text-gray-600">{service.availability}</p>

            <div className="mt-6">
              <Link to="/doctors">
                <Button variant="primary" size="lg" fullWidth>
                  Book an Appointment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ServiceDetail;