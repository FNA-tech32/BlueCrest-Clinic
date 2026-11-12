import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Appointment, Service } from '@/types';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

export default function DashboardOverview() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [{ data: appts }, { data: srvs }] = await Promise.all([
        supabase.from('appointments').select('*').order('appointment_date', { ascending: true }),
        supabase.from('services').select('*').eq('is_active', true)
      ]);
      if (appts) setAppointments(appts);
      if (srvs) setServices(srvs);
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) return <div className="p-8">Loading overview...</div>;

  const todayAppts = appointments.filter(a => isToday(parseISO(a.appointment_date)) && a.status !== 'cancelled');
  const pendingAppts = appointments.filter(a => a.status === 'pending');
  const upcomingAppts = appointments.filter(a => isFuture(parseISO(a.appointment_date)) && a.status !== 'cancelled' && a.status !== 'pending');

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back. Here's what's happening at the clinic today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500 mb-1">Today's Appointments</div>
            <div className="text-3xl font-bold text-slate-900">{todayAppts.length}</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
             <Calendar className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500 mb-1">Pending Requests</div>
            <div className="text-3xl font-bold text-slate-900">{pendingAppts.length}</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
             <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500 mb-1">Active Services</div>
            <div className="text-3xl font-bold text-slate-900">{services.length}</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
             <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-medium text-slate-900">Today's Schedule</h3>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[400px]">
            {todayAppts.length > 0 ? todayAppts.map(a => (
              <div key={a.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <div className="font-medium text-slate-900 mb-1">{a.full_name}</div>
                  <div className="text-sm text-slate-500">{format(parseISO(`1970-01-01T${a.start_time}`), 'h:mm a')}</div>
                </div>
                <div className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                  {a.status}
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500 text-sm">No appointments scheduled for today.</div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-medium text-slate-900">Action Needed (Pending)</h3>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[400px]">
             {pendingAppts.length > 0 ? pendingAppts.slice(0, 5).map(a => (
              <div key={a.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-slate-900">{a.full_name}</div>
                  <div className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Pending</div>
                </div>
                <div className="text-sm text-slate-500 mb-1">
                   {format(parseISO(a.appointment_date), 'MMMM d, yyyy')} at {format(parseISO(`1970-01-01T${a.start_time}`), 'h:mm a')}
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500 text-sm">No pending requests right now.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
