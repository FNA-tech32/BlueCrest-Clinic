import { Link } from 'react-router-dom';
import { Calendar, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [clinicName, setClinicName] = useState('Blue Crest Clinic');
  const [clinicPhone, setClinicPhone] = useState('+1 (555) 248-3273');

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('clinic_settings').select('clinic_name, clinic_phone').limit(1).single();
      if (data) {
        if (data.clinic_name) setClinicName(data.clinic_name);
        if (data.clinic_phone) setClinicPhone(data.clinic_phone);
      }
    }
    loadSettings();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-100 bg-white/85 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between max-w-7xl">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 transition-colors group-hover:bg-primary-100 shadow-xs border border-primary-100/70">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 2C7.58 2 4 5.58 4 10v4.5A3.5 3.5 0 0 0 7.5 18h1.5v3.5a1.5 1.5 0 0 0 3 0V18h3v3.5a1.5 1.5 0 0 0 3 0V18h1.5A3.5 3.5 0 0 0 20 14.5V10c0-4.42-3.58-8-8-8Zm0 14h-4v-4h8v4Zm0-6h-4V6h8v4Z" /></svg>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">{clinicName}</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-600 -mt-1">Dental Practice</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Home</Link>
          <a href="/#services" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Services</a>
          <a href="/#about" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Our Practice</a>
          <a href="/#contact" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end text-xs mr-2">
            <a href={`tel:${clinicPhone}`} className="flex items-center gap-1.5 font-medium text-slate-700 hover:text-primary-600 transition-colors">
              <Phone className="w-3.5 h-3.5 text-primary-600" />
              <span>{clinicPhone}</span>
            </a>
            <span className="text-[10px] text-slate-400">Alt/Emergency: +1 (555) 987-6543</span>
          </div>
          <Link 
            to="/booking" 
            className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Book Visit
          </Link>
        </div>
      </div>
    </header>
  );
}
