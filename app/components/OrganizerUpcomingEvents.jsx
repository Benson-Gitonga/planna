'use client';

import { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

export default function OrganizerUpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/organizer/upcoming-events', {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setEvents(data.upcoming_events);
        } else {
          throw new Error(data.message || data.error || 'Failed to load upcoming events');
        }
      } catch (err) {
        console.error('Error loading upcoming events:', err);
        setError('No Upcoming Events found');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getUrgency = (date) => {
    const today = dayjs().startOf('day');
    const eventDate = dayjs(date).startOf('day');
    const diff = eventDate.diff(today, 'day');

    if (diff === 0) return <Badge bg="danger">Today</Badge>;
    if (diff <= 7) return <Badge bg="warning">This Week</Badge>;
    return <Badge bg="success">Upcoming</Badge>;
  };

  return (
    <Container className="my-5">
      <h5 className="mb-4">📅 Your Upcoming Events</h5>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Spinner animation="border" />
      ) : events.length === 0 ? (
        <p>No upcoming events.</p>
      ) : (
        <div className="border-start border-2 ps-3">
          {events.map((event) => (
            <motion.div
              key={event.event_id}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="mb-4"
            >
              <div className="mb-1 small text-muted">
                {dayjs(event.event_date).format('MMM D, YYYY')}
              </div>
              <h6 className="mb-1">
                {event.event_name} {getUrgency(event.event_date)}
              </h6>
              <p className="mb-0 small">
                {event.start_time ? `${event.start_time} - ${event.end_time}` : 'Time not set'} @{' '}
                <strong>{event.location}</strong>
              </p>
              <hr />
            </motion.div>
          ))}
        </div>
      )}
    </Container>
  );
}
