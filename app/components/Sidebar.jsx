'use client';

import React from 'react';
import Link from 'next/link';

const actions = [
  { label: 'Create Event', icon: 'bi-calendar-plus', link: '/organizer/event' },
  { label: 'View Events', icon: 'bi-list-ul', link: '/organizer/myevents' },
  { label: 'Manage Events', icon: 'bi-person-check', link: '/organizer/manage-events' },
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

const OrganizerSidebar = ({ open, toggleSidebar }) => (
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
    </ul>
  </div>
);

export default OrganizerSidebar;
