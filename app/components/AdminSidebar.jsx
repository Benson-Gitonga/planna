'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', icon: 'bi-speedometer2', link: '/admin' },
  { label: 'Add Organizer', icon: 'bi-person-plus', link: '/admin/add-account' },
  { label: 'Manage Accounts', icon: 'bi-person-gear', link: '/admin/manage-accounts' },
  { label: 'Manage Events', icon: 'bi-calendar-check', link: '/admin/manage-events' },
  { label: 'Statistics', icon: 'bi-bar-chart-line', link: '/admin/statistics' }
];

const sidebarStyle = (open) => ({
  width: open ? 220 : 70,
  transition: 'width 0.3s cubic-bezier(.4,1.3,.6,1)',
  background: '#1f1f2e',
  color: '#fff',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  paddingTop: '1rem',
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

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false); // default to collapsed

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
      <h4 className="text-white mb-4" style={{
        marginLeft: open ? 24 : 0,
        fontSize: open ? 22 : 0,
        height: open ? 'auto' : 0,
        opacity: open ? 1 : 0,
        transition: 'all 0.3s'
      }}>
        Admin Panel
      </h4>
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
                transition: 'all 0.2s'
              }}
            >
              <i className={`bi ${icon}`} style={iconStyle}></i>
              {open && <span style={{ transition: 'opacity 0.2s' }}>{label}</span>}
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
            transition: 'all 0.2s'
          }}>
            <i className="bi bi-box-arrow-right" style={iconStyle}></i>
            {open && <span style={{ transition: 'opacity 0.2s' }}>Logout</span>}
          </div>
        </li>
      </ul>
      <style jsx global>{`
        .sidebar-item:hover {
          background: #23272b;
          color: #00e0b8 !important;
          transform: scale(1.06);
          box-shadow: 0 2px 12px rgba(0,224,184,0.10);
          z-index: 2;
        } 
        .sidebar-item:hover i {
          color: #00e0b8 !important;
        }
        .sidebar-item {
          transition:
            background 0.2s,
            color 0.2s,
            transform 0.18s cubic-bezier(.4,1.3,.6,1),
            box-shadow 0.18s cubic-bezier(.4,1.3,.6,1);
        }
      `}</style>
    </div>
  );
}