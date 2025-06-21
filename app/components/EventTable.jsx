'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';

const EventTable = ({ events }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventList, setEventList] = useState([]);

  useEffect(() => {
    if (!events) {
      setError('Failed to load events');
      setLoading(false);
    } else {
      setEventList(events);
      setLoading(false);
    }
  }, [events]);

  const handleDelete = async (eventId) => {
    const confirmDelete = confirm('Are you sure you want to delete this event?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/delete-event/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete event');
      }

      // ✅ Remove event from local state
      const updatedList = eventList.filter((event) => event.event_id !== eventId);
      setEventList(updatedList);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <h5>Event List</h5>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading ? (
            <Spinner animation="border" />
          ) : (
            <Table striped bordered hover responsive className="shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {eventList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No events available.
                    </td>
                  </tr>
                ) : (
                  eventList.map((event) => (
                    <tr key={event.event_id}>
                      <td>{event.event_name}</td>
                      <td>{new Date(event.event_date).toLocaleDateString()}</td>
                      <td>{event.location}</td>
                      <td>{event.start_time}</td>
                      <td>{event.end_time}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(event.event_id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EventTable;
