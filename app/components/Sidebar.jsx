'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const actions = [
  { label: 'Dashboard', icon: 'bi-house', link: '/organizer' },
  { label: 'Create Event', icon: 'bi-calendar-plus', link: '/organizer/event' },
  { label: 'View Events', icon: 'bi-list-ul', link: '/organizer/myevents' },
  { label: 'Manage Events', icon: 'bi-person-check', link: '/organizer/manage-events' },
  { label: 'Seating Arrangement', icon: 'bi-grid-3x3-gap', link: '/organizer/seating' },
  { label: 'Check-in', icon: 'bi-clipboard-check', link: '/organizer/check-in' },
];

const sidebarStyle = (open) => ({
  width: open ? 220 : 70,
  transition: 'width 0.3s ease',
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
};

const OrganizerSidebar = ({ open, toggleSidebar }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/logout', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Logout failed');

      // Redirect to homepage
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
      >
        <i className={`bi ${open ? 'bi-chevron-left' : 'bi-chevron-right'}`} style={{ fontSize: 22 }} />
      </button>

      <ul style={listStyle}>
        {actions.map((action) => (
          <li key={action.label} style={listItemStyle(open)} className="sidebar-item">
            <Link href={action.link} style={linkStyle}>
              <i className={`bi ${action.icon}`} style={iconStyle}></i>
              {open && <span>{action.label}</span>}
            </Link>
          </li>
        ))}

        {/* 🚪 Logout Option */}
        <li style={listItemStyle(open)} className="sidebar-item" onClick={handleLogout}>
          <div style={linkStyle}>
            <i className="bi bi-box-arrow-right" style={iconStyle}></i>
            {open && <span>Logout</span>}
          </div>
        </li>
      </ul>
    </div>
  );
};

export default OrganizerSidebar;
