'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Form, Button, Container, Row, Col, Alert, Spinner, Card
} from 'react-bootstrap';
import { FaChair, FaUsers } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function SeatingPage() {
  const { eventId } = useParams();

  const [layoutType, setLayoutType] = useState('table');
  const [tableCount, setTableCount] = useState(2);
  const [seatsPerTable, setSeatsPerTable] = useState(4);
  const [rowCount, setRowCount] = useState(3);
  const [seatsPerRow, setSeatsPerRow] = useState(5);
  const [guests, setGuests] = useState([]);
  const [assigned, setAssigned] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [configExists, setConfigExists] = useState(false);

  const BACKEND_URL = 'http://localhost:5000';

  useEffect(() => {
    if (eventId) loadSeating();
  }, [eventId]);

  const loadSeating = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/seating/${eventId}`, {
        credentials: 'include'
      });
      const text = await res.text();
      if (text.startsWith('<!DOCTYPE')) throw new Error('Received HTML instead of JSON');
      const data = JSON.parse(text);

      if (!res.ok || !data.seating_configuration) {
        setConfigExists(false);
        setMessage(data.error || 'No configuration found yet. Create one.');
        setLoading(false);
        return;
      }

      const grouped = {};
      data.assigned_guests?.forEach((g) => {
        if (g.seat_number) grouped[g.seat_number] = g;
      });

      const config = data.seating_configuration;
      if (config.table_count && config.seats_per_table) {
        setLayoutType('table');
        setTableCount(config.table_count);
        setSeatsPerTable(config.seats_per_table);
      } else if (config.number_of_rows && config.seats_per_row) {
        setLayoutType('rows');
        setRowCount(config.number_of_rows);
        setSeatsPerRow(config.seats_per_row);
      }

      setAssigned(grouped);
      setGuests(data.assigned_guests || []);
      setConfigExists(true);
      setMessage('');
    } catch (err) {
      console.error('Error loading seating:', err);
      setMessage('Error loading seating configuration');
    }
    setLoading(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = layoutType === 'table'
        ? { layoutType, table_count: tableCount, seats_per_table: seatsPerTable }
        : { layoutType, number_of_rows: rowCount, seats_per_row: seatsPerRow };

      const res = await fetch(`${BACKEND_URL}/api/seating/guest/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Error submitting config:', data);
        setMessage(data.error || 'Error creating configuration');
      } else {
        setMessage('Configuration created!');
        setConfigExists(true);
        loadSeating();
      }
    } catch (err) {
      console.error('Submit error:', err);
      setMessage('Error submitting seating configuration');
    }
    setLoading(false);
  };

  const autoAssign = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/seating/${eventId}/auto-assign`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      alert(data.message);
      loadSeating();
    } catch (err) {
      console.error('Auto assign error:', err);
      alert('Failed to auto-assign');
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const seat = destination.droppableId;
    const guestId = parseInt(draggableId);

    try {
      const res = await fetch(`${BACKEND_URL}/api/seating/${eventId}/guest/${guestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newSeatNumber: seat }),
      });

      if (res.ok) {
        const guest = guests.find((g) => g.guest_id === guestId);
        setAssigned((prev) => ({ ...prev, [seat]: guest }));
      }
    } catch (err) {
      console.error('Drag drop error:', err);
    }
  };

  const generateSeats = () => {
    const seats = [];
    if (layoutType === 'table') {
      for (let t = 1; t <= tableCount; t++) {
        for (let s = 1; s <= seatsPerTable; s++) {
          seats.push(`Table ${t} - Seat ${s}`);
        }
      }
    } else {
      for (let r = 1; r <= rowCount; r++) {
        for (let s = 1; s <= seatsPerRow; s++) {
          seats.push(`Row ${r} - Seat ${s}`);
        }
      }
    }
    return seats;
  };

  return (
    <Container className="py-5">
      <h4 className="mb-4 fw-bold text-center">Seating Arrangement</h4>

      {!configExists && (
        <Card className="p-4 shadow-sm mb-5">
          <Form onSubmit={handleFormSubmit}>
            <Row className="g-4 align-items-end">
              <Col md={3}>
                <Form.Label className="fw-semibold">Layout</Form.Label>
                <Form.Select value={layoutType} onChange={(e) => setLayoutType(e.target.value)}>
                  <option value="table">Table Layout</option>
                  <option value="rows">Row Layout</option>
                </Form.Select>
              </Col>

              {layoutType === 'table' ? (
                <>
                  <Col md={3}>
                    <Form.Label className="fw-semibold">Number of Tables</Form.Label>
                    <Form.Control type="number" value={tableCount} min={1} onChange={(e) => setTableCount(Number(e.target.value))} />
                  </Col>
                  <Col md={3}>
                    <Form.Label className="fw-semibold">Seats per Table</Form.Label>
                    <Form.Control type="number" value={seatsPerTable} min={1} onChange={(e) => setSeatsPerTable(Number(e.target.value))} />
                  </Col>
                </>
              ) : (
                <>
                  <Col md={3}>
                    <Form.Label className="fw-semibold">Number of Rows</Form.Label>
                    <Form.Control type="number" value={rowCount} min={1} onChange={(e) => setRowCount(Number(e.target.value))} />
                  </Col>
                  <Col md={3}>
                    <Form.Label className="fw-semibold">Seats per Row</Form.Label>
                    <Form.Control type="number" value={seatsPerRow} min={1} onChange={(e) => setSeatsPerRow(Number(e.target.value))} />
                  </Col>
                </>
              )}

              <Col md={3}>
                <Button type="submit" variant="primary" className="w-100 py-2">Create Layout</Button>
              </Col>
            </Row>
          </Form>
        </Card>
      )}

      {configExists && (
        <Row className="mb-4 justify-content-center">
          <Col md={4}>
            <Button variant="warning" className="w-100" onClick={autoAssign}>Auto Assign Seats</Button>
          </Col>
        </Row>
      )}

      {message && <Alert variant="info" className="text-center">{message}</Alert>}
      {loading && <div className="text-center"><Spinner animation="border" /></div>}

      {configExists && (
        <Row>
          <DragDropContext onDragEnd={onDragEnd}>
            <Col md={3}>
              <Card className="p-3 shadow-sm">
                <h5 className="mb-3">Unassigned Guests</h5>
                <Droppable droppableId="unassigned">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {guests.filter((g) => !g.seat_number).map((g, i) => (
                        <Draggable key={g.guest_id} draggableId={g.guest_id.toString()} index={i}>
                          {(provided) => (
                            <div
                              className="guest-tag mb-2 p-2 border rounded bg-light d-flex align-items-center"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <FaUsers className="me-2 text-primary" /> {g.first_name} {g.last_name}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card>
            </Col>

            <Col md={9}>
              <div className="seating-grid">
                {generateSeats().map((seat) => (
                  <Droppable droppableId={seat} key={seat}>
                    {(provided) => (
                      <div
                        className="seat-box border rounded p-3 mb-3 shadow-sm bg-white"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <div className="seat-label fw-semibold mb-2">
                          <FaChair className="me-1 text-secondary" /> {seat}
                        </div>
                        {assigned[seat] && (
                          <div className="guest-tag filled p-2 bg-info text-white rounded">
                            <FaUsers className="me-2" /> {assigned[seat].first_name} {assigned[seat].last_name}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </Col>
          </DragDropContext>
        </Row>
      )}
    </Container>
  );
}
