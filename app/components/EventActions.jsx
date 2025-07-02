'use client';

import { useEffect, useState } from 'react';
import {
  Table, Button, Container, OverlayTrigger,
  Tooltip, InputGroup, Form, Modal, Pagination, Row, Col
} from 'react-bootstrap';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaFileUpload, FaPaperPlane, FaUsers, FaCalendarAlt,
  FaSort, FaSortUp, FaSortDown, FaSearch
} from 'react-icons/fa';
import ExportPDFButton from './ExportPDFButton';

export default function EventsTable() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 4;

  const [sendingEventId, setSendingEventId] = useState(null);
  const [sendingFinalEventId, setSendingFinalEventId] = useState(null);
  const [invitedEvents, setInvitedEvents] = useState([]);
  const [finalEmailSentEvents, setFinalEmailSentEvents] = useState([]);

  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [rsvpData, setRsvpData] = useState([]);
  const [activeRSVPEventName, setActiveRSVPEventName] = useState('');

  const router = useRouter();

  const getStatus = (dateStr) => {
    const today = new Date();
    const eventDate = new Date(dateStr);
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    if (eventDate < today) return 'Past';
    if (eventDate.getTime() === today.getTime()) return 'Today';
    return 'Upcoming';
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const sessionRes = await fetch('http://localhost:5000/api/me', { credentials: 'include' });
        if (sessionRes.status === 401) return router.push('/login');

        const sessionData = await sessionRes.json();
        if (sessionData.user.role !== 'organizer') return router.push('/login');

        const res = await fetch('http://localhost:5000/api/events', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No events created yet');

        setEvents(data.events);
        setFilteredEvents(data.events);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [router]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = events.filter(e =>
      (e.event_name.toLowerCase().includes(term) || e.location.toLowerCase().includes(term)) &&
      (statusFilter === 'All' || getStatus(e.event_date) === statusFilter)
    );
    setFilteredEvents(filtered);
    setCurrentPage(1);
  }, [searchTerm, events, statusFilter]);

  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    const sorted = [...filteredEvents].sort((a, b) => {
      if (field === 'event_date') {
        return direction === 'asc'
          ? new Date(a[field]) - new Date(b[field])
          : new Date(b[field]) - new Date(a[field]);
      }
      return direction === 'asc'
        ? a[field].localeCompare(b[field])
        : b[field].localeCompare(a[field]);
    });
    setSortField(field);
    setSortDirection(direction);
    setFilteredEvents(sorted);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="ms-1 text-muted" />;
    return sortDirection === 'asc'
      ? <FaSortUp className="ms-1 text-muted" />
      : <FaSortDown className="ms-1 text-muted" />;
  };

  const handleSendInvites = async (eventId, eventName) => {
    if (!confirm(`Send invites for ${eventName}?`)) return;
    setSendingEventId(eventId);
    try {
      const res = await fetch(`http://localhost:5000/api/send_invites/${eventId}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      setInvitedEvents(prev => [...prev, eventId]);
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingEventId(null);
    }
  };

  const handleSendFinalEmail = async (eventId, eventName) => {
    if (!confirm(`Send final email for "${eventName}" with QR codes and seats?`)) return;
    setSendingFinalEventId(eventId);
    try {
      const res = await fetch(`http://localhost:5000/api/organizer/send-final-email/${eventId}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      setFinalEmailSentEvents(prev => [...prev, eventId]);
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingFinalEventId(null);
    }
  };

  const handleViewRSVPs = async (eventId, eventName) => {
    try {
      const res = await fetch(`http://localhost:5000/api/organizer/event-rsvps/${eventId}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRsvpData(data.rsvps);
      setActiveRSVPEventName(eventName);
      setShowRSVPModal(true);
    } catch (err) {
      alert(err.message || 'No RSVP responses made yet');
    }
  };

  const statusBadge = (status) => {
    const variants = { Past: 'danger', Today: 'success', Upcoming: 'primary' };
    return <span className={`badge bg-${variants[status]}`}>{status}</span>;
  };

  const tooltipWrapper = (condition, text, children) => (
    condition ? (
      <OverlayTrigger overlay={<Tooltip>{text}</Tooltip>} placement="top">
        <span className="d-inline-block" style={{ pointerEvents: 'auto' }}>{children}</span>
      </OverlayTrigger>
    ) : children
  );

  const indexOfLast = currentPage * eventsPerPage;
  const indexOfFirst = indexOfLast - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h4 className="d-flex align-items-center gap-2">
            <FaCalendarAlt className="text-primary" />
            Manage Your Events
          </h4>
        </Col>
        <Col md="auto">
          <InputGroup>
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md="auto">
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>Past</option>
            <option>Today</option>
            <option>Upcoming</option>
          </Form.Select>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
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
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentEvents.map((event, index) => {
            const status = getStatus(event.event_date);
            const isPast = status === 'Past';

            return (
              <tr key={event.event_id}>
                <td>{indexOfFirst + index + 1}</td>
                <td>{event.event_name}</td>
                <td>{new Date(event.event_date).toLocaleDateString('en-GB')}</td>
                <td>{event.location}</td>
                <td>{event.start_time} - {event.end_time}</td>
                <td>{statusBadge(status)}</td>
                <td className="d-flex flex-wrap gap-2">
                  {/* Upload */}
                  {tooltipWrapper(isPast, 'Upload disabled for past events',
                    <Button as={Link} href={`/organizer/csvupload?eventId=${event.event_id}`} variant="outline-primary" size="sm" disabled={isPast}>
                      <FaFileUpload className="me-1" /> Upload
                    </Button>
                  )}

                  {/* Send Invite */}
                  {tooltipWrapper(isPast, 'Invites cannot be sent for past events',
                    <Button
                      variant="outline-success"
                      size="sm"
                      disabled={isPast || sendingEventId === event.event_id || invitedEvents.includes(event.event_id)}
                      onClick={() => handleSendInvites(event.event_id, event.event_name)}
                    >
                      <FaPaperPlane className="me-1" />
                      {invitedEvents.includes(event.event_id) ? 'Sent' : 'Invite'}
                    </Button>
                  )}

                  {/* Guests */}
                  <Button
                    as={Link}
                    href={`/organizer/guest-list/${event.event_id}`}
                    variant="outline-info"
                    size="sm"
                  >
                    <FaUsers className="me-1" /> Guests
                  </Button>

                  {/* View RSVPs */}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleViewRSVPs(event.event_id, event.event_name)}
                  >
                    <FaUsers className="me-1" /> View RSVPs
                  </Button>

                  {/* Seating */}
                  <Button
                    as={Link}
                    href={`/organizer/seating/${event.event_id}`}
                    variant="outline-warning"
                    size="sm"
                  >
                    <i className="bi bi-grid-3x3-gap me-1"></i> Seating
                  </Button>

                  {/* Final Email */}
                  {tooltipWrapper(isPast, 'Final email disabled for past events',
                    <Button
                      variant={finalEmailSentEvents.includes(event.event_id) ? 'success' : 'outline-danger'}
                      size="sm"
                      onClick={() => handleSendFinalEmail(event.event_id, event.event_name)}
                      disabled={isPast || sendingFinalEventId === event.event_id || finalEmailSentEvents.includes(event.event_id)}
                    >
                      <FaPaperPlane className="me-1" />
                      {finalEmailSentEvents.includes(event.event_id) ? 'Final Sent' : 'Final Email'}
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="justify-content-center mt-3">
          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item
              key={i}
              active={i + 1 === currentPage}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}

      {/* RSVP Modal */}
      <Modal size="lg" show={showRSVPModal} onHide={() => setShowRSVPModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>RSVP Responses - {activeRSVPEventName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {rsvpData.length === 0 ? (
            <p>No RSVP responses yet.</p>
          ) : (
            <>
              <div className="mb-3 text-end">
                <ExportPDFButton
                  data={rsvpData}
                  filename={`${activeRSVPEventName.replace(/\s+/g, '_')}_rsvp.pdf`}
                  title={`RSVPs - ${activeRSVPEventName}`}
                  columns={['#', 'Guest Name', 'Email', 'Category', 'RSVP', 'Checked In', 'Seat #']}
                  mapRow={(r, i) => [
                    i + 1,
                    `${r.first_name} ${r.last_name}`,
                    r.email_address,
                    r.category,
                    r.rsvp_status,
                    r.check_in_status ? 'Yes' : 'No',
                    r.seat_number || '—',
                  ]}
                />
              </div>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Guest Name</th>
                    <th>Email</th>
                    <th>Category</th>
                    <th>RSVP</th>
                    <th>Checked In</th>
                    <th>Seat #</th>
                  </tr>
                </thead>
                <tbody>
                  {rsvpData.map((r, i) => (
                    <tr key={r.guest_id}>
                      <td>{i + 1}</td>
                      <td>{r.first_name} {r.last_name}</td>
                      <td>{r.email_address}</td>
                      <td>{r.category}</td>
                      <td>{r.rsvp_status}</td>
                      <td>{r.check_in_status ? 'Yes' : 'No'}</td>
                      <td>{r.seat_number || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
