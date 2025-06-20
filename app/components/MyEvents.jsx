'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';
import ExportCSVButton from './ExportCSVButton';
import ExportPDFButton from './ExportPdfButton';
import Link from 'next/link';
import { FaFileUpload, FaPaperPlane, FaUsers, FaDownload } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

export default function EventActionsTable() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

   

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <>
    <div className="d-flex justify-content-between align-items-center mb-3">
  <h3>Your Events</h3>
  <div className="d-flex gap-2">
    <ExportCSVButton data={events} filename="events_export.csv" />
    <ExportPDFButton data={events} filename="events_export.pdf" />
  </div>
</div>    

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Event Name</th>
            <th>Date</th>
            <th>Location</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr key={event.event_id}>
              <td>{index + 1}</td>
              <td>{event.event_name}</td>
              <td>{event.event_date}</td>
              <td>{event.location}</td>
              <td>{event.start_time} - {event.end_time}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      </>
  );
}
