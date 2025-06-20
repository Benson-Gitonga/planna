'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Spinner,
  Alert,
  Container,
  OverlayTrigger,
  Tooltip,
  InputGroup,
  Form,
} from 'react-bootstrap';
import Link from 'next/link';
import {
  FaFileUpload,
  FaPaperPlane,
  FaUsers,
  FaCalendarAlt,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSearch,
} from 'react-icons/fa';

export default function EventsTable() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/events', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch events');
        setEvents(data.events);
        setFilteredEvents(data.events);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = events.filter(
      (event) =>
        event.event_name.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term)
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    const sorted = [...filteredEvents].sort((a, b) => {
      if (field === 'event_date') {
        return direction === 'asc'
          ? new Date(a[field]) - new Date(b[field])
          : new Date(b[field]) - new Date(a[field]);
      } else {
        return direction === 'asc'
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      }
    });
    setSortField(field);
    setSortDirection(direction);
    setFilteredEvents(sorted);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="ms-1 text-muted" />;
    return sortDirection === 'asc' ? (
      <FaSortUp className="ms-1 text-muted" />
    ) : (
      <FaSortDown className="ms-1 text-muted" />
    );
  };

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="d-flex align-items-center gap-2">
          <FaCalendarAlt className="text-primary" />
          Manage Your Events
        </h4>

        <InputGroup style={{ maxWidth: '300px' }}>
          <InputGroup.Text><FaSearch /></InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div>

      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="table-dark text-white">
          <tr>
            <th>#</th>
            <th onClick={() => handleSort('event_name')} style={{ cursor: 'pointer' }}>
              Event Name {renderSortIcon('event_name')}
            </th>
            <th onClick={() => handleSort('event_date')} style={{ cursor: 'pointer' }}>
              Date {renderSortIcon('event_date')}
            </th>
            <th>Location</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.map((event, index) => (
            <tr key={event.event_id}>
              <td>{index + 1}</td>
              <td>{event.event_name}</td>
              <td>{event.event_date}</td>
              <td>{event.location}</td>
              <td>
                {event.start_time} - {event.end_time}
              </td>
              <td>
                <div className="d-flex flex-wrap gap-2">
                  <OverlayTrigger placement="top" overlay={<Tooltip>Upload CSV File</Tooltip>}>
                    <Link href={`/organizer/csvupload?eventId=${event.event_id}`} passHref>
                      <Button variant="outline-primary" size="sm">
                        <FaFileUpload className="me-1" />
                        Upload
                      </Button>
                    </Link>
                  </OverlayTrigger>

                  <OverlayTrigger placement="top" overlay={<Tooltip>Send Invites</Tooltip>}>
                    <Link href={`/send-invites?eventId=${event.event_id}`} passHref>
                      <Button variant="outline-success" size="sm">
                        <FaPaperPlane className="me-1" />
                        Invite
                      </Button>
                    </Link>
                  </OverlayTrigger>

                  <OverlayTrigger placement="top" overlay={<Tooltip>View Guest List</Tooltip>}>
                    <Link href={`/organizer/guest-list/${event.event_id}`} passHref>
                      <Button variant="outline-info" size="sm">
                        <FaUsers className="me-1" />
                        Guests
                      </Button>
                    </Link>
                  </OverlayTrigger>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
