'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Container, Row, Col, Alert, Spinner, Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

const EventTable = ({ events }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventList, setEventList] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    if (!events) {
      setError('Failed to load events');
      setLoading(false);
    } else {
      setEventList(events);
      setLoading(false);
    }
  }, [events]);

  useEffect(() => {
    const filtered = eventList.filter(event =>
      `${event.event_name} ${event.location} ${event.event_date}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [search, eventList]);

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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Event List</h5>
            <div style={{ maxWidth: '300px' }}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </div>
          </div>
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
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No events available.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
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
