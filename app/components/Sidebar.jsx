import React from 'react'
import Link from 'next/link';

const actions = [
  { label: 'Upload Guest List', icon: 'bi-upload', link: '/organizer/myevents' },
  { label: 'Create Event', icon: 'bi-calendar-plus', link: '/organizer/event' },
  
  { label: 'Create Seating', icon: 'bi-grid-3x3-gap' },
  { label: 'View Events', icon: 'bi-list-ul', link: '/organizer/myevents' },
  { label: 'View RSVP Responses', icon: 'bi-person-check' }
];

const sidebarStyle = (open) => ({
  width: open ? 200 : 60,
  transition: 'width 0.3s',
  overflow: 'hidden',
  background: '#222',
  color: '#fff',
  height: '100vh',
  position: 'relative',
  paddingTop: '1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: open ? 'flex-start' : 'center'
});

const iconStyle = {
  fontSize: 24,
  marginRight: 16
};

const OrganizerSidebar = ({ open, toggleSidebar }) => (
  <div style={sidebarStyle(open)}>
    <button
      onClick={toggleSidebar}
      style={{
        background: 'none',
        border: 'none',
        color: '#fff',
        marginBottom: 30,
        cursor: 'pointer',
        alignSelf: open ? 'flex-end' : 'center'
      }}
      aria-label="Toggle sidebar"
    >
      <i className={`bi ${open ? 'bi-chevron-left' : 'bi-chevron-right'}`} style={{ fontSize: 20 }} />
    </button>
    <ul style={{ listStyle: 'none', padding: 0, width: '100%' }}>
      {actions.map((action) => (
        <li
          key={action.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: open ? '10px 16px' : '10px 0',
            cursor: 'pointer',
            justifyContent: open ? 'flex-start' : 'center'
          }}
        >
        <Link href={action.link || '#'} style={{ textDecoration: 'none', color: '#fff', width: '100%' }}>
          <i className={`bi ${action.icon}`} style={iconStyle}></i>
          {open && <span>{action.label}</span>}
        </Link>
      </li>
      ))}
    </ul>
  </div>
);

export default OrganizerSidebar;