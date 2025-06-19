"use client";

import React, { useState } from 'react';
import OrganizerSidebar from '../components/sidebar';
import OrganizerTopbar from '../components/Organizertopbar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((open) => !open);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <OrganizerSidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div style={{ flex: 1 }}>
        <OrganizerTopbar />
        <main style={{ padding: '1rem' }}>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
