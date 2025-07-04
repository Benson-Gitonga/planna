'use client';

import { Modal, Button, Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';

export default function EditEventModal({ show, onHide, eventData, onUpdate }) {
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventLocation: '',
    startTime: '',
    endTime: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (eventData) {
      setFormData({
        eventName: eventData.event_name || '',
        eventDate: eventData.event_date?.split('T')[0] || '',
        eventLocation: eventData.location || '',
        startTime: eventData.start_time || '',
        endTime: eventData.end_time || '',
      });
    }
  }, [eventData]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const { eventName, eventDate, eventLocation, startTime, endTime } = formData;

    try {
      const res = await fetch(`http://localhost:5000/api/organizer/edit-event/${eventData.event_id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, eventDate, eventLocation, startTime, endTime }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update event');

      onUpdate(); // Refetch events
      onHide(); // Close modal
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Event</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p className="text-danger">{error}</p>}
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Event Name</Form.Label>
            <Form.Control name="eventName" value={formData.eventName} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Event Date</Form.Label>
            <Form.Control type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Location</Form.Label>
            <Form.Control name="eventLocation" value={formData.eventLocation} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Start Time</Form.Label>
            <Form.Control type="time" name="startTime" value={formData.startTime} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>End Time</Form.Label>
            <Form.Control type="time" name="endTime" value={formData.endTime} onChange={handleChange} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Save Changes</Button>
      </Modal.Footer>
    </Modal>
  );
}
