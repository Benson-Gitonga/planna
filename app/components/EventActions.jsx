'use client';

import { useEffect, useState } from 'react';
import {
  Table, Button, Spinner, Alert, Container, OverlayTrigger,
  Tooltip, InputGroup, Form, Modal
} from 'react-bootstrap';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaFileUpload, FaPaperPlane, FaUsers, FaCalendarAlt,
  FaSort, FaSortUp, FaSortDown, FaSearch
} from 'react-icons/fa';

export default function EventsTable() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const [sendingEventId, setSendingEventId] = useState(null);
  const [sendingFinalEventId, setSendingFinalEventId] = useState(null);
  const [invitedEvents, setInvitedEvents] = useState([]);
  const [finalEmailSentEvents, setFinalEmailSentEvents] = useState([]);

  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [rsvpData, setRsvpData] = useState([]);
  const [activeRSVPEventName, setActiveRSVPEventName] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const sessionRes = await fetch('http://localhost:5000/api/me', { credentials: 'include' });
        if (sessionRes.status === 401) return router.push('/login');

        const sessionData = await sessionRes.json();
        if (sessionData.user.role !== 'organizer') return router.push('/unauthorized');

        const res = await fetch('http://localhost:5000/api/events', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch events');

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
    return sortDirection === 'asc'
      ? <FaSortUp className="ms-1 text-muted" />
      : <FaSortDown className="ms-1 text-muted" />;
  };

  const handleSendInvites = async (eventId, eventName) => {
    const confirmSend = confirm(`Send invites for ${eventName}?`);
    if (!confirmSend) return;

    setSendingEventId(eventId);

    try {
      const res = await fetch(`http://localhost:5000/api/send_invites/${eventId}`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invites');

      alert(data.message);
      setInvitedEvents((prev) => [...prev, eventId]);
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingEventId(null);
    }
  };

  const handleSendFinalEmail = async (eventId, eventName) => {
    const confirmSend = confirm(
      `Are you sure you want to send the final email for "${eventName}"?\n\n` +
      'This email will contain each guest’s assigned seat number and QR code for check-in. ' +
      'Make sure everything is finalized before sending.'
    );
    if (!confirmSend) return;

    setSendingFinalEventId(eventId);

    try {
      const res = await fetch(`http://localhost:5000/api/organizer/send-final-email/${eventId}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send final email');

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
      if (!res.ok) throw new Error(data.error || 'Failed to fetch RSVP data');

      setRsvpData(data.rsvps);
      setActiveRSVPEventName(eventName);
      setShowRSVPModal(true);
    } catch (err) {
      alert(err.message);
    }
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
              <td>{new Date(event.event_date).toLocaleDateString('en-GB')}</td>
              <td>{event.location}</td>
              <td>{event.start_time} - {event.end_time}</td>
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
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleSendInvites(event.event_id, event.event_name)}
                      disabled={sendingEventId === event.event_id || invitedEvents.includes(event.event_id)}
                    >
                      {sendingEventId === event.event_id ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-1"
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="me-1" />
                          {invitedEvents.includes(event.event_id) ? 'Sent' : 'Invite'}
                        </>
                      )}
                    </Button>
                  </OverlayTrigger>

                  <OverlayTrigger placement="top" overlay={<Tooltip>View Guest List</Tooltip>}>
                    <Link href={`/organizer/guest-list/${event.event_id}`} passHref>
                      <Button variant="outline-info" size="sm">
                        <FaUsers className="me-1" />
                        Guests
                      </Button>
                    </Link>
                  </OverlayTrigger>

                  <OverlayTrigger placement="top" overlay={<Tooltip>View RSVP Responses</Tooltip>}>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleViewRSVPs(event.event_id, event.event_name)}
                    >
                      <FaUsers className="me-1" />
                      View RSVPs
                    </Button>
                  </OverlayTrigger>

                  <OverlayTrigger placement="top" overlay={<Tooltip>Seating Arrangement</Tooltip>}>
                    <Link href={`/organizer/seating/${event.event_id}`} passHref>
                      <Button variant="outline-warning" size="sm">
                        <i className="bi bi-grid-3x3-gap me-1"></i>
                        Seating
                      </Button>
                    </Link>
                  </OverlayTrigger>

                  <OverlayTrigger placement="top" overlay={<Tooltip>Final Email with QR Code</Tooltip>}>
                    <Button
                      variant={finalEmailSentEvents.includes(event.event_id) ? 'success' : 'outline-danger'}
                      size="sm"
                      onClick={() => handleSendFinalEmail(event.event_id, event.event_name)}
                      disabled={sendingFinalEventId === event.event_id || finalEmailSentEvents.includes(event.event_id)}
                    >
                      {sendingFinalEventId === event.event_id ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-1"
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="me-1" />
                          {finalEmailSentEvents.includes(event.event_id) ? 'Final Sent' : 'Final Email'}
                        </>
                      )}
                    </Button>
                  </OverlayTrigger>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* RSVP Modal */}
      <Modal size="lg" show={showRSVPModal} onHide={() => setShowRSVPModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>RSVP Responses - {activeRSVPEventName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {rsvpData.length === 0 ? (
            <p>No RSVP responses yet.</p>
          ) : (
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
                {rsvpData.map((rsvp, index) => (
                  <tr key={rsvp.guest_id}>
                    <td>{index + 1}</td>
                    <td>{rsvp.first_name} {rsvp.last_name}</td>
                    <td>{rsvp.email_address}</td>
                    <td>{rsvp.category}</td>
                    <td>{rsvp.rsvp_status}</td>
                    <td>{rsvp.check_in_status ? 'Yes' : 'No'}</td>
                    <td>{rsvp.seat_number || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
