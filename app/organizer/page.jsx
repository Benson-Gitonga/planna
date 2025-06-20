'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Spinner,
  Container,
  Card,
  Row,
  Col,
  Button
} from 'react-bootstrap';
import {
  FaUserShield,
  FaCalendarCheck,
  FaUsers,
  FaCogs
} from 'react-icons/fa';

export default function OrganizerDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
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
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Checking session...</span>
        </Spinner>
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
          {/* Upcoming Events */}
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex flex-column text-center p-4">
                <FaCalendarCheck size={40} className="text-success mb-3" />
                <h5 className="fw-bold mb-2">Upcoming Events</h5>
                <p className="text-muted small mb-3">
                  Browse, edit or cancel your upcoming events.
                </p>
                <div className="mt-auto">
                  <Button variant="outline-success" size="sm" href="/organizer/manage-events">
                    Manage Events
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Guest Management */}
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex flex-column text-center p-4">
                <FaUsers size={40} className="text-info mb-3" />
                <h5 className="fw-bold mb-2">Guest Management</h5>
                <p className="text-muted small mb-3">
                  Upload guest lists, manage RSVPs, and assign categories.
                </p>
                <div className="mt-auto">
                  <Button variant="outline-info" size="sm" href="/organizer/manage-events">
                    View Guests
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Event Tools */}
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex flex-column text-center p-4">
                <FaCogs size={40} className="text-warning mb-3" />
                <h5 className="fw-bold mb-2">Event Tools</h5>
                <p className="text-muted small mb-3">
                  Send invitations, export reports, or configure settings.
                </p>
                <div className="mt-auto">
                  <Button variant="outline-warning" size="sm" href="/organizer/manage-events">
                    Tools
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card>
    </Container>
  );
}
