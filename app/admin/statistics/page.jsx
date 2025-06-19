'use client';
import { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Badge } from 'react-bootstrap';
import StatCard from '@/app/components/StatCard';
import RSVPsPerEventChart from '@/app/components/RSVPsPerEventChart';
import TopOrganizers from '@/app/components/TopOrganizers';
import UpcomingEventsTimeline from '@/app/components/UpcomingEventsTimeline';
import { useRouter } from 'next/navigation';

export default function StatisticsBoard() {
    const router = useRouter();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalOrganizers: 0,
    totalRSVPs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [eventsRes, organizersRes, rsvpsRes] = await Promise.all([
          fetch('http://localhost:5000/api/admin/total-events', { credentials: 'include' }),
          fetch('http://localhost:5000/api/admin/total-organizers', { credentials: 'include' }),
          fetch('http://localhost:5000/api/admin/total-rsvps', { credentials: 'include' }),
        ]);

         // Check if any response is 401
        if ([eventsRes, organizersRes, rsvpsRes].some(res => res.status === 401)) {
          router.push('/login'); // Redirect to login
          return;
        }

        const eventData = await eventsRes.json();
        const organizersData = await organizersRes.json();
        const rsvpsData = await rsvpsRes.json();

        console.log("Events response:", eventData);
        console.log("Organizers response:", organizersData);
        console.log("RSVPs response:", rsvpsData);

        setStats({
          totalEvents: eventData?.total_events || 0,
          totalOrganizers: organizersData?.total_organizers || 0,
          totalRSVPs: rsvpsData?.total_rsvp_accepted || 0,
        });

      } catch (err) {
        setError('Failed to load statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
    <Container>
      <Row className="my-4">
        <Col>
          <h5 className='mb-3 text-center'>
            <i className="bi bi-bar-chart-fill me-2"></i>
            Application Stats
        </h5>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading ? (
            <Spinner animation="border" />
          ) : (
            <Row className="g-3">
              <Col md={4}>
                <StatCard type="events" title="Total Events" value={stats.totalEvents} />
              </Col>
              <Col md={4}>
                <StatCard type="organizers" title="Total Organizers" value={stats.totalOrganizers} />
              </Col>
              <Col md={4}>
                <StatCard type="rsvps" title="Total RSVPs" value={stats.totalRSVPs} />
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Container>
    <RSVPsPerEventChart/>
    <TopOrganizers/>
    <UpcomingEventsTimeline/>
    </>
  );
}
