'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaChair, FaUsers } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function SeatingPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  const [layoutType, setLayoutType] = useState('table');
  const [tableCount, setTableCount] = useState(2);
  const [seatsPerTable, setSeatsPerTable] = useState(4);
  const [rowCount, setRowCount] = useState(3);
  const [seatsPerRow, setSeatsPerRow] = useState(5);
  const [guests, setGuests] = useState([]);
  const [assigned, setAssigned] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/seating/${eventId}`);
      const data = await res.json();

      const grouped = {};
      data.assigned_guests?.forEach((g) => {
        if (g.seat_number) grouped[g.seat_number] = g;
      });

      setAssigned(grouped);
      setGuests(data.assigned_guests || []);
      setMessage('');
    } catch (err) {
      console.error(err);
      setMessage('Failed to load guests');
    }
    setLoading(false);
  };

  const autoAssign = async () => {
    const res = await fetch(`/api/seating/${eventId}/auto-assign`, { method: 'POST' });
    const data = await res.json();
    alert(data.message);
    handleFormSubmit();
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const seat = destination.droppableId;
    const guestId = parseInt(draggableId);

    const res = await fetch(`/api/seating/${eventId}/guest/${guestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newSeatNumber: seat }),
    });

    if (res.ok) {
      const guest = guests.find((g) => g.guest_id === guestId);
      setAssigned((prev) => ({ ...prev, [seat]: guest }));
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
    <Container className="py-4">
      <h2 className="mb-4">Seating Arrangement for Event #{eventId}</h2>

      <Form onSubmit={handleFormSubmit} className="mb-4">
        <Row className="align-items-end g-3">
          <Col md={3}>
            <Form.Label title="Select layout type">Layout Type</Form.Label>
            <Form.Select value={layoutType} onChange={(e) => setLayoutType(e.target.value)}>
              <option value="table">Table</option>
              <option value="rows">Rows</option>
            </Form.Select>
          </Col>

          {layoutType === 'table' ? (
            <>
              <Col md={3}>
                <Form.Label title="Select number of tables">Tables</Form.Label>
                <Form.Control
                  type="number"
                  value={tableCount}
                  min={1}
                  onChange={(e) => setTableCount(Number(e.target.value))}
                />
              </Col>
              <Col md={3}>
                <Form.Label title="Select seats per table">Seats/Table</Form.Label>
                <Form.Control
                  type="number"
                  value={seatsPerTable}
                  min={1}
                  onChange={(e) => setSeatsPerTable(Number(e.target.value))}
                />
              </Col>
            </>
          ) : (
            <>
              <Col md={3}>
                <Form.Label title="Select number of rows">Rows</Form.Label>
                <Form.Control
                  type="number"
                  value={rowCount}
                  min={1}
                  onChange={(e) => setRowCount(Number(e.target.value))}
                />
              </Col>
              <Col md={3}>
                <Form.Label title="Select seats per row">Seats/Row</Form.Label>
                <Form.Control
                  type="number"
                  value={seatsPerRow}
                  min={1}
                  onChange={(e) => setSeatsPerRow(Number(e.target.value))}
                />
              </Col>
            </>
          )}

          <Col md={3}>
            <Button type="submit" variant="primary" className="w-100">Generate Layout</Button>
          </Col>
          <Col md={3}>
            <Button type="button" variant="warning" className="w-100" onClick={autoAssign}>Auto Assign</Button>
          </Col>
        </Row>
      </Form>

      {message && <Alert variant="danger">{message}</Alert>}
      {loading && <Spinner animation="border" />}

      <Row>
        <DragDropContext onDragEnd={onDragEnd}>
          <Col md={3}>
            <Card className="guest-sidebar p-3">
              <h5>Unassigned Guests</h5>
              <Droppable droppableId="unassigned">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {guests.filter((g) => !g.seat_number).map((g, i) => (
                      <Draggable draggableId={g.guest_id.toString()} index={i} key={g.guest_id}>
                        {(provided) => (
                          <div
                            className="guest-tag mb-2"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <FaUsers className="me-2" />
                            {g.first_name} {g.last_name}
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
                    <div className="seat-box" ref={provided.innerRef} {...provided.droppableProps}>
                      <div className="seat-label">
                        <FaChair className="me-1" /> {seat}
                      </div>
                      {assigned[seat] && (
                        <div className="guest-tag filled">
                          <FaUsers className="me-2" />
                          {assigned[seat].first_name} {assigned[seat].last_name}
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
    </Container>
  );
}
