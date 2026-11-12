import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BlockedDate } from '@/types';
import { format, parseISO } from 'date-fns';
import { Trash2, Plus } from 'lucide-react';

export default function BlockedDatesPanel() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');

  async function loadBlockedDates() {
    setLoading(true);
    const { data } = await supabase.from('blocked_dates').select('*').order('blocked_date', { ascending: true });
    if (data) setBlockedDates(data);
    setLoading(false);
  }

  useEffect(() => {
    loadBlockedDates();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    setSaving(true);
    
    await supabase.from('blocked_dates').insert([{
      blocked_date: newDate,
      reason: newReason
    }]);

    setNewDate('');
    setNewReason('');
    await loadBlockedDates();
    setSaving(false);
  };

  const handleRemove = async (id: string) => {
    await supabase.from('blocked_dates').delete().eq('id', id);
    loadBlockedDates();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-slate-900">Blocked Dates</h1>
        <p className="text-slate-500 mt-1">Prevent patients from booking appointments on specific days (holidays, staff training, etc).</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
         <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-semibold text-slate-900">Add New Blocked Date</h2>
        </div>
        <form onSubmit={handleAdd} className="p-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-auto flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input 
              type="date" 
              required
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <div className="w-full md:w-auto flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Christmas Day"
              value={newReason}
              onChange={e => setNewReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <button 
            type="submit" 
            disabled={saving || !newDate}
            className="w-full md:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center justify-center shrink-0"
          >
             <Plus className="w-4 h-4 mr-1.5" /> Block Date
          </button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-semibold text-slate-900">Currently Blocked</h2>
        </div>
        
        {blockedDates.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No dates are currently blocked.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {blockedDates.map(bd => (
              <div key={bd.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div>
                  <div className="font-medium text-slate-900 mb-1">{format(parseISO(bd.blocked_date), 'EEEE, MMMM d, yyyy')}</div>
                  {bd.reason && <div className="text-sm text-slate-500">{bd.reason}</div>}
                </div>
                <button 
                  onClick={() => handleRemove(bd.id)}
                  className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                  title="Remove block"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
