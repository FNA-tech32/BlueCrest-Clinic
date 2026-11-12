import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Service } from '@/types';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, Check, Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

import newServiceImage from '@/assets/images/regenerated_image_1781780816729.png';
import serviceImage2 from '@/assets/images/regenerated_image_1781781242962.png';
import serviceImage5 from '@/assets/images/regenerated_image_1781781248187.png';

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    async function loadServices() {
      const { data } = await supabase.from('services').select('*').eq('is_active', true).order('created_at', { ascending: true });
      if (data) setServices(data);
    }
    loadServices();
  }, []);

  const visuals = [
    newServiceImage,
    serviceImage2,
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=1974&auto=format&fit=crop',
    serviceImage5,
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop',
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2070&auto=format&fit=crop" 
            alt="Blue Crest Clinic" 
            className="w-full h-full object-cover object-center opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 max-w-7xl">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                Accepting New Patients • Blue Crest Clinic
              </div>
              <h1 className="text-5xl lg:text-7xl font-serif font-medium text-slate-900 leading-tight mb-6">
                Exceptional dental care for a <span className="text-primary-600">healthy smile.</span>
              </h1>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl">
                Welcome to Blue Crest Clinic. Experience premium, comfortable dentistry in a state-of-the-art clinic. We focus on prevention, personalized treatments, and your overall well-being.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link 
                  to="/booking" 
                  className="inline-flex items-center justify-center rounded-full bg-primary-600 px-8 py-4 text-base font-medium text-white shadow-lg shadow-primary-600/30 hover:bg-primary-700 hover:shadow-xl hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Appointment
                </Link>
                <a 
                  href="#services" 
                  className="inline-flex items-center justify-center rounded-full bg-white border border-slate-200 px-8 py-4 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all focus:outline-none"
                >
                  View Services
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">Our Services</h2>
            <p className="text-slate-600">Comprehensive dental care tailored to your unique needs, from routine checkups to advanced cosmetic treatments.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all group flex flex-col h-full"
              >
                <div className="h-48 overflow-hidden relative">
                   <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                   <img 
                    src={visuals[index % visuals.length]} 
                    alt={service.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-xl font-serif font-semibold text-slate-900 mb-3">{service.name}</h3>
                  <p className="text-slate-500 text-sm mb-6 flex-grow">{service.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Clock className="w-4 h-4 text-primary-500" />
                      <span>{service.duration_minutes} min</span>
                    </div>
                    <div className="font-semibold text-slate-900">
                      ${service.price}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {services.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                Loading services...
              </div>
            )}
          </div>
          
          <div className="mt-16 text-center">
             <Link 
                to="/booking" 
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Schedule your visit <ChevronRight className="ml-2 w-4 h-4" />
              </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="w-full lg:w-1/2 relative">
               <div className="absolute -inset-4 bg-primary-50 rounded-3xl transform -rotate-3 z-0"></div>
               <img 
                src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070&auto=format&fit=crop" 
                alt="Blue Crest Clinic Dental Team" 
                className="relative z-10 w-full h-[600px] object-cover rounded-3xl shadow-2xl"
              />
              {/* Floating Badge */}
              <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl z-20 hidden md:block border border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-serif text-slate-900">15+</div>
                    <div className="text-sm font-medium text-slate-500">Years Experience</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-6">A modern approach to comprehensive dentistry.</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                At Blue Crest Clinic, we believe that visiting the dentist shouldn't be stressful. Our clinic utilizes modern technology and a gentle approach to provide a relaxing, premium experience from the moment you walk through our doors.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  'State-of-the-art diagnostic technology',
                  'Comfortable, anxiety-free environment',
                  'Transparent pricing and treatment plans',
                  'Highly trained and compassionate specialists'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                to="/booking" 
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Book your consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Location Strip */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-primary-400 font-semibold text-xs tracking-wider uppercase mb-2 block">Reach Out Today</span>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-white mb-4">Contact Blue Crest Clinic</h2>
            <p className="text-slate-400 text-sm">We are here to answer questions, discuss treatment plans, or assist with appointment scheduling.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Phone Card */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center mb-4">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base mb-1">Phone Lines</h3>
                <p className="text-xs text-slate-400 mb-4">Direct consultation and emergency response.</p>
              </div>
              <div className="space-y-2 border-t border-slate-700/60 pt-4">
                <div>
                  <span className="text-[11px] text-slate-400 block">Primary line:</span>
                  <a href="tel:+15552483273" className="text-sm font-semibold text-primary-300 hover:text-white transition-colors">
                    +1 (555) 248-3273
                  </a>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Alt / 24/7 Hotline:</span>
                  <a href="tel:+15559876543" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                    +1 (555) 987-6543
                  </a>
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center mb-4">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base mb-1">Email Support</h3>
                <p className="text-xs text-slate-400 mb-4">Fast email response within 2 business hours.</p>
              </div>
              <div className="space-y-2 border-t border-slate-700/60 pt-4">
                <div>
                  <span className="text-[11px] text-slate-400 block">General inquiries:</span>
                  <a href="mailto:info@bluecrestclinic.com" className="text-xs font-semibold text-primary-300 hover:text-white transition-colors break-all">
                    info@bluecrestclinic.com
                  </a>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Alternative / Appointments:</span>
                  <a href="mailto:appointments@bluecrestclinic.com" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors break-all">
                    appointments@bluecrestclinic.com
                  </a>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base mb-1">Location</h3>
                <p className="text-xs text-slate-400 mb-4">Conveniently situated in the medical plaza.</p>
              </div>
              <div className="border-t border-slate-700/60 pt-4 text-xs text-slate-300 leading-relaxed">
                <span className="font-medium text-white block">Blue Crest Clinic</span>
                742 Blue Crest Boulevard, Suite 300<br />
                Metro City, NY 10001
              </div>
            </div>

            {/* Hours Card */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-base mb-1">Clinic Hours</h3>
                <p className="text-xs text-slate-400 mb-4">Flexible scheduling to fit your routine.</p>
              </div>
              <div className="border-t border-slate-700/60 pt-4 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Mon – Fri:</span>
                  <span className="font-medium text-white">8:00 AM – 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span className="font-medium text-white">9:00 AM – 3:00 PM</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Sunday:</span>
                  <span>Emergency On-Call</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
