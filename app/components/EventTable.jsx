'use client';

import { useState, useEffect } from 'react';
import {
  Table, Button, Container, Row, Col, Alert, Spinner,
  Form, InputGroup, Pagination
} from 'react-bootstrap';
import { FaSearch, FaTrash } from 'react-icons/fa';

const ITEMS_PER_PAGE = 5;

const EventTable = ({ events }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventList, setEventList] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!events || events.length === 0) {
      setError('No events available');
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
    setCurrentPage(1); // Reset to first page when filtering
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
      if (!response.ok) throw new Error(data?.error || 'Failed to delete event');

      const updatedList = eventList.filter((event) => event.event_id !== eventId);
      setEventList(updatedList);
    } catch (err) {
      setError(err.message);
    }
  };

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
            <>
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
                  {currentEvents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No events found.
                      </td>
                    </tr>
                  ) : (
                    currentEvents.map((event) => (
                      <tr key={event.event_id}>
                        <td>{event.event_name}</td>
                        <td>{new Date(event.event_date).toLocaleDateString()}</td>
                        <td>{event.location}</td>
                        <td>{event.start_time}</td>
                        <td>{event.end_time}</td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(event.event_id)}
                            title="Delete Event"
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="justify-content-center">
                  <Pagination.Prev
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  />
                  {[...Array(totalPages)].map((_, index) => (
                    <Pagination.Item
                      key={index}
                      active={currentPage === index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EventTable;
