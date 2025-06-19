'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from 'react-bootstrap/Spinner';

export default function OrganizerDashboard() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Not authenticated');

        const data = await res.json();

        if (data.user.role !== 'organizer') {
          throw new Error('Not authorized');
        }

        setLoading(false); // All checks passed, render dashboard

      } catch (err) {
        console.error('Redirecting due to auth failure:', err.message);
        router.push('/login');
      }
    };

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Checking session...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome to the Organizer Dashboard</h1>
      {/* ...other dashboard components... */}
    </div>
  );
}
