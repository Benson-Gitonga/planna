'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  Container, Alert, Spinner, Button
} from 'react-bootstrap';

export default function CheckInScanner() {
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('info');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(
      async (decodedText) => {
        setScanning(false);
        setLoading(true);
        setMessage('');

        try {
          const res = await fetch('http://localhost:5000/api/organizer/check-in-guest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ qr_code: decodedText }),
          });

          const data = await res.json();

          if (!res.ok) {
            setVariant('danger');
            setMessage(data.error || 'Check-in failed');
          } else {
            setVariant('success');
            setMessage(data.message);
          }
        } catch (err) {
          setVariant('danger');
          setMessage('Error checking in guest');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.warn('QR Scan error:', err);
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [scanning]);

  return (
    <Container className="py-4">
      <h3>Scan Guest QR Code</h3>
      <p>Use your webcam to scan and check in a guest.</p>

      <div id="qr-reader" style={{ width: '100%', maxWidth: '400px' }} className="mb-4" />

      {loading && <Spinner animation="border" variant="primary" />}

      {message && <Alert variant={variant}>{message}</Alert>}

      {!scanning && (
        <Button variant="secondary" onClick={() => {
          setMessage('');
          setScanning(true);
        }}>
          Scan Another
        </Button>
      )}
    </Container>
  );
}
