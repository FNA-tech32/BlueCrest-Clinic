import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ClinicSettings } from '@/types';
import { Settings as SettingsIcon } from 'lucide-react';

export default function ClinicSettingsPanel() {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadSettings() {
    setLoading(true);
    const { data } = await supabase.from('clinic_settings').select('*').limit(1).single();
    if (data) {
      setSettings(data);
    } else {
      setSettings({
        clinic_name: 'Blue Crest Clinic',
        clinic_email: 'info@bluecrestclinic.com',
        clinic_phone: '+1 (555) 248-3273',
        clinic_address: '742 Blue Crest Boulevard, Suite 300, Metro City, NY 10001',
        slot_interval_minutes: 30,
        booking_notice_hours: 24,
      } as ClinicSettings);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    
    if (settings.id) {
      await supabase.from('clinic_settings').update({
        clinic_name: settings.clinic_name,
        clinic_email: settings.clinic_email,
        clinic_phone: settings.clinic_phone,
        clinic_address: settings.clinic_address,
        slot_interval_minutes: settings.slot_interval_minutes,
        booking_notice_hours: settings.booking_notice_hours,
      }).eq('id', settings.id);
    } else {
      await supabase.from('clinic_settings').insert([{
        clinic_name: settings.clinic_name,
        clinic_email: settings.clinic_email,
        clinic_phone: settings.clinic_phone,
        clinic_address: settings.clinic_address,
        slot_interval_minutes: settings.slot_interval_minutes,
        booking_notice_hours: settings.booking_notice_hours,
      }]);
    }
    
    alert('Settings saved successfully.');
    setSaving(false);
  };

  if (loading || !settings) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-32">
      <div className="mb-8 flex items-center gap-3">
        <h1 className="text-2xl font-serif font-bold text-slate-900">Clinic Settings</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
           <SettingsIcon className="w-5 h-5 text-slate-500" />
           <h2 className="font-semibold text-slate-900">General Configuration</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">Public Clinic Details</h3>
              <p className="text-xs text-slate-500 mt-1">Configure primary identity and contact details displayed to patients across Blue Crest Clinic portals.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Name</label>
                <input 
                  type="text" 
                  required
                  value={settings.clinic_name}
                  onChange={e => setSettings({...settings, clinic_name: e.target.value})}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                <input 
                  type="email" 
                  required
                  value={settings.clinic_email}
                  onChange={e => setSettings({...settings, clinic_email: e.target.value})}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Alternative/Appointments email: appointments@bluecrestclinic.com</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  value={settings.clinic_phone}
                  onChange={e => setSettings({...settings, clinic_phone: e.target.value})}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Alternative / 24/7 Hotline: +1 (555) 987-6543</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Physical Address</label>
                <input 
                  type="text" 
                  required
                  value={settings.clinic_address}
                  onChange={e => setSettings({...settings, clinic_address: e.target.value})}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">Booking Engine</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slot Interval (minutes)</label>
                <p className="text-xs text-slate-500 mb-2">How frequently slots appear (e.g. 30 means slots at 9:00, 9:30, 10:00).</p>
                <input 
                  type="number" 
                  required
                  min="5"
                  step="5"
                  value={settings.slot_interval_minutes}
                  onChange={e => setSettings({...settings, slot_interval_minutes: parseInt(e.target.value)})}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Booking Notice (hours)</label>
                <p className="text-xs text-slate-500 mb-2">Minimum advance notice required for online booking.</p>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={settings.booking_notice_hours}
                  onChange={e => setSettings({...settings, booking_notice_hours: parseInt(e.target.value)})}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-70 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
