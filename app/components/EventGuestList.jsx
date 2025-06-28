'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Spinner,
  Table,
  Alert,
  Button,
  Form,
  Modal,
} from 'react-bootstrap';

export default function EventGuestList({ params }) {
  const eventId = params.eventId;
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email_address: '',
    category: 'VIP',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState(null);

  const fetchGuests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5000/api/guest-list/${eventId}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No guests have been added yet');
      setGuests(data.guests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [eventId]);

  const handleAddGuest = async () => {
    const { first_name, last_name, email_address, category } = formData;
    if (!first_name || !last_name || !email_address || !category) {
      alert('All fields are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/organizer/manual-guest-upload/${eventId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add guest');

      setShowModal(false);
      setFormData({
        first_name: '',
        last_name: '',
        email_address: '',
        category: 'VIP',
      });
      await fetchGuests();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (email) => {
    if (!confirm(`Delete guest ${email}?`)) return;

    setDeletingEmail(email);
    try {
      const res = await fetch(
        `http://localhost:5000/api/organizer/delete-guest/${eventId}/${encodeURIComponent(email)}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete guest');

      setGuests((prev) => prev.filter((g) => g.email_address !== email));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingEmail(null);
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Guest List for Event</h5>
        <Button onClick={() => setShowModal(true)}>Add Guest</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {guests.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No guests found.
                </td>
              </tr>
            ) : (
              guests.map((guest, index) => (
                <tr key={guest.email_address}>
                  <td>{index + 1}</td>
                  <td>{guest.first_name}</td>
                  <td>{guest.last_name}</td>
                  <td>{guest.email_address}</td>
                  <td>{guest.category}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={deletingEmail === guest.email_address}
                      onClick={() => handleDelete(guest.email_address)}
                    >
                      {deletingEmail === guest.email_address ? 'Deleting...' : 'Delete'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Add Guest Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Guest</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                name="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                name="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                name="email_address"
                type="email"
                value={formData.email_address}
                onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="VIP">VIP</option>
                <option value="Regular">Regular</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddGuest} disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Guest'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
