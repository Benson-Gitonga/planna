'use client';

import { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');        // ✅ Track email input
  const [password, setPassword] = useState('');  // ✅ Track password input
  const [loading, setLoading] = useState(false); // ✅ For loading spinner state
  const [error, setError] = useState('');        // ✅ To show login errors
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Login failed');

      //  Role-based redirection
      switch (data.user.role.toLowerCase()) {
        case 'admin':
          router.push('/admin');
          break;
        case 'organizer':
          router.push('/organizer');
          break;
        default:
          router.push('/guest');
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh', backgroundColor: '#f8f9fc' }}
    >
      <Row className="shadow-lg rounded-4 overflow-hidden bg-white w-100" style={{ maxWidth: '850px' }}>
        {/* Left side */}
        <Col md={5} className="d-none d-md-flex align-items-center justify-content-center bg-primary text-white p-4">
          <div className="text-center">
            <h2 className="fw-bold">Welcome Back!</h2>
            <p className="mb-0">Log in to access your events and dashboard.</p>
          </div>
        </Col>

        {/* Right side - Form */}
        <Col xs={12} md={7} className="p-4">
          <h3 className="fw-bold text-center mb-4">Sign In</h3>

          {error && <Alert variant="danger" className="text-center">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                required
                value={email}
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                required
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="w-100 fw-semibold"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </Button>

            <div className="text-center mt-3">
              <a href="/register" className="text-decoration-none text-primary small">
                Don't have an account? Register
              </a>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
