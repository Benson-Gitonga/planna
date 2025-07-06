'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', icon: 'bi-speedometer2', link: '/admin' },
  { label: 'Add Organizer', icon: 'bi-person-plus', link: '/admin/add-account' },
  { label: 'Manage Accounts', icon: 'bi-person-gear', link: '/admin/manage-accounts' },
  { label: 'Manage Events', icon: 'bi-calendar-check', link: '/admin/manage-events' },
  { label: 'Statistics', icon: 'bi-bar-chart-line', link: '/admin/statistics' },
];

const AdminSidebar = () => {
  const [open, setOpen] = useState(false); // collapsed by default
  const router = useRouter();
  const pathname = usePathname();

  const toggleSidebar = () => setOpen((prev) => !prev);

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/logout', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Logout failed');
      router.push('/');
    } catch (err) {
      alert('Logout failed. Please try again.');
      console.error(err);
    }
  };

  return (
    <div style={sidebarStyle(open)}>
      <button
        onClick={toggleSidebar}
        style={toggleButtonStyle(open)}
        aria-label="Toggle sidebar"
        title={open ? "Collapse sidebar" : "Expand sidebar"}
      >
        <i className={`bi ${open ? 'bi-chevron-left' : 'bi-chevron-right'}`} style={{ fontSize: 22 }} />
      </button>

      <ul style={listStyle}>
        {navItems.map(({ label, icon, link }) => (
          <li key={label} style={listItemStyle(open)} className="sidebar-item">
            <Link
              href={link}
              style={{
                ...linkStyle,
                background: pathname === link ? '#00e0b8' : 'transparent',
                color: pathname === link ? '#23272b' : '#fff',
                fontWeight: pathname === link ? 600 : 400,
                borderRadius: pathname === link ? 8 : 0,
              }}
            >
              <i className={`bi ${icon}`} style={iconStyle}></i>
              {open && <span>{label}</span>}
            </Link>
          </li>
        ))}

        {/* 🚪 Logout */}
        <li style={listItemStyle(open)} className="sidebar-item" onClick={handleLogout}>
          <div style={{
            ...linkStyle,
            background: '#d9534f',
            color: '#fff',
            fontWeight: 600,
            borderRadius: 8,
          }}>
            <i className="bi bi-box-arrow-right" style={iconStyle}></i>
            {open && <span>Logout</span>}
          </div>
        </li>
      </ul>

      <style jsx global>{`
        .sidebar-item:hover {
          background: #23272b;
          color: #00e0b8 !important;
        }
        .sidebar-item:hover i {
          color: #00e0b8 !important;
        }
      `}</style>
    </div>
  );
};

export default AdminSidebar;

// --- Styles ---
const sidebarStyle = (open) => ({
  width: open ? 220 : 70,
  transition: 'width 0.3s cubic-bezier(.4,1.3,.6,1)',
  background: '#1f1f2e',
  color: '#fff',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  paddingTop: '0.5rem',
  boxShadow: '2px 0 10px rgba(0,0,0,0.15)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: open ? 'flex-start' : 'center',
  zIndex: 1000,
});

const toggleButtonStyle = (open) => ({
  background: 'none',
  border: 'none',
  color: '#fff',
  marginBottom: '2rem',
  cursor: 'pointer',
  alignSelf: open ? 'flex-end' : 'center',
  paddingRight: open ? '1rem' : 0,
  transition: 'all 0.3s',
});

const listStyle = {
  listStyle: 'none',
  padding: 0,
  width: '100%',
};

const listItemStyle = (open) => ({
  display: 'flex',
  alignItems: 'center',
  padding: open ? '12px 20px' : '12px 0',
  transition: 'all 0.2s',
  cursor: 'pointer',
  justifyContent: open ? 'flex-start' : 'center',
  color: '#fff',
  width: '100%',
  borderRadius: '8px',
  marginBottom: 4,
  position: 'relative',
});

const linkStyle = {
  textDecoration: 'none',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
};

const iconStyle = {
  fontSize: 20,
  minWidth: 24,
  marginRight: 16,
  transition: 'margin 0.3s',
};
