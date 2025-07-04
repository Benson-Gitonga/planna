'use client';

import { useEffect, useState } from 'react';
import {
  Table, Spinner, Alert, Container, Row, Col, Pagination,
  Form, Badge, ButtonGroup, OverlayTrigger, Tooltip, Button, Modal
} from 'react-bootstrap';
import ExportCSVButton from './ExportCSVButton';
import ExportPDFButton from './ExportPdfButton';
import { FaSortDown, FaSortUp, FaEdit } from 'react-icons/fa';

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventLocation: '',
    startTime: '',
    endTime: '',
  });

  const itemsPerPage = 5;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/events', {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch events');
      setEvents(data.events);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatTime = (timeStr) => timeStr?.slice(0, 5);

  const determineStatus = (dateStr) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === today.getTime()) return 'Today';
    if (eventDate < today) return 'Past';
    const diff = (eventDate - today) / (1000 * 60 * 60 * 24);
    return diff <= 7 ? 'This Week' : 'Upcoming';
  };

  const getStatusBadge = (dateStr) => {
    const status = determineStatus(dateStr);
    const variantMap = {
      Today: 'primary',
      'This Week': 'success',
      Upcoming: 'warning',
      Past: 'danger',
    };

    return (
      <OverlayTrigger overlay={<Tooltip>{status}</Tooltip>}>
        <Badge bg={variantMap[status]}>{status}</Badge>
      </OverlayTrigger>
    );
  };

  const handleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortedEvents = [...events]
    .filter((e) =>
      (e.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!statusFilter || determineStatus(e.event_date) === statusFilter)
    )
    .sort((a, b) => {
      const dateA = new Date(a.event_date);
      const dateB = new Date(b.event_date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);
  const currentEvents = sortedEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setFormData({
      eventName: event.event_name,
      eventDate: event.event_date.slice(0, 10),
      eventLocation: event.location,
      startTime: event.start_time,
      endTime: event.end_time,
    });
    setShowModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/organizer/edit-event/${selectedEvent.event_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col><h3 className="text-primary fw-bold">📅 My Events</h3></Col>
        <Col className="text-end">
          <ButtonGroup>
            <ExportCSVButton data={events} filename="events_export.csv" />
            <ExportPDFButton data={events} filename="events_export.pdf" />
          </ButtonGroup>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="🔍 Search by name or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadow-sm rounded-pill"
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

      <Table striped hover bordered responsive className="shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Event Name</th>
            <th style={{ cursor: 'pointer' }} onClick={handleSort}>
              Date {sortOrder === 'asc' ? <FaSortDown /> : <FaSortUp />}
            </th>
            <th>Status</th>
            <th>Location</th>
            <th>Time</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="7"><Spinner animation="border" className="mx-auto d-block my-3" /></td></tr>
          ) : sortedEvents.length === 0 ? (
            <tr><td colSpan="7" className="text-center">No matching events.</td></tr>
          ) : (
            currentEvents.map((event, idx) => (
              <tr key={event.event_id}>
                <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                <td className="text-capitalize">{event.event_name}</td>
                <td>{formatDate(event.event_date)}</td>
                <td>{getStatusBadge(event.event_date)}</td>
                <td className="text-capitalize">{event.location}</td>
                <td>{formatTime(event.start_time)} - {formatTime(event.end_time)}</td>
                <td>
                  <Button variant="outline-primary" size="sm" onClick={() => openEditModal(event)}>
                    <FaEdit />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Pagination className="justify-content-center">
        <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} />
        {[...Array(totalPages)].map((_, i) => (
          <Pagination.Item key={i} active={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>
            {i + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} />
      </Pagination>

      {/* 🔧 Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Edit Event</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                value={formData.eventLocation}
                onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                required
              />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" type="submit" className="w-100">Update Event</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
