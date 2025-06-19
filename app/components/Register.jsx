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
    role: 'guest',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const roles = ['guest', 'organizer']; 

  // Validate email format (matches backend regex)
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Frontend validation (mimic backend checks)
    if (!formData.fName || !formData.lName || !formData.email || !formData.password || !formData.role) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Invalid email format');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100 justify-content-center">
        <Col md={8} lg={6} xl={5}>
          <div className="border p-4 rounded bg-white shadow">
            <h2 className="text-center mb-4">Register</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="fName"
                  required
                  value={formData.fName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lName"
                  required
                  value={formData.lName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="organizer">organizer</option>
                </Form.Select>
              </Form.Group>

              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                className="w-100"
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
                    Registering...
                  </>
                ) : 'Register'}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}