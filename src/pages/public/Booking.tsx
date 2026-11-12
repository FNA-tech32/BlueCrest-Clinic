import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Service, BusinessHours, BlockedDate, ClinicSettings, Appointment } from '@/types';
import { format, addMinutes, parse, isBefore, isSameDay, startOfDay, addHours, addDays } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Check, ChevronRight, ChevronLeft, User, Mail, Phone, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Booking() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: Date, end: Date, label: string } | null>(null);
  
  const [availableSlots, setAvailableSlots] = useState<{ start: Date, end: Date, label: string }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [
        { data: srvData },
        { data: bhData },
        { data: bdData },
        { data: setData }
      ] = await Promise.all([
        supabase.from('services').select('*').eq('is_active', true).order('created_at', { ascending: true }),
        supabase.from('business_hours').select('*'),
        supabase.from('blocked_dates').select('*'),
        supabase.from('clinic_settings').select('*').limit(1).single()
      ]);

      if (srvData) setServices(srvData);
      if (bhData) setBusinessHours(bhData);
      if (bdData) setBlockedDates(bdData);
      if (setData) setSettings(setData);
      
      setLoading(false);
    }
    loadData();
  }, []);

  // Recalculate slots when date or service changes
  useEffect(() => {
    if (!selectedService || !settings || !selectedDate) return;

    async function calculateSlots() {
      setSlotsLoading(true);
      const weekday = selectedDate.getDay();
      const hours = businessHours.find(h => h.weekday === weekday);
      
      if (!hours || !hours.is_open) {
        setAvailableSlots([]);
        setSlotsLoading(false);
        return;
      }

      // Check if blocked
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      if (blockedDates.some(b => b.blocked_date === dateStr)) {
        setAvailableSlots([]);
        setSlotsLoading(false);
        return;
      }

      // Fetch appointments for this date
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', dateStr)
        .neq('status', 'cancelled');

      const existingAppointments = appointments || [];

      // Generate slots
      const slots: { start: Date, end: Date, label: string }[] = [];
      const startTime = parse(hours.start_time, 'HH:mm:ss', selectedDate);
      const endTime = parse(hours.end_time, 'HH:mm:ss', selectedDate);
      
      const interval = settings!.slot_interval_minutes || 30;
      const duration = selectedService!.duration_minutes;
      
      const now = new Date();
      const noticeLimit = addHours(now, settings!.booking_notice_hours || 24);

      let currentSlotStart = startTime;
      
      while (isBefore(addMinutes(currentSlotStart, duration), endTime) || addMinutes(currentSlotStart, duration).getTime() === endTime.getTime()) {
        const slotEnd = addMinutes(currentSlotStart, duration);
        
        // Ensure notice limit
        if (isBefore(currentSlotStart, noticeLimit)) {
          currentSlotStart = addMinutes(currentSlotStart, interval);
          continue;
        }

        // Check overlap
        const hasOverlap = existingAppointments.some(app => {
          const appStart = parse(app.start_time, 'HH:mm:ss', selectedDate);
          const appEnd = parse(app.end_time, 'HH:mm:ss', selectedDate);
          return (currentSlotStart < appEnd && slotEnd > appStart);
        });

        if (!hasOverlap) {
          slots.push({
            start: currentSlotStart,
            end: slotEnd,
            label: format(currentSlotStart, 'h:mm a')
          });
        }
        currentSlotStart = addMinutes(currentSlotStart, interval);
      }

      setAvailableSlots(slots);
      setSlotsLoading(false);
    }
    
    calculateSlots();
    setSelectedTimeSlot(null);
  }, [selectedDate, selectedService, businessHours, blockedDates, settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedTimeSlot) return;
    setSubmitting(true);

    const appointment_date = format(selectedDate, 'yyyy-MM-dd');
    const start_time = format(selectedTimeSlot.start, 'HH:mm:ss');
    const end_time = format(selectedTimeSlot.end, 'HH:mm:ss');

    const { error } = await supabase.from('appointments').insert([{
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes,
      service_id: selectedService.id,
      appointment_date,
      start_time,
      end_time,
      status: 'pending'
    }]);

    setSubmitting(false);
    if (!error) {
      setStep(4); // Success!
    } else {
      alert('Error creating appointment: ' + error.message);
    }
  };

  // Setup simple calendar calendar helper
  const dateOptions = useMemo(() => {
    const dates = [];
    const today = startOfDay(new Date());
    for(let i=0; i<14; i++) {
        dates.push(addDays(today, i));
    }
    return dates;
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-sans">Loading booking experience...</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 lg:py-24 font-sans">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-wider font-semibold text-primary-600 mb-2 block">Blue Crest Clinic Online Portal</span>
          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">Book your appointment</h1>
          <p className="text-slate-600">Select a service, choose a time that works for you, and our specialists will be ready for your visit.</p>
        </div>

        {/* Stepper */}
        {step < 4 && (
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300",
                    step > s ? "bg-primary-600 text-white" : step === s ? "bg-slate-900 text-white ring-4 ring-slate-200" : "bg-slate-200 text-slate-500"
                  )}>
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={cn(
                      "h-1 w-12 md:w-24 ml-4 md:ml-8 rounded-full transition-colors duration-300",
                      step > s ? "bg-primary-600" : "bg-slate-200"
                    )} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-12 md:gap-[4.5rem] mt-3">
              <span className={cn("text-xs font-medium", step >= 1 ? "text-slate-900" : "text-slate-500")}>Service</span>
              <span className={cn("text-xs font-medium", step >= 2 ? "text-slate-900" : "text-slate-500")}>Time</span>
              <span className={cn("text-xs font-medium", step >= 3 ? "text-slate-900" : "text-slate-500")}>Details</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-serif font-medium text-slate-900 border-b border-slate-100 pb-4">Select a Service</h2>
                <div className="grid gap-4">
                  {services.map(service => (
                    <div 
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={cn(
                        "p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4",
                        selectedService?.id === service.id ? "border-primary-500 bg-primary-50/50" : "border-slate-100 hover:border-primary-200 hover:bg-slate-50"
                      )}
                    >
                      <div>
                        <h3 className="font-medium text-slate-900 text-lg mb-1">{service.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-1">{service.description}</p>
                      </div>
                      <div className="flex items-center gap-6 sm:shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-100">
                          <Clock className="w-4 h-4 text-primary-500" />
                          {service.duration_minutes} min
                        </div>
                        <div className="font-semibold text-slate-900">
                          ${service.price}
                        </div>
                      </div>
                    </div>
                  ))}
                  {services.length === 0 && (
                    <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl">No active services available.</div>
                  )}
                </div>
                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => setStep(2)} 
                    disabled={!selectedService}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Continue <ChevronRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <h2 className="text-xl font-serif font-medium text-slate-900 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary-600" /> Date & Time
                  </h2>
                  <button onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full transition-colors flex items-center">
                     <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h3 className="font-medium text-slate-900 mb-4 text-sm uppercase tracking-wide">Select Date</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-2">
                      {dateOptions.map((date, idx) => {
                        const isSelected = isSameDay(date, selectedDate);
                        const dayName = format(date, 'E');
                        const dayNumber = format(date, 'd');
                        const month = format(date, 'MMM');
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedDate(date)}
                            className={cn(
                              "p-3 rounded-2xl border transition-all flex flex-col items-center justify-center",
                              isSelected 
                                ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                            )}
                          >
                            <span className={cn("text-xs font-medium mb-1", isSelected ? "text-slate-300" : "text-slate-400")}>{dayName}</span>
                            <span className="text-lg font-semibold">{dayNumber}</span>
                            <span className={cn("text-[10px] uppercase font-bold tracking-wider", isSelected ? "text-slate-300" : "text-slate-400")}>{month}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                     <h3 className="font-medium text-slate-900 mb-4 text-sm uppercase tracking-wide">Available Times</h3>
                     {slotsLoading ? (
                       <div className="flex justify-center py-12">
                         <div className="animate-pulse flex gap-2">
                           <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                           <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                           <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                         </div>
                       </div>
                     ) : availableSlots.length > 0 ? (
                       <div className="grid grid-cols-2 gap-3 h-[300px] overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-slate-200">
                         {availableSlots.map((slot, idx) => (
                           <button
                             key={idx}
                             onClick={() => setSelectedTimeSlot(slot)}
                             className={cn(
                               "py-3 px-4 rounded-xl text-sm font-medium border transition-all text-center",
                               selectedTimeSlot?.start.getTime() === slot.start.getTime()
                                 ? "bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-600/20"
                                 : "bg-white border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50/50"
                             )}
                           >
                             {slot.label}
                           </button>
                         ))}
                       </div>
                     ) : (
                       <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-500 text-sm">
                         No available slots for this date. <br/>Please select another day.
                       </div>
                     )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center bg-white">
                  <div className="text-sm font-medium text-slate-600">
                    {selectedService?.name} • {format(selectedDate, 'MMM d')}
                  </div>
                  <button 
                    onClick={() => setStep(3)} 
                    disabled={!selectedTimeSlot}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Continue <ChevronRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <h2 className="text-xl font-serif font-medium text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-600" /> Patient Details
                  </h2>
                   <button onClick={() => setStep(2)} className="text-sm text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full transition-colors flex items-center">
                     <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900 mb-1">{selectedService?.name}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900 mb-1">{selectedTimeSlot?.label}</div>
                    <div className="text-sm text-slate-500 font-medium">${selectedService?.price}</div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                     <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        required 
                        value={formData.full_name}
                        onChange={e => setFormData({...formData, full_name: e.target.value})}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors sm:text-sm bg-white" 
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-slate-400" />
                        </div>
                        <input 
                          type="email" 
                          required 
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors sm:text-sm bg-white" 
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-slate-400" />
                        </div>
                        <input 
                          type="tel" 
                          required 
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors sm:text-sm bg-white" 
                          placeholder="(555) 248-3273"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Additional Notes (Optional)</label>
                    <div className="relative">
                      <div className="absolute top-3 left-3.5 pointer-events-none">
                        <FileText className="h-4 w-4 text-slate-400" />
                      </div>
                      <textarea 
                        rows={3}
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors sm:text-sm bg-white" 
                        placeholder="Any specific concerns or requests?"
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center rounded-full bg-primary-600 px-8 py-3.5 text-sm font-medium text-white shadow-md hover:bg-primary-700 hover:shadow-lg disabled:opacity-70 disabled:cursor-wait transition-all w-full sm:w-auto"
                    >
                      {submitting ? 'Confirming...' : 'Confirm Appointment'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner">
                  <Check className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-serif font-semibold text-slate-900 mb-4">You're all set!</h2>
                <p className="text-slate-600 mb-6 max-w-md mx-auto text-lg">
                  Your appointment for <span className="font-semibold text-slate-800">{selectedService?.name}</span> has been successfully requested. We will review it shortly.
                </p>
                
                <div className="bg-primary-50/60 border border-primary-100 rounded-2xl p-4 max-w-md mx-auto mb-8 text-xs text-slate-600 text-left">
                  <p className="font-semibold text-slate-900 mb-1">Need assistance or urgent rescheduling?</p>
                  <p className="mb-1">Call Blue Crest Clinic directly at <a href="tel:+15552483273" className="text-primary-700 font-semibold hover:underline">+1 (555) 248-3273</a>.</p>
                  <p>24/7 Emergency Line: <a href="tel:+15559876543" className="text-primary-700 font-semibold hover:underline">+1 (555) 987-6543</a> | Email: <a href="mailto:appointments@bluecrestclinic.com" className="text-primary-700 font-semibold hover:underline">appointments@bluecrestclinic.com</a></p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 max-w-md mx-auto mb-10 text-left">
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div className="text-slate-500">Date</div>
                    <div className="font-medium text-slate-900 text-right">{format(selectedDate, 'MMMM d, yyyy')}</div>
                    
                    <div className="text-slate-500">Time</div>
                    <div className="font-medium text-slate-900 text-right">{selectedTimeSlot?.label}</div>
                    
                    <div className="text-slate-500">Patient</div>
                    <div className="font-medium text-slate-900 text-right">{formData.full_name}</div>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  Return to Home
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
