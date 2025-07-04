'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner, Row, Col } from 'react-bootstrap';
import { BsCalendarPlus, BsListUl, BsPencilSquare, BsGrid3X3Gap, BsCheck2Circle } from 'react-icons/bs';
import Link from 'next/link';

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
        {features.map(({ icon, title, description, iconBg, link }, idx) => (
          <Col key={idx} md={6} lg={4}>
            {link ? (
              <Link href={link} passHref legacyBehavior>
                <a style={{ textDecoration: 'none' }}>
                  <div className="organizer-feature-card h-100 shadow-sm border-0 p-4 bg-white rounded-3 clickable-card">
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <span className={`icon-circle ${iconBg}`}>{icon}</span>
                      <h5 className="mb-0">{title}</h5>
                    </div>
                    <p className="text-muted small mb-0">{description}</p>
                  </div>
                </a>
              </Link>
            ) : (
              <div className="organizer-feature-card h-100 shadow-sm border-0 p-4 bg-white rounded-3">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <span className={`icon-circle ${iconBg}`}>{icon}</span>
                  <h5 className="mb-0">{title}</h5>
                </div>
                <p className="text-muted small mb-0">{description}</p>
              </div>
            )}
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
        .clickable-card {
          cursor: pointer;
          border: 1.5px solid transparent;
        }
        .clickable-card:hover, .clickable-card:focus {
          border: 1.5px solid #00e0b8;
        }
        .icon-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          font-size: 1.5rem;
          background: #f5f7fa;
        }
        .icon-blue { background: #e6f0fa; color: #0d6efd; }
        .icon-green { background: #e6faef; color: #198754; }
        .icon-yellow { background: #fffbe6; color: #ffc107; }
        .icon-red { background: #fae6e6; color: #dc3545; }
        .icon-cyan { background: #e6fafd; color: #0dcaf0; }
      `}</style>
    </div>
  );
}

const features = [
  {
    icon: <BsCalendarPlus />,
    iconBg: 'icon-blue',
    title: 'Create Event',
    description:
      'Plan a new event by specifying details like title, date, venue, and guest preferences. This is your first step to organizing.',
    link: '/organizer/event',
  },
  {
    icon: <BsListUl />,
    iconBg: 'icon-green',
    title: 'View Events',
    description:
      'Access a list of your created events, monitor guest counts, and track key details. Stay informed about your event history.',
      link:'/organizer/myevents'
  },
  {
    icon: <BsPencilSquare />,
    iconBg: 'icon-yellow',
    title: 'Manage Events',
    description:
      'Update event details, manage attendees, cancel or duplicate events, and handle RSVP flows in one place.',
    link: '/organizer/manage-events',
  },
  {
    icon: <BsGrid3X3Gap />,
    iconBg: 'icon-red',
    title: 'Seating Arrangement',
    description:
      'Organize seating layouts for your guests. Customize arrangements for tables, VIP areas, or special groups.',
  },
  {
    icon: <BsCheck2Circle />,
    iconBg: 'icon-cyan',
    title: 'Check-in',
    description:
      'Mark guest attendance in real-time on the event day. Quick and easy access to check-in tools.',
    link: '/organizer/check-in',
  },
];