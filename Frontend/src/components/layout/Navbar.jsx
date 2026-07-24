import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon,
  Stethoscope,
  HeartPulse,
  Info,
  Phone,
  ChevronDown,
  Moon,
  Sun,
  Menu,
  X,
  LayoutDashboard,
  LogIn,
  LogOut,
  UserPlus,
  ArrowRight,
  Plus,
  CalendarPlus,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button';

const navLinks = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/doctors', label: 'Doctors', icon: Stethoscope },
  { path: '/services', label: 'Services', icon: HeartPulse },
  { path: '/about', label: 'About', icon: Info },
  { path: '/contact', label: 'Contact', icon: Phone },
];

const services = [
  { path: '/services/cardiology', label: 'Cardiology', description: 'Heart care and treatment', emoji: '❤️' },
  { path: '/services/dermatology', label: 'Dermatology', description: 'Skin care and treatment', emoji: '🧴' },
  { path: '/services/neurology', label: 'Neurology', description: 'Brain and nervous system', emoji: '🧠' },
  { path: '/services/pediatrics', label: 'Pediatrics', description: 'Child healthcare', emoji: '👶' },
  { path: '/services/orthopedics', label: 'Orthopedics', description: 'Bone and joint care', emoji: '🦴' },
  { path: '/services/gynecology', label: 'Gynecology', description: "Women's health", emoji: '🌸' },
  { path: '/services/ophthalmology', label: 'Ophthalmology', description: 'Eye care and surgery', emoji: '👁️' },
  { path: '/services/ent', label: 'ENT', description: 'Ear, nose, throat care', emoji: '👂' },
  { path: '/services/psychiatry', label: 'Psychiatry', description: 'Mental health services', emoji: '🧘' },
  { path: '/services/dentistry', label: 'Dentistry', description: 'Dental care and treatment', emoji: '🦷' },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('auth_token'));
  }, []);

  useEffect(() => {
    const handleEscape = (e) => e.key === 'Escape' && setIsServicesDropdownOpen(false);
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isServicesDropdownOpen && !event.target.closest('.services-dropdown')) {
        setIsServicesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isServicesDropdownOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsServicesDropdownOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <header
      className={`site-header border-b transition-all duration-300 ${
        isScrolled
          ? 'border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/90'
          : 'border-slate-200/70 bg-white dark:border-slate-800/80 dark:bg-slate-950'
      }`}
    >
      <div className="container-custom">
        <div className="flex-between py-3">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 text-white shadow-lg shadow-primary-500/30 transition-transform duration-300 group-hover:scale-105">
              <Plus className="h-5 w-5" strokeWidth={3} />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Medi<span className="text-primary-600">Care</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-slate-50/70 p-1 shadow-sm lg:flex dark:border-slate-800/70 dark:bg-slate-900/70">
            {navLinks.map((link) => {
              const Icon = link.icon;
              if (link.path === '/services') {
                return (
                  <div key={link.path} className="services-dropdown relative">
                    <button
                      onClick={() => setIsServicesDropdownOpen((v) => !v)}
                      onMouseEnter={() => setIsServicesDropdownOpen(true)}
                      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        location.pathname.startsWith('/services')
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-white hover:text-primary-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-primary-300'
                      }`}
                      aria-expanded={isServicesDropdownOpen}
                      aria-haspopup="true"
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isServicesDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isServicesDropdownOpen && (
                      <div
                        className="animate-slide-down absolute left-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                        onMouseLeave={() => setIsServicesDropdownOpen(false)}
                      >
                        <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">All Specialties</p>
                        </div>
                        <div className="max-h-96 overflow-y-auto p-1.5">
                          {services.map((service) => (
                            <Link
                              key={service.path}
                              to={service.path}
                              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-primary-50 dark:hover:bg-slate-800/60"
                              onClick={() => setIsServicesDropdownOpen(false)}
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg dark:bg-slate-800">
                                {service.emoji}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{service.label}</p>
                                <p className="truncate text-xs text-slate-500">{service.description}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-600" />
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
                          <Link
                            to="/services"
                            className="flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800"
                            onClick={() => setIsServicesDropdownOpen(false)}
                          >
                            View all services <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white hover:text-primary-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-primary-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="hidden items-center gap-2 lg:flex">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:text-primary-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-primary-500"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</Button>
                </Link>
                <Button variant="danger" size="sm" icon={<LogOut className="h-4 w-4" />} onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" icon={<LogIn className="h-4 w-4" />}>Login</Button>
                </Link>
                <Link to="/book">
                  <Button variant="primary" size="sm" icon={<CalendarPlus className="h-4 w-4" />}>Book Now</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="animate-slide-down border-t border-slate-200/80 bg-white/95 py-2 backdrop-blur lg:hidden dark:border-slate-800/80 dark:bg-slate-950/95">
            <div className="space-y-1.5 px-1 py-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-primary-700 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {link.label}
                  </Link>
                );
              })}

              <div className="rounded-xl bg-slate-50/80 px-4 py-3 dark:bg-slate-900/50">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Popular services</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {services.slice(0, 8).map((service) => (
                    <Link
                      key={service.path}
                      to={service.path}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-white hover:text-primary-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <span>{service.emoji}</span>
                      {service.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-200/80 px-1 pt-3 dark:border-slate-800/80">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                      <LayoutDashboard className="h-4.5 w-4.5" /> Dashboard
                    </Link>
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-danger hover:bg-rose-50 dark:hover:bg-rose-900/20">
                      <LogOut className="h-4.5 w-4.5" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                      <LogIn className="h-4.5 w-4.5" /> Login
                    </Link>
                    <Link to="/book" className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-primary-500/25">
                      <CalendarPlus className="h-4.5 w-4.5" /> Book Appointment
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;