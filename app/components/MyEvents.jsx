'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import Link from 'next/link';

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/events', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to fetch events');

        setEvents(data.events);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-center">Your Events</h3>
      <Row className="g-4 justify-content-center">
        {events.map((event) => (
          <Col key={event.event_id} xs={12} md={6} lg={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>{event.event_name}</Card.Title>
                <Card.Text>
                  <strong>Date:</strong> {event.event_date}<br />
                  <strong>Location:</strong> {event.location}<br />
                  <strong>Time:</strong> {event.start_time} - {event.end_time}
                </Card.Text>
                <div className="d-flex gap-2">
                  <Link href={`/organizer/csvupload?eventId=${event.event_id}`}>
                    <Button variant="primary" size="sm">Upload CSV</Button>
                  </Link>
                  <Link href={`/send-invites?eventId=${event.event_id}`}>
                    <Button variant="success" size="sm">Send Invites</Button>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
