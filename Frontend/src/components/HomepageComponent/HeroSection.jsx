import React from 'react'
import { Calendar, Search, ChevronRight, Activity, Clock, ShieldCheck, Heart, Baby, Sparkles, Shield } from 'lucide-react';

const HeroSection = () => {
  return (
    <>
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden py-20 lg:py-28" id="hero-section">
        {/* Ambient graphics */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl flex flex-col gap-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-100 border border-blue-400/20 self-start">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Now Serving Patients at Chabahil, Kathmandu
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight text-white leading-[1.1]">
              Compassionate Care,<br />
              <span className="text-amber-300">Instantly Booked.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-blue-100 max-w-xl font-normal leading-relaxed">
              Book an appointment online in under a minute. Say goodbye to long phone queues and tedious clinic waiting lines.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
              <button
                onClick={() => onNavigate('book-appointment')}
                className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer min-h-[48px] flex items-center justify-center gap-2 text-base focus:outline-none focus:ring-4 focus:ring-amber-300"
                id="hero-cta-book"
              >
                <Calendar className="w-5 h-5 shrink-0" />
                <span>Book Appointment</span>
              </button>

              <button
                onClick={() => onNavigate('doctors')}
                className="bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold px-8 py-4 rounded-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer min-h-[48px] flex items-center justify-center gap-2 text-base focus:outline-none focus:ring-4 focus:ring-white/20"
                id="hero-cta-find"
              >
                <Search className="w-5 h-5 shrink-0" />
                <span>Find a Doctor</span>
              </button>
            </div>

            {/* Micro credentials */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-sm text-blue-200">
              <div className="flex items-center gap-1.5">
                <span className="text-green-400 font-bold">✓</span> No registration fees
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-green-400 font-bold">✓</span> Direct SMS confirmations
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-green-400 font-bold">✓</span> Instant live-queue tokens
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HeroSection