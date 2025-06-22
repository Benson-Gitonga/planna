'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner, Row, Col } from 'react-bootstrap';
import {
  FaCalendarPlus,
  FaListUl,
  FaEdit,
  FaThLarge,
  FaClipboardCheck,
} from 'react-icons/fa';

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
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-3">
      <h2 className="fw-bold mb-2">Welcome, {user?.firstName || 'Organizer'} 👋</h2>
      <p className="text-muted">You're all set! Start organizing unforgettable events, inviting guests, and tracking responses effortlessly.</p>

      <Row className="g-4 mt-4">
        {features.map(({ icon, title, description }, idx) => (
          <Col key={idx} md={6} lg={4}>
            <div className="organizer-feature-card h-100 shadow-sm border-0 p-4 bg-white rounded-3">
              <div className="d-flex align-items-center gap-3 mb-2">
                {icon}
                <h5 className="mb-0">{title}</h5>
              </div>
              <p className="text-muted small mb-0">{description}</p>
            </div>
          </Col>
        ))}
      </Row>

      <style jsx>{`
        .organizer-feature-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .organizer-feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 1rem 1.5rem rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </div>
  );
}

const features = [
  {
    icon: <FaCalendarPlus size={24} className="text-primary" />,
    title: 'Create Event',
    description:
      'Plan a new event by specifying details like title, date, venue, and guest preferences. This is your first step to organizing.',
  },
  {
    icon: <FaListUl size={24} className="text-success" />,
    title: 'View Events',
    description:
      'Access a list of your created events, monitor guest counts, and track key details. Stay informed about your event history.',
  },
  {
    icon: <FaEdit size={24} className="text-warning" />,
    title: 'Manage Events',
    description:
      'Update event details, manage attendees, cancel or duplicate events, and handle RSVP flows in one place.',
  },
  {
    icon: <FaThLarge size={24} className="text-danger" />,
    title: 'Seating Arrangement',
    description:
      'Organize seating layouts for your guests. Customize arrangements for tables, VIP areas, or special groups.',
  },
  {
    icon: <FaClipboardCheck size={24} className="text-info" />,
    title: 'Check-in',
    description:
      'Mark guest attendance in real-time on the event day. Quick and easy access to check-in tools.',
  },
];
