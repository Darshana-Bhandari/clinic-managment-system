import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-200 py-10">
      <div className="container-custom grid gap-8 md:grid-cols-3">
        <div>
          <h2 className="text-xl font-semibold text-white">ClinicMS</h2>
          <p className="mt-3 text-sm text-slate-400">Fast, reliable booking for clinics and specialists across Kathmandu.</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Quick links</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/doctors" className="hover:text-white">Doctors</Link></li>
            <li><Link to="/services" className="hover:text-white">Services</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Contact</h3>
          <p className="mt-4 text-sm text-slate-300">Bhaisepati, Kathmandu</p>
          <p className="text-sm text-slate-300">Phone: 1800-333-665</p>
          <p className="text-sm text-slate-300">Email: support@clinicms.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
