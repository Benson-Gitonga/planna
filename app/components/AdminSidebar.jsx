'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', icon: 'bi-speedometer2', link: '/admin' },
  { label: 'Add Organizer', icon: 'bi-person-plus', link: '/admin/add-account' },
  { label: 'Manage Accounts', icon: 'bi-person-gear', link: '/admin/manage-accounts' },
  { label: 'Manage Events', icon: 'bi-calendar-check', link: '/admin/manage-events' },
  { label: 'Statistics', icon: 'bi-bar-chart-line', link: '/admin/statistics' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="d-flex flex-column h-100 p-3">
      <h4 className="text-white mb-4">Admin Panel</h4>
      <ul className="nav flex-column">
        {navItems.map(({ label, icon, link }) => (
          <li key={label} className="nav-item">
            <Link
              href={link}
              className={`nav-link d-flex align-items-center gap-2 text-white ${
                pathname === link ? 'bg-primary text-white rounded px-3 py-2' : 'px-3 py-2'
              }`}
              style={{ transition: 'all 0.2s ease' }}
            >
              <i className={`bi ${icon}`}></i>
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
