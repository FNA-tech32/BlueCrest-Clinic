import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('clinic_settings').select('*').limit(1).single();
      if (data) setSettings(data);
    }
    loadSettings();
  }, []);

  const clinicName = settings?.clinic_name || 'Blue Crest Clinic';
  const clinicAddress = settings?.clinic_address || '742 Blue Crest Boulevard, Suite 300, Metro City, NY 10001';
  const clinicPhone = settings?.clinic_phone || '+1 (555) 248-3273';
  const clinicAltPhone = '+1 (555) 987-6543';
  const clinicEmail = settings?.clinic_email || 'info@bluecrestclinic.com';
  const clinicAltEmail = 'appointments@bluecrestclinic.com';

  return (
    <footer id="contact" className="bg-slate-50 border-t border-slate-100 py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2C7.58 2 4 5.58 4 10v4.5A3.5 3.5 0 0 0 7.5 18h1.5v3.5a1.5 1.5 0 0 0 3 0V18h3v3.5a1.5 1.5 0 0 0 3 0V18h1.5A3.5 3.5 0 0 0 20 14.5V10c0-4.42-3.58-8-8-8Zm0 14h-4v-4h8v4Zm0-6h-4V6h8v4Z" /></svg>
              </div>
              <span className="font-serif text-xl font-bold text-slate-900">{clinicName}</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Providing premier, patient-focused dental care. We focus on gentle treatment, prevention, modern dental technology, and helping you achieve a lifelong healthy smile.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-medium border border-primary-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Accepting New Patients & Emergency Cases
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-5 font-serif text-base">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">Home</Link></li>
              <li><a href="/#services" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">Dental Services</a></li>
              <li><a href="/#about" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">About Our Practice</a></li>
              <li><Link to="/booking" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">Book Appointment</Link></li>
              <li><Link to="/admin/login" className="text-sm text-slate-400 hover:text-primary-600 transition-colors">Staff & Admin Login</Link></li>
            </ul>
          </div>

          {/* Primary & Alternative Phone Numbers / Hours */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-5 font-serif text-base">Phone & Hours</h3>
            <div className="space-y-4">
              <div className="text-sm flex flex-col gap-1">
                <span className="font-medium text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-primary-600" /> Phone Numbers
                </span>
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2 shadow-xs">
                  <div>
                    <span className="text-xs text-slate-400 block font-normal">Primary Contact:</span>
                    <a href={`tel:${clinicPhone}`} className="text-sm font-semibold text-slate-800 hover:text-primary-600 transition-colors">
                      {clinicPhone}
                    </a>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-400 block font-normal">Alt / Emergency (24/7):</span>
                    <a href={`tel:${clinicAltPhone}`} className="text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors">
                      {clinicAltPhone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="text-sm flex flex-col gap-1">
                <span className="font-medium text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary-600" /> Clinic Hours
                </span>
                <div className="text-xs text-slate-500 space-y-1 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="flex justify-between">
                    <span>Mon - Fri:</span>
                    <span className="font-medium text-slate-700">8:00 AM – 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span className="font-medium text-slate-700">9:00 AM – 3:00 PM</span>
                  </div>
                  <div className="flex justify-between text-primary-600 font-medium">
                    <span>Sunday:</span>
                    <span>Emergency On-Call</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address & Emails (Primary & Alternative) */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-5 font-serif text-base">Location & Email</h3>
            <ul className="space-y-4">
              <li className="text-sm flex flex-col gap-1">
                <span className="font-medium text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary-600" /> Clinic Address
                </span>
                <span className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                  {clinicAddress}
                </span>
              </li>

              <li className="text-sm flex flex-col gap-1">
                <span className="font-medium text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-primary-600" /> Email Support
                </span>
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2 shadow-xs">
                  <div>
                    <span className="text-xs text-slate-400 block font-normal">General Inquiries:</span>
                    <a href={`mailto:${clinicEmail}`} className="text-xs font-semibold text-slate-800 hover:text-primary-600 transition-colors break-all">
                      {clinicEmail}
                    </a>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-400 block font-normal">Alternative / Appointments:</span>
                    <a href={`mailto:${clinicAltEmail}`} className="text-xs font-semibold text-primary-700 hover:text-primary-800 transition-colors break-all">
                      {clinicAltEmail}
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © {new Date().getFullYear()} {clinicName}. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>HIPAA Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
