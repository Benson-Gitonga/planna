'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './sidebar.css';
import Event from '../components/Event'

const links = [
  { label: 'Upload Guest List', href: '/csv', icon: 'bi-upload' },
  { label: 'Create Event', href: '/event', icon: 'bi-calendar-plus' },
  { label: 'Create Seating', href: '/seating', icon: 'bi-grid-3x3-gap' },
  { label: 'View Events', href: '/view-events', icon: 'bi-list-ul' },
  { label: 'View RSVP Responses', href: '/view-rsvp', icon: 'bi-person-check' }
];

export default function OrganizerSidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <div
      className={`organizer-sidebar bg-dark text-white vh-100 position-fixed top-0 start-0 p-4 shadow-lg ${open ? 'sidebar-open' : ''}`}
      style={{ width: '250px', zIndex: 1040 }}
    >

      <div className="d-flex justify-content-end d-lg-none mb-4">
        <button className="btn btn-outline-light btn-sm" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <nav className="d-flex flex-column gap-3">
        {links.map((link, i) => (
          <Link
            key={i}
            href={link.href}
            className={`d-flex align-items-center gap-2 px-2 py-2 rounded text-decoration-none ${pathname === link.href ? 'bg-primary text-white' : 'text-white'}`}
            onClick={onClose}
          >
            <i className={`bi ${link.icon}`}></i>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
