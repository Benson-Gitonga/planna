'use client';

import { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [formData, setFormData] = useState({
    fName: '',
    lName: '',
    email: '',
    password: '',
    role: 'organizer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { fName, lName, email, password, role } = formData;

    if (!fName || !lName || !email || !password || !role) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setSuccess('Registration successful! ');
      setTimeout(() => router.push('/admin'), 2000);
    } catch (err) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f9f9fb' }}>
      <Row className="shadow-lg rounded-4 overflow-hidden bg-white w-100" style={{ maxWidth: '900px' }}>
        {/* Left illustration side (optional image) */}
        <Col md={5} className="d-none d-md-flex align-items-center justify-content-center bg-primary text-white p-4">
          <div className="text-center">
            <h2 className="fw-bold">Helping Hand!</h2>
            <p className="mb-0">Use this form to register an organizer on their behalf.</p>
          </div>
        </Col>

        {/* Form section */}
        <Col xs={12} md={7} className="p-4">
          <h3 className="fw-bold text-center mb-4">Create an Account</h3>

          {error && <Alert variant="danger" className="text-center">{error}</Alert>}
          {success && <Alert variant="success" className="text-center">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="fName"
                    value={formData.fName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lName"
                    value={formData.lName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleChange}>
                <option value="organizer">Organizer</option>
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading} className="w-100 fw-semibold">
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Adding user...
                </>
              ) : 'Register'}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
