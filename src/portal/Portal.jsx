import React, { useState } from 'react';
import { ThemeProvider } from './ThemeContext';
import PortalLayout from './PortalLayout';
import { InternDashboard } from './InternDashboard';
import { AdminDashboard } from './AdminDashboard';
import { SuperAdminDashboard } from './SuperAdminDashboard';

const ROLE_DEFAULT_PAGE = {
  intern: 'dashboard',
  admin: 'dashboard',
  super_admin: 'dashboard',
};

function PortalInner({ user, onLogout }) {
  const role = user.role || 'intern';
  const [activePage, setActivePage] = useState(ROLE_DEFAULT_PAGE[role] || 'dashboard');

  const renderContent = () => {
    switch (role) {
      case 'intern':
        return <InternDashboard user={user} activePage={activePage} />;
      case 'admin':
        return <AdminDashboard user={user} activePage={activePage} />;
      case 'super_admin':
        return <SuperAdminDashboard user={user} activePage={activePage} />;
      default:
        return <InternDashboard user={user} activePage={activePage} />;
    }
  };

  return (
    <PortalLayout user={user} onLogout={onLogout} activePage={activePage} setActivePage={setActivePage}>
      {renderContent()}
    </PortalLayout>
  );
}

export default function Portal({ user, onLogout }) {
  return (
    <ThemeProvider>
      <PortalInner user={user} onLogout={onLogout} />
    </ThemeProvider>
  );
}

