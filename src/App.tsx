import { Routes, Route } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import AdminLayout from '@/components/layout/AdminLayout';

import Home from '@/pages/public/Home';
import Booking from '@/pages/public/Booking';

import Login from '@/pages/admin/Login';
import DashboardOverview from '@/pages/admin/DashboardOverview';
import AppointmentsPanel from '@/pages/admin/AppointmentsPanel';
import ServicesPanel from '@/pages/admin/ServicesPanel';
import BusinessHoursPanel from '@/pages/admin/BusinessHoursPanel';
import BlockedDatesPanel from '@/pages/admin/BlockedDatesPanel';
import ClinicSettingsPanel from '@/pages/admin/ClinicSettingsPanel';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="appointments" element={<AppointmentsPanel />} />
        <Route path="services" element={<ServicesPanel />} />
        <Route path="business-hours" element={<BusinessHoursPanel />} />
        <Route path="blocked-dates" element={<BlockedDatesPanel />} />
        <Route path="settings" element={<ClinicSettingsPanel />} />
      </Route>
    </Routes>
  );
}
