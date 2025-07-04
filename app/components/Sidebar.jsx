'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const actions = [
  { label: 'Dashboard', icon: 'bi-house', link: '/organizer' },
  { label: 'Create Event', icon: 'bi-calendar-plus', link: '/organizer/event' },
  { label: 'View Events', icon: 'bi-list-ul', link: '/organizer/myevents' },
  { label: 'Manage Events', icon: 'bi-person-check', link: '/organizer/manage-events' },
  { label: 'Check-in', icon: 'bi-clipboard-check', link: '/organizer/check-in' },
  { label: 'Event Analytics', icon: 'bi-graph-up', link: '/organizer/analytics' },
  { label: 'Upcoming Events', icon: 'bi-calendar-event', link: '/organizer/upcoming-events' },
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

const OrganizerSidebar = () => {
  const [open, setOpen] = useState(false); // default to collapsed
  const router = useRouter();

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
        {actions.map((action) => (
          <li key={action.label} style={listItemStyle(open)} className="sidebar-item">
            <Link href={action.link} style={linkStyle}>
              <i className={`bi ${action.icon}`} style={iconStyle}></i>
              {open && <span style={{ transition: 'opacity 0.2s' }}>{action.label}</span>}
            </Link>
          </li>
        ))}

        {/* 🚪 Logout Option */}
        <li style={listItemStyle(open)} className="sidebar-item" onClick={handleLogout}>
          <div style={linkStyle}>
            <i className="bi bi-box-arrow-right" style={iconStyle}></i>
            {open && <span style={{ transition: 'opacity 0.2s' }}>Logout</span>}
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

export default OrganizerSidebar;
