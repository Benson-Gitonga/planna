'use client';

import { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Card,
  ProgressBar,
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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [progress, setProgress] = useState(100);
  const [showProgress, setShowProgress] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (showToast) {
      const toastTimer = setTimeout(() => setShowToast(false), 2500);
      return () => clearTimeout(toastTimer);
    }
  }, [showToast]);

  useEffect(() => {
    if (showProgress) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            router.push('/organizer');
            return 0;
          }
          return prev - 10;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [showProgress, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          eventDate,
          eventLocation,
          startTime,
          endTime,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create event');

      setToastMessage('🎉 Event created successfully!');
      setShowToast(true);
      setShowProgress(true);
      setProgress(100);

      setEventName('');
      setEventDate('');
      setEventLocation('');
      setStartTime('');
      setEndTime('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Top-Right Toast Notification */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1050,
            minWidth: '280px',
          }}
        >
          <div
            className="toast show bg-success text-white"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="d-flex">
              <div className="toast-body">{toastMessage}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Close"
                onClick={() => setShowToast(false)}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Top-right Progress Bar */}
      {showProgress && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            right: '0',
            left: '0',
            zIndex: 1040,
          }}
        >
          <ProgressBar now={progress} variant="success" striped animated />
        </div>
      )}

      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-4">
                <h5 className="text-center mb-4">📅 Create Event</h5>

                {error && <Alert variant="danger">{error}</Alert>}

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
    </>
  );
}
