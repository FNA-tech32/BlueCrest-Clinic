import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Service } from '@/types';
import { Plus, Edit2, Clock, DollarSign, X } from 'lucide-react';

export default function ServicesPanel() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    price: 0,
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  async function loadServices() {
    setLoading(true);
    const { data } = await supabase.from('services').select('*').order('created_at', { ascending: true });
    if (data) setServices(data);
    setLoading(false);
  }

  useEffect(() => {
    loadServices();
  }, []);

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      duration_minutes: service.duration_minutes,
      price: service.price,
      is_active: service.is_active
    });
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      duration_minutes: 30,
      price: 0,
      is_active: true
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingService) {
      const { error } = await supabase.from('services').update(formData).eq('id', editingService.id);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.from('services').insert([formData]);
      if (error) alert(error.message);
    }

    await loadServices();
    setSaving(false);
    setIsFormOpen(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('services').update({ is_active: !current }).eq('id', id);
    loadServices();
  };

  if (loading && !isFormOpen) return <div className="p-8 pb-32">Loading services...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Clinic Services</h1>
          <p className="text-slate-500 mt-1">Manage the treatments and services offered to patients.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center justify-center rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className={`bg-white rounded-2xl border ${service.is_active ? 'border-primary-100 shadow-sm' : 'border-slate-200 opacity-60'} overflow-hidden flex flex-col transition-all`}>
            <div className="p-6 border-b border-slate-50 flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-900 text-lg line-clamp-1">{service.name}</h3>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${service.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2">{service.description}</p>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-sm font-medium text-slate-700">
              <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {service.duration_minutes}m</div>
              <div>${service.price}</div>
            </div>
            
            <div className="p-2 flex gap-2">
               <button 
                onClick={() => handleEdit(service)}
                className="flex-1 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
               >
                 <Edit2 className="w-3.5 h-3.5" /> Edit
               </button>
               <button 
                onClick={() => toggleActive(service.id, service.is_active)}
                className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${service.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
               >
                 {service.is_active ? 'Deactivate' : 'Activate'}
               </button>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
            No services configured. Click "Add Service" to start.
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-serif font-semibold text-slate-900">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors">
                 <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="e.g. Premium Checkup" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea rows={3} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="Describe the procedure briefly." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
                    <input type="number" required min="5" step="5" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                    <input type="number" required min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                  </div>
                </div>
                <div className="flex items-center pt-2">
                  <input id="is_active" type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded" />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-slate-900">
                    Active (visible to patients)
                  </label>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                 <button type="submit" disabled={saving} className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 disabled:opacity-70 transition-colors">
                   {saving ? 'Saving...' : 'Save Service'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
