import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BusinessHours } from '@/types';
import { Clock, Plus } from 'lucide-react';

export default function BusinessHoursPanel() {
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  async function loadHours() {
    setLoading(true);
    const { data } = await supabase.from('business_hours').select('*').order('weekday', { ascending: true });
    
    if (data && data.length > 0) {
      setHours(data);
    } else {
      // Initialize if empty
      const initial = days.map((_, i) => ({
        weekday: i,
        is_open: i > 0 && i < 6, // Mon-Fri open by default
        start_time: '09:00:00',
        end_time: '17:00:00'
      }));
      setHours(initial as any);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadHours();
  }, []);

  const handleChange = (index: number, field: keyof BusinessHours, value: any) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], [field]: value };
    setHours(newHours);
  };

  const handleSave = async () => {
    setSaving(true);
    // Upsert logic (insert or update)
    // Actually, since we might be initializing, let's just insert with primary key conflicts or doing updates if they have IDs.
    
    for (const h of hours) {
      if (h.id) {
        await supabase.from('business_hours').update({
          is_open: h.is_open,
          start_time: h.start_time,
          end_time: h.end_time
        }).eq('id', h.id);
      } else {
        await supabase.from('business_hours').insert([h]);
      }
    }
    
    await loadHours();
    setSaving(false);
    alert('Business hours saved successfully.');
  };

  if (loading) return <div className="p-8">Loading business hours...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-32">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-slate-900">Business Hours</h1>
        <p className="text-slate-500 mt-1">Set the clinic's regular operating hours. This determines available time slots for patients.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
          <Clock className="w-5 h-5 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Weekly Schedule</h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          {hours.map((h, index) => (
            <div key={h.weekday} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4 sm:w-1/3">
                <input 
                  type="checkbox" 
                  checked={h.is_open} 
                  onChange={e => handleChange(index, 'is_open', e.target.checked)}
                  className="w-5 h-5 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                />
                <span className="font-medium text-slate-900">{days[h.weekday]}</span>
              </div>
              
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                {h.is_open ? (
                  <>
                    <input 
                      type="time" 
                      value={h.start_time.substring(0,5)}
                      onChange={e => handleChange(index, 'start_time', e.target.value + ':00')}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 text-sm"
                    />
                    <span className="text-slate-400 font-medium">to</span>
                    <input 
                      type="time" 
                      value={h.end_time.substring(0,5)}
                      onChange={e => handleChange(index, 'end_time', e.target.value + ':00')}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 text-sm"
                    />
                  </>
                ) : (
                  <div className="text-sm text-slate-400 font-medium px-4 py-2 bg-slate-100 rounded-xl w-full text-center">Closed</div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-70 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
