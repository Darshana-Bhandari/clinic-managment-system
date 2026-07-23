import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2, User, Calendar, Clock, CreditCard, ChevronLeft } from 'lucide-react';
import { doctorsData } from '../utils/dummyData';
import Button from '../components/ui/Button';

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

const Booking = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    doctorId: null,
    date: '',
    time: '',
    patientName: '',
    phone: '',
    age: '',
    gender: '',
    reason: '',
    paymentMethod: 'clinic'
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  
  const updateData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const selectedDoctor = doctorsData.find(d => d.id === formData.doctorId);

  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="container-custom max-w-4xl">
        
        {/* Header & Breadcrumb */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Book an Appointment</h1>
          <p className="mt-2 text-slate-500">Secure your consultation in just a few steps.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full -translate-y-1/2 bg-slate-200 dark:bg-slate-800" />
            <div 
              className="absolute left-0 top-1/2 -z-10 h-0.5 -translate-y-1/2 bg-primary-600 transition-all duration-300" 
              style={{ width: `${((step - 1) / 3) * 100}%` }} 
            />
            
            {[
              { num: 1, icon: User, label: 'Doctor' },
              { num: 2, icon: Calendar, label: 'Date & Time' },
              { num: 3, icon: CheckCircle2, label: 'Details' },
              { num: 4, icon: CreditCard, label: 'Confirm' }
            ].map((s) => {
              const Icon = s.icon;
              const isActive = step >= s.num;
              return (
                <div key={s.num} className="flex flex-col items-center gap-2 bg-slate-50 px-2 dark:bg-slate-950">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300 ${isActive ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`hidden text-xs font-semibold sm:block ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Content */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-xl shadow-slate-200/20 sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-6 font-display text-xl font-bold text-slate-900 dark:text-white">1. Select a Doctor</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {doctorsData.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => { updateData({ doctorId: doc.id }); nextStep(); }}
                    className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${formData.doctorId === doc.id ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600 dark:bg-primary-900/20' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-primary-800 dark:hover:bg-slate-800/50'}`}
                  >
                    <img src={doc.image} alt={doc.name} className="h-14 w-14 rounded-full object-cover shadow-sm" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{doc.name}</p>
                      <p className="text-sm font-medium text-primary-600 dark:text-primary-400">{doc.specialty}</p>
                      <p className="text-xs text-slate-500">NPR {doc.consultationFee}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-2 font-display text-xl font-bold text-slate-900 dark:text-white">2. Select Date & Time</h2>
              <p className="mb-6 text-sm text-slate-500">Booking consultation with <strong className="text-slate-800 dark:text-slate-200">{selectedDoctor?.name}</strong></p>
              
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Choose Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => updateData({ date: e.target.value })}
                    className="input w-full max-w-sm"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {formData.date && (
                  <div className="animate-in fade-in">
                    <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-300">Available Time Slots</label>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => updateData({ time })}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${formData.time === time ? 'border-primary-600 bg-primary-600 text-white shadow-sm' : 'border-slate-200 text-slate-700 hover:border-primary-400 hover:bg-primary-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-6 font-display text-xl font-bold text-slate-900 dark:text-white">3. Patient Details</h2>
              
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.patientName}
                    onChange={(e) => updateData({ patientName: e.target.value })}
                    className="input" 
                    placeholder="e.g. Rahul Chaudhary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => updateData({ phone: e.target.value })}
                    className="input" 
                    placeholder="98XXXXX..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Age</label>
                    <input 
                      type="number" 
                      value={formData.age}
                      onChange={(e) => updateData({ age: e.target.value })}
                      className="input" 
                      placeholder="e.g. 24"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => updateData({ gender: e.target.value })}
                      className="input"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Reason for visit (Optional)</label>
                  <textarea 
                    rows={3}
                    value={formData.reason}
                    onChange={(e) => updateData({ reason: e.target.value })}
                    className="input" 
                    placeholder="Briefly describe your symptoms or reason for visit"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-6 font-display text-xl font-bold text-slate-900 dark:text-white">4. Review & Confirm</h2>
              
              <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="grid gap-y-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Doctor</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedDoctor?.name}</p>
                    <p className="text-sm text-slate-500">{selectedDoctor?.specialty}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Date & Time</p>
                    <p className="font-medium text-slate-900 dark:text-white">{formData.date}</p>
                    <p className="text-sm text-slate-500">{formData.time}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Patient</p>
                    <p className="font-medium text-slate-900 dark:text-white">{formData.patientName || 'N/A'}</p>
                    <p className="text-sm text-slate-500">{formData.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Consultation Fee</p>
                    <p className="font-medium text-slate-900 dark:text-white">NPR {selectedDoctor?.consultationFee}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Select Payment Method</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${formData.paymentMethod === 'online' ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600 dark:bg-primary-900/20' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50'}`}>
                    <input type="radio" name="payment" value="online" checked={formData.paymentMethod === 'online'} onChange={() => updateData({ paymentMethod: 'online' })} className="h-4 w-4 text-primary-600" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Pay Online</p>
                      <p className="text-xs text-slate-500">eSewa / Khalti</p>
                    </div>
                  </label>
                  <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${formData.paymentMethod === 'clinic' ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600 dark:bg-primary-900/20' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50'}`}>
                    <input type="radio" name="payment" value="clinic" checked={formData.paymentMethod === 'clinic'} onChange={() => updateData({ paymentMethod: 'clinic' })} className="h-4 w-4 text-primary-600" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Pay at Clinic</p>
                      <p className="text-xs text-slate-500">Cash on arrival</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-in zoom-in fade-in py-12 text-center duration-500">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="mb-2 font-display text-2xl font-bold text-slate-900 dark:text-white">Booking Confirmed!</h2>
              <p className="text-slate-500">Your appointment token is <span className="font-mono font-bold text-slate-900 dark:text-white">TK-042</span></p>
              
              <div className="mt-8 flex justify-center gap-4">
                <Link to="/">
                  <Button variant="outline">Back to Home</Button>
                </Link>
                <Link to="/patient">
                  <Button variant="primary">View My Appointments</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          {step < 5 && (
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
              {step > 1 ? (
                <Button variant="ghost" onClick={prevStep} icon={<ChevronLeft className="h-4 w-4" />}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              
              {step < 4 ? (
                <Button 
                  variant="primary" 
                  onClick={nextStep} 
                  disabled={(step === 1 && !formData.doctorId) || (step === 2 && (!formData.date || !formData.time))}
                >
                  Continue <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setStep(5)}>
                  Confirm Booking
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;