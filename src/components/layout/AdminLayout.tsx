import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, Calendar, Stethoscope, Clock, ShieldAlert, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdmin(session?.user?.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdmin(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAdmin(userId?: string) {
    if (!userId) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from('admin_users').select('id').eq('user_id', userId).single();
    if (data) setIsAdmin(true);
    setLoading(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-sans tracking-tight">Authenticating...</div>;

  if (!session) return <Navigate to="/admin/login" replace />;

  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center font-sans space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Access Denied</h2>
        <p className="text-slate-600">You are signed in, but you are not authorized as an admin.</p>
        <button onClick={handleLogout} className="px-4 py-2 bg-slate-100 rounded-md hover:bg-slate-200 text-sm font-medium">Sign Out</button>
      </div>
    );
  }

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/admin/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/admin/services', icon: Stethoscope, label: 'Services' },
    { to: '/admin/business-hours', icon: Clock, label: 'Business Hours' },
    { to: '/admin/blocked-dates', icon: ShieldAlert, label: 'Blocked Dates' },
    { to: '/admin/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
             <Stethoscope className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-base font-bold text-slate-900 leading-tight">Blue Crest</span>
            <span className="text-[10px] uppercase font-semibold text-primary-600 tracking-wider">Admin Portal</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="p-4 border-t border-slate-100">
           <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full">
              <LogOut className="w-4 h-4" />
              Sign Out
           </button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-y-auto w-full">
        {/* Mobile Nav Top Bar could go here if needed, but keeping it simple */}
        <Outlet />
      </main>
    </div>
  );
}
