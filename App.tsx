import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { SystemProvider } from './context/SystemContext';
import { Home } from './pages/Home';
import { CustomerView } from './pages/customer/CustomerView';
import { OperatorDashboard } from './pages/operator/OperatorDashboard';
import { KioskView } from './pages/kiosk/KioskView';
import { AdminDashboard } from './pages/admin/AdminDashboard';

const App: React.FC = () => {
  return (
    <SystemProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/customer" element={<CustomerView />} />
          <Route path="/operator" element={<OperatorDashboard />} />
          <Route path="/kiosk" element={<KioskView />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </SystemProvider>
  );
};

export default App;