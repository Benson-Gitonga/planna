'use client';

import AdminSidebar from '../components/AdminSidebar';
import { useState } from 'react';

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={styles.dashboardContainer}>
      <AdminSidebar open={open} setOpen={setOpen} />
      <main
        style={{
          ...styles.mainContent,
          marginLeft: open ? 220 : 70,
        }}
      >
        {children}
      </main>
    </div>
  );
}

const styles = {
  dashboardContainer: {
    display: 'flex',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
  },
  mainContent: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    transition: 'margin 0.3s ease-in-out',
    padding: '1.5rem',
    overflowY: 'auto',
  },
};
