'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Spinner from 'react-bootstrap/Spinner';
import { Table, Alert, Container } from 'react-bootstrap';

export default function GuestListPage({ params }) {
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState([]);
  const [error, setError] = useState('');
  const eventId = params.eventId;

  useEffect(() => {
    const fetchGuestList = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/guest-list/${eventId}`, {
          credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to fetch guest list');

        setGuests(data.guests);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGuestList();
  }, [eventId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container className="py-4">
      <h5 className="mb-4">Event Guest List</h5>
      {error && <Alert variant="danger">{error}</Alert>}
      {!error && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Category</th>
              {/* You can add RSVP status later if tracked */}
            </tr>
          </thead>
          <tbody>
            {guests.map((guest, index) => (
              <tr key={guest.id || index}>
                <td>{index + 1}</td>
                <td>{guest.first_name}</td>
                <td>{guest.last_name}</td>
                <td>{guest.email_address}</td>
                <td>{guest.category}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
