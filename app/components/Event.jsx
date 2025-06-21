'use client';

import { useState } from 'react';
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Card,
} from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaRegFlag,
} from 'react-icons/fa';

export default function CreateEvent() {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!eventName || !eventDate || !eventLocation || !startTime || !endTime) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(eventDate);

    if (inputDate < today) {
      setError('Event date cannot be in the past.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventName, eventDate, eventLocation, startTime, endTime }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create event');

      setSuccess('🎉 Event created successfully!');
      setEventName('');
      setEventDate('');
      setEventLocation('');
      setStartTime('');
      setEndTime('');
      setTimeout(() => router.push('/events'), 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-1">
      <Row className="justify-content-center">
        <Col md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-4">
              <h5 className="text-center mb-4">📅 Create Event</h5>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaRegFlag className="me-2 text-primary" />
                    Event Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Product Launch"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaCalendarAlt className="me-2 text-primary" />
                    Event Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaMapMarkerAlt className="me-2 text-primary" />
                    Location
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Nairobi, Kenya"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaClock className="me-2 text-primary" />
                        Start Time
                      </Form.Label>
                      <Form.Control
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaClock className="me-2 text-primary" />
                        End Time
                      </Form.Label>
                      <Form.Control
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Event'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
