import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Appointment, Service } from '@/types';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Mail, Phone, Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function AppointmentsPanel() {
  const [appointments, setAppointments] = useState<(Appointment & { service: Service })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  async function loadAppointments() {
    setLoading(true);
    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select('*, service:services(*)')
      .order('appointment_date', { ascending: false })
      .order('start_time', { ascending: false });

    if (appointmentsData) {
      setAppointments(appointmentsData as any);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
    if (!error) {
      loadAppointments();
    } else {
      alert('Failed to update status');
    }
  };

  const filteredAppts = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Appointments</h1>
          <p className="text-slate-500 mt-1">Manage all clinic bookings and patient requests.</p>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
            <button
               key={f}
               onClick={() => setFilter(f)}
               className={cn(
                 "px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors border",
                 filter === f 
                   ? "bg-slate-900 border-slate-900 text-white" 
                   : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
               )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading appointments...</div>
        ) : filteredAppts.length === 0 ? (
           <div className="p-12 text-center text-slate-500">No appointments found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAppts.map(appt => (
              <div key={appt.id} className="p-6 md:p-8 flex flex-col xl:flex-row xl:items-center gap-6 hover:bg-slate-50/50 transition-colors">
                
                {/* Patient Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900 text-lg">{appt.full_name}</h3>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider",
                      appt.status === 'pending' && "bg-amber-100 text-amber-700",
                      appt.status === 'confirmed' && "bg-blue-100 text-blue-700",
                      appt.status === 'completed' && "bg-emerald-100 text-emerald-700",
                      appt.status === 'cancelled' && "bg-slate-100 text-slate-600"
                    )}>
                      {appt.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {appt.email}</div>
                    <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {appt.phone}</div>
                  </div>
                  {appt.notes && (
                    <div className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="font-medium text-slate-900">Notes:</span> {appt.notes}
                    </div>
                  )}
                </div>

                {/* Date & Service Info */}
                <div className="xl:w-64 shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="font-medium text-slate-900 mb-2 truncate">{appt.service?.name || 'Unknown Service'}</div>
                  <div className="text-sm text-slate-600 space-y-1.5">
                    <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-slate-400" /> {format(parseISO(appt.appointment_date), 'MMM d, yyyy')}</div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> {format(parseISO(`1970-01-01T${appt.start_time}`), 'h:mm a')}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="xl:w-48 shrink-0 flex flex-col gap-2">
                  <select
                    value={appt.status}
                    onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                    className="block w-full text-sm border-slate-200 rounded-lg py-2 pl-3 pr-8 focus:ring-primary-500 focus:border-primary-500 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
