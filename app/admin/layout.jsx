'use client';

import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout({ children }) {
  const sidebarWidth = 240; // consistent width

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarWidth,
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          backgroundColor: '#1f1f2e',
          color: '#fff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
        }}
      >
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: sidebarWidth,
          padding: '2rem',
          width: `calc(100% - ${sidebarWidth}px)`,
          backgroundColor: '#f8f9fa',
        }}
      >
        {children}
      </div>
    </div>
  );
}
