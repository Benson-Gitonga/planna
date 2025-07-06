'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Form,
  Button,
  Alert,
  Container,
  Row,
  Col,
  Spinner,
  ProgressBar,
} from 'react-bootstrap';

export default function UploadCsvForm() {
  const [file, setFile] = useState(null);
  const [eventId, setEventId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const idFromURL = searchParams.get('eventId');
    if (idFromURL) setEventId(idFromURL);
  }, [searchParams]);

  // Progress bar animation
  useEffect(() => {
    let timer;
    if (showProgress && progress < 100) {
      timer = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 100));
      }, 120);
    }
    return () => clearInterval(timer);
  }, [showProgress, progress]);

  // Redirect after progress completes
  useEffect(() => {
    if (progress === 100 && showProgress) {
      const timeout = setTimeout(() => {
        setShowProgress(false);
        router.push('/organizer');
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [progress, showProgress, router]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!file || !eventId) {
      setError('Both Event ID and CSV file are required.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`http://localhost:5000/api/upload-csv/${eventId}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setSuccess(`Uploaded ${data.totalInserted} guests.`);
      

      setFile(null);
      setShowProgress(true);
      setProgress(0);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Progress Bar Top (thin, similar to Register page) */}
      {showProgress && (
        <div className="csv-progress-bar">
          <ProgressBar
            now={progress}
            animated
            variant="info"
            style={{ height: '4px', background: '#e0f7fa', borderRadius: 0 }}
          />
        </div>
      )}

      <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#f8f9fc', position: 'relative' }}>
        <Row className="shadow-lg bg-white rounded-4 overflow-hidden w-100" style={{ maxWidth: '900px' }}>
          {/* Left section - illustration or info */}
          <Col md={5} className="d-none d-md-flex bg-primary text-white align-items-center justify-content-center p-4">
            <div className="text-center">
              <h4 className="fw-bold mb-3">Upload Guests List</h4>
              <p className="small mb-0">Make sure your CSV has valid headers like <strong>name</strong>, <strong>email</strong>, etc.</p>
            </div>
          </Col>

          {/* Right section - form */}
          <Col xs={12} md={7} className="p-4">
            <h4 className="text-center mb-4 fw-bold">Upload CSV for Event</h4>

            {error && <Alert variant="danger" className="text-center">{error}</Alert>}
            {success && <Alert variant="success" className="text-center">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              {!searchParams.get('eventId') && (
                <Form.Group className="mb-3">
                  <Form.Label>Event ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Event ID"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    required
                  />
                </Form.Group>
              )}

              <Form.Group controlId="formFile" className="mb-4">
                <Form.Label>Choose CSV File</Form.Label>
                <Form.Control
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className="w-100 fw-semibold"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Uploading...
                  </>
                ) : 'Upload CSV'}
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
      <style jsx global>{`
        .csv-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          z-index: 2000;
          background: transparent;
        }
        .progress-bar {
          background: linear-gradient(90deg, #00e0b8 0%, #23272b 100%) !important;
          transition: width 0.3s cubic-bezier(.4,1.3,.6,1);
        }
        .progress {
          background: transparent !important;
        }
      `}</style>
    </>
  );
}