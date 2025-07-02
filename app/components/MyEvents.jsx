'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  Spinner,
  Alert,
  Container,
  Row,
  Col,
  Pagination,
  Form,
  Badge,
  ButtonGroup,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import ExportCSVButton from './ExportCSVButton';
import ExportPDFButton from './ExportPdfButton';
import { FaSortDown, FaSortUp } from 'react-icons/fa';

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/events', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No events created yet');
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  };

  const determineStatus = (dateStr) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    if (eventDate.getTime() === today.getTime()) return 'Today';
    if (eventDate > today && eventDate <= endOfWeek) return 'This Week';
    if (eventDate < today) return 'Past';
    return 'Upcoming';
  };

  const getStatusBadge = (dateStr) => {
    const status = determineStatus(dateStr);
    const tooltipText = {
      'Today': 'This event is happening today!',
      'This Week': 'This event is scheduled for this week.',
      'Upcoming': 'Scheduled for a future date.',
      'Past': 'This event has already occurred.',
    };
    const variantMap = {
      'Today': 'primary',
      'This Week': 'success',
      'Upcoming': 'warning',
      'Past': 'danger',
    };

    return (
      <OverlayTrigger overlay={<Tooltip>{tooltipText[status]}</Tooltip>}>
        <Badge bg={variantMap[status]}>{status}</Badge>
      </OverlayTrigger>
    );
  };

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const sortIcon = sortOrder === 'asc' ? <FaSortDown /> : <FaSortUp />;

  const filteredAndSortedEvents = [...filteredEvents]
    .filter(event => {
      const matchesSearch =
        event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? determineStatus(event.event_date) === statusFilter : true;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.event_date);
      const dateB = new Date(b.event_date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const totalPages = Math.ceil(filteredAndSortedEvents.length / itemsPerPage);
  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = filteredAndSortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const renderPagination = () => (
    <Pagination className="justify-content-center mt-3">
      <Pagination.Prev
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      />
      {[...Array(totalPages)].map((_, i) => (
        <Pagination.Item
          key={i + 1}
          active={i + 1 === currentPage}
          onClick={() => setCurrentPage(i + 1)}
        >
          {i + 1}
        </Pagination.Item>
      ))}
      <Pagination.Next
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
      />
    </Pagination>
  );

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col md={6}>
          <h3 className="fw-bold text-primary">📅 My Events</h3>
        </Col>
        <Col md={6} className="text-end">
          <ButtonGroup>
            <ExportCSVButton data={events} filename="events_export.csv" className="me-2" />
            <ExportPDFButton data={events} filename="events_export.pdf" />
          </ButtonGroup>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6} className="mb-2 mb-md-0">
          <Form.Control
            type="text"
            placeholder="🔍 Search by event name or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadow-sm rounded-pill px-3"
          />
        </Col>
        <Col md={6}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="shadow-sm rounded-pill"
          >
            <option value="">🗂️ Filter by Status</option>
            <option value="Today">✅ Today</option>
            <option value="This Week">📆 This Week</option>
            <option value="Upcoming">⏳ Upcoming</option>
            <option value="Past">📁 Past</option>
          </Form.Select>
        </Col>
      </Row>

      <Table responsive bordered hover className="shadow-sm rounded table-striped align-middle">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Event Name</th>
            <th onClick={handleSort} style={{ cursor: 'pointer' }}>
              Date {sortIcon}
            </th>
            <th>Status</th>
            <th>Location</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {currentEvents.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center text-muted py-4">
                <em>No matching events found.</em>
              </td>
            </tr>
          ) : (
            currentEvents.map((event, index) => (
              <tr key={event.event_id}>
                <td>{indexOfFirstEvent + index + 1}</td>
                <td className="text-capitalize">{event.event_name}</td>
                <td>{formatDate(event.event_date)}</td>
                <td>{getStatusBadge(event.event_date)}</td>
                <td className="text-capitalize">{event.location}</td>
                <td>{formatTime(event.start_time)} - {formatTime(event.end_time)}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {totalPages > 1 && renderPagination()}
    </Container>
  );
}
