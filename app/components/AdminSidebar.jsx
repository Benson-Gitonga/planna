'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', icon: 'bi-speedometer2', link: '/admin' },
  { label: 'Add Organizer', icon: 'bi-person-plus', link: '/admin/add-account' },
  { label: 'Manage Accounts', icon: 'bi-person-gear', link: '/admin/manage-accounts' },
  { label: 'Manage Events', icon: 'bi-calendar-check', link: '/admin/manage-events' },
  { label: 'Statistics', icon: 'bi-bar-chart-line', link: '/admin/statistics' }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

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

        {/* 🚪 Logout */}
        <li className="nav-item mt-2">
          <button
            onClick={handleLogout}
            className="nav-link d-flex align-items-center gap-2 text-white px-3 py-2 bg-danger rounded border-0 w-100"
            style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
