'use client';

import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

export default function GuestAccessPage() {
  const [accessCode, setAccessCode] = useState('');
  const [lastName, setLastName] = useState('');
  const [eventDetails, setEventDetails] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEventDetails(null);

    try {
      const res = await fetch(`http://localhost:5000/api/guest/event-info/${accessCode}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Invalid access code');
      if (lastName.trim().toLowerCase() !== data.eventDetails.last_name.toLowerCase()) {
        throw new Error('Last name does not match');
      }

      setEventDetails(data.eventDetails);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="event-info-bg">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-2 event-info-title">
                <span className="gradient-text">Access Your Invitation</span>
              </h2>
              <p className="text-muted mb-0 fs-5">
                Enter your <span className="fw-semibold">Access Code</span> and <span className="fw-semibold">Last Name</span> to view your event details.
              </p>
            </div>

            <Card className="shadow-lg border-0 rounded-4 event-info-card card-animate">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Row className="mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">Access Code</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g. 9DKQ42"
                          value={accessCode}
                          onChange={(e) => setAccessCode(e.target.value)}
                          required
                          className="rounded-pill input-animate"
                          style={{ background: "#f5f7fa", border: "2px solid #23272b", color: "#121212" }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g. Gitonga"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="rounded-pill input-animate"
                          style={{ background: "#f5f7fa", border: "2px solid #23272b", color: "#121212" }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="text-end">
                    <Button
                      variant="primary"
                      type="submit"
                      className="px-5 py-2 rounded-pill fw-bold btn-animate"
                      style={{
                        background: "linear-gradient(90deg, #23272b 0%, #00e0b8 100%)",
                        border: "none",
                        letterSpacing: "1px",
                        boxShadow: "0 2px 16px rgba(0,224,184,0.10)",
                        transition: "transform 0.2s, box-shadow 0.2s"
                      }}
                    >
                      View Invitation
                    </Button>
                  </div>
                </Form>

                {error && <Alert variant="danger" className="mt-4">{error}</Alert>}
              </Card.Body>
            </Card>

            {eventDetails && (
              <Card className="mt-4 shadow-lg border-0 rounded-4 event-details-card card-animate">
                <Card.Body>
                  <h4 className="mb-3 fw-bold gradient-text">{eventDetails.event_name}</h4>
                  <Row>
                    <Col md={6}>
                      <p><strong>Date:</strong> {new Date(eventDetails.event_date).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {eventDetails.start_time} - {eventDetails.end_time}</p>
                      <p><strong>Location:</strong> {eventDetails.location}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Guest:</strong> {eventDetails.first_name} {eventDetails.last_name}</p>
                      <p>
                        <strong>RSVP Status:</strong>{" "}
                        <span className={eventDetails.rsvp_status === 'accepted' ? 'text-success' : 'text-danger'}>
                          {eventDetails.rsvp_status}
                        </span>
                      </p>
                      <p>
                        <strong>Seat:</strong>{" "}
                        {eventDetails.seat_number || <span className="text-muted">Not Assigned</span>}
                      </p>
                      <p>
                        <strong>Check-In:</strong>{" "}
                        {eventDetails.check_in_status ? (
                          <span className="text-success">✅ Checked In</span>
                        ) : (
                          <span className="text-danger">❌ Not Yet</span>
                        )}
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
      <style jsx global>{`
        .event-info-bg {
          background: linear-gradient(120deg, #23272b 60%, #00e0b8 100%);
          min-height: 100vh;
          padding-top: 4rem;
        }
        .event-info-title {
          color: #fff;
          letter-spacing: 1px;
        }
        .gradient-text {
          background: linear-gradient(90deg,rgb(30, 32, 31) 0%, #23272b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .event-info-card {
          border: 2px solid #00e0b8;
          background: #23272b;
          color: #fff;
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .event-info-card:hover, .event-info-card:focus-within {
          box-shadow: 0 8px 32px rgba(0,224,184,0.18), 0 2px 16px rgba(0,0,0,0.10);
          transform: translateY(-4px) scale(1.01);
        }
        .event-info-card .form-label,
        .event-info-card .form-control {
          color: #fff !important;
        }
        .event-details-card {
          border: 2px solid #00e0b8;
          background: #fff;
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .event-details-card:hover {
          box-shadow: 0 8px 32px rgba(0,224,184,0.12), 0 2px 16px rgba(0,0,0,0.08);
          transform: translateY(-4px) scale(1.01);
        }
        .event-details-card strong {
          color: #00b89c;
        }
        .event-details-card .gradient-text {
          background: linear-gradient(90deg, #00e0b8 0%, #23272b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .input-animate {
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-animate:focus {
          border-color: #00e0b8 !important;
          box-shadow: 0 0 0 0.15rem rgba(0,224,184,0.25);
          background: #fff !important;
          color: #121212 !important;
        }
        .btn-animate {
          transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .btn-animate:hover, .btn-animate:focus {
          background: linear-gradient(90deg, #00e0b8 0%, #23272b 100%) !important;
          box-shadow: 0 4px 24px rgba(0,224,184,0.18);
          transform: translateY(-2px) scale(1.03);
        }
        .form-control {
          color: #121212 !important;
        }
      `}</style>
    </div>
  );
}
            