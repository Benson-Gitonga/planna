'use client';

import { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

export default function RSVPForm({ eventId }) {
  const [form, setForm] = useState({
    eventId: eventId || '',
    firstName: '',
    lastName: '',
    email: '',
    category: '',
    rsvp_status: 'accepted'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (eventId) {
      setForm(prev => ({ ...prev, eventId }));
    }
  }, [eventId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/rsvp', {
        method: 'POST',
        credentials: 'include', // Include cookies for session
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'RSVP failed');
      }

      setMessage('✅ RSVP submitted successfully! A confirmation email has been sent.');
      setForm({
        eventId: eventId || '',
        firstName: '',
        lastName: '',
        email: '',
        category: '',
        rsvp_status: 'accepted'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100 justify-content-center">
        <Col md={10} lg={8} xl={6}>
          <div className="border p-4 rounded bg-white shadow">
            <h2 className="text-center mb-4">RSVP to Event</h2>
            {message && <Alert variant="success" className="mb-4">{message}</Alert>}
            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              {/* Hidden Event ID input */}
              <Form.Control
                type="hidden"
                name="eventId"
                value={form.eventId}
                readOnly
              />

              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter Email"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>RSVP Status</Form.Label>
                <Form.Select
                  name="rsvp_status"
                  required
                  value={form.rsvp_status}
                  onChange={handleChange}
                >
                  <option value="accepted">Accept</option>
                  <option value="declined">Decline</option>
                </Form.Select>
              </Form.Group>

              <Button type="submit" variant="primary" disabled={loading} className="w-100">
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Submitting...
                  </>
                ) : 'Submit RSVP'}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
