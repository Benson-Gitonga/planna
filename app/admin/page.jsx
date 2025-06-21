'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner, Card, Row, Col } from 'react-bootstrap';
import {
  BiUserPlus,
  BiUserCircle,
  BiBarChartSquare,
  BiCalendarEvent,
} from 'react-icons/bi';

export default function AdminDashboard() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/me', {
          credentials: 'include',
        });

        if (res.status === 401) return router.replace('/login');
        const data = await res.json();

        if (data.user.role !== 'admin') return router.replace('/unauthorized');
        setUser(data.user);
      } catch (err) {
        router.replace('/login');
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router]);

  if (checkingSession) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Verifying your session...</p>
      </div>
    );
  }

  return (
    <>
    
    <div className="container-fluid py-4 px-3">
      <h2 className="fw-bold mb-2">Welcome, {user?.firstName || 'Admin'} 👋</h2>
      <p className="text-muted">Here's what you can manage from this dashboard:</p>

      <Row className="g-4 mt-4">
        {features.map(({ icon, title, description, color }, idx) => (
          <Col key={idx} md={6} lg={4}>
            <Card className="admin-feature-card h-100 shadow-sm border-0 p-4">
              <div className="d-flex align-items-center gap-3 mb-2">
                {icon}
                <h5 className="mb-0">{title}</h5>
              </div>
              <p className="text-muted small mb-0">{description}</p>
            </Card>
          </Col>
        ))}
      </Row>

      <style jsx>{`
        .admin-feature-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border-radius: 0.75rem;
        }

        .admin-feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 1rem 1.5rem rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </div>
    </>
  );
}

const features = [
  {
    icon: <BiUserPlus size={28} className="admin-feature-icon text-primary" />,
    title: 'Create Organizer Accounts',
    description:
      'Add new event organizers to the system, assign roles, and give them access to event planning tools.',
  },
  {
    icon: <BiUserCircle size={28} className="admin-feature-icon text-success" />,
    title: 'Manage User Accounts',
    description:
      'View, edit, or deactivate organizer accounts. Monitor account activity and roles.',
  },
  {
    icon: <BiCalendarEvent size={28} className="admin-feature-icon text-warning" />,
    title: 'Oversee Events',
    description:
      'Browse and manage events across the platform. Monitor statuses, edit event data, or intervene if needed.',
  },
  {
    icon: <BiBarChartSquare size={28} className="admin-feature-icon text-danger" />,
    title: 'View Analytics',
    description:
      'Access insights on platform usage, event performance, guest activity, and engagement trends.',
  },
  {
    icon: (
      <i
        className="admin-feature-icon bi bi-shield-lock text-secondary"
        style={{ fontSize: '1.75rem' }}
      ></i>
    ),
    title: 'System Integrity',
    description:
      'Ensure data accuracy, enforce security rules, and maintain platform reliability for all users.',
  },
];

// Add this global style for card (box) hover effect
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .admin-feature-card {
      transition: transform 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.3s cubic-bezier(.4,2,.6,1), filter 0.2s;
      will-change: transform, box-shadow, filter;
    }
    .admin-feature-card:hover {
      transform: scale(1.08);
      box-shadow: 0 1.5rem 2rem rgba(0,0,0,0.10);
      filter: brightness(1.07);
    }
    .admin-feature-icon {
      transition: none;
    }
  `;
  document.head.appendChild(style);
}
