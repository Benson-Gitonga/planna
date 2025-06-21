'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  ProgressBar,
  Card,
} from 'react-bootstrap';

export default function RSVPForm({ eventId }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailFromURL = searchParams.get('email');
  const eventIdFromURL = searchParams.get('eventId');

  const [form, setForm] = useState({
    eventId: eventId || eventIdFromURL || '',
    email: emailFromURL || '',
    rsvp_status: 'accepted',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (eventId || eventIdFromURL) {
      setForm(prev => ({ ...prev, eventId: eventId || eventIdFromURL }));
    }
    if (emailFromURL) {
      setForm(prev => ({ ...prev, email: emailFromURL }));
    }
  }, [eventId, eventIdFromURL, emailFromURL]);

  useEffect(() => {
    if (message) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            router.push('/');
            return 0;
          }
          return prev - 1;
        });
      }, 30); // 3s total (100 * 30ms)
      return () => clearInterval(interval);
    }
  }, [message, router]);

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
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'RSVP failed');
      }

      setMessage('✅ RSVP submitted successfully! Redirecting to homepage...');
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
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <h3 className="text-center mb-3 fw-bold text-primary">You're Invited!</h3>
              <p className="text-center text-muted mb-4">Please confirm your attendance below.</p>

              {message && (
                <>
                  <Alert variant="success" className="text-center">{message}</Alert>
                  <ProgressBar now={progress} label={`${progress}%`} striped animated className="mb-3" />
                </>
              )}
              {error && <Alert variant="danger" className="text-center">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Control type="hidden" name="eventId" value={form.eventId} readOnly />

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    readOnly
                    className="bg-light border-0"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">RSVP Status</Form.Label>
                  <Form.Select
                    name="rsvp_status"
                    required
                    value={form.rsvp_status}
                    onChange={handleChange}
                    className="border-0"
                  >
                    <option value="accepted">✅ Accept</option>
                    <option value="declined">❌ Decline</option>
                  </Form.Select>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-100 fw-semibold py-2"
                >
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
                  ) : 'Confirm Attendance'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
