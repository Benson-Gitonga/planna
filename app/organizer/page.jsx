'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner, Container, Card, Row, Col, Button } from 'react-bootstrap';
import { FaUserShield, FaCalendarCheck, FaUsers, FaCogs } from 'react-icons/fa';

export default function OrganizerDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/me', {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Not authenticated');
        const data = await res.json();

        if (data.user.role !== 'organizer') throw new Error('Not authorized');

        setUser(data.user);
        setLoading(false);
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
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container className="py-5">
      <Card className="p-4 shadow-sm border-0">
        <h3 className="mb-3 d-flex align-items-center gap-2">
          <FaUserShield className="text-primary" />
          {user ? `Welcome, ${user.firstName} 👋` : 'Welcome, Organizer 👋'}
        </h3>
        <p className="text-muted mb-4">
          This is your event organizer dashboard. Manage your events, guests, and invitations efficiently.
        </p>

        <Row className="g-4">
          {/* Card Items */}
          {/* ...same as before... */}
        </Row>
      </Card>
    </Container>
  );
}
