'use client';

import React, { useEffect, useState } from 'react';
import CardItem from '../components/CardItem';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Spinner } from 'react-bootstrap';

const cards = [
  { icon: 'search', label: 'Search Account', link: '/admin/search-account' },
  { icon: 'person-plus', label: 'Add Organizer Account', link: '/admin/add-account' },
  { icon: 'person-gear', label: 'Manage Accounts', link: '/admin/manage-accounts' },
  { icon: 'calendar-check', label: 'Manage Events', link: '/admin/manage-events' },
  { icon: 'bar-chart-line', label: 'View Statistics', link: '/admin/statistics' },
];

export default function Page() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/me', {
          credentials: 'include',
        });

        if (res.status === 401) {
          router.replace('/login'); // Not logged in
          return;
        }

        const data = await res.json();
        if (data.user.role !== 'admin') {
          router.replace('/unauthorized'); // Logged in, but not admin
        }
      } catch (err) {
        console.error('Session check error:', err);
        router.replace('/login');
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router]);

  if (checkingSession) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <h2 className="mb-4 fw-bold text-center">Admin Dashboard</h2>
      <div className="container">
        <div className="row g-4 justify-content-center">
          {cards.map((card, i) => (
            <div key={i} className="col-6 col-md-4 col-lg-2">
              <Link href={card.link} className="text-decoration-none">
                <CardItem icon={card.icon} label={card.label} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
