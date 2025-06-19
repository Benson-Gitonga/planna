'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Form, Button, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';

export default function UploadCsvForm() {
  const [file, setFile] = useState(null);
  const [eventId, setEventId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const idFromURL = searchParams.get('eventId');
    if (idFromURL) {
      setEventId(idFromURL);
    }
  }, [searchParams]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!file || !eventId) {
      setError('Event ID is missing or CSV file not selected.');
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

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload CSV');
      }

      setSuccess(`Successfully uploaded ${data.totalInserted} rows.`);
      if (data.failedRows) {
        setSuccess(prev => prev + ` Some rows failed (${data.failedRows.length}).`);
      }
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100 justify-content-center">
        <Col md={8} lg={6}>
          <div className="border p-4 rounded bg-white shadow">
            <h2 className="text-center mb-4">Upload CSV for Event</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              {/* Hidden input just to keep eventId in form context if needed */}
              <input type="hidden" value={eventId} readOnly />

              <Form.Group className="mb-4">
                <Form.Label>CSV File</Form.Label>
                <Form.Control
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  required
                />
              </Form.Group>

              <Button type="submit" disabled={loading} className="w-100">
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
                    Uploading...
                  </>
                ) : 'Upload CSV'}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
