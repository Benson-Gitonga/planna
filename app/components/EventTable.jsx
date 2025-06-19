'use client'
import { useState, useEffect } from 'react';
import { Table, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

const EventTable = ({events}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    
    useEffect(() => {
        if (!events) {
        setError('Failed to load events');
        setLoading(false);
        } else {
        setLoading(false);
        }
    }, [events]);
    
    const handleDelete = async (eventId) => {
        if (confirm('Are you sure you want to delete this event?')) {
        try {
            const response = await fetch(`http://localhost:5000/api/all-events`, {
            method: 'DELETE',
            credentials: 'include',
            });
    
            if (!response.ok) {
            throw new Error('Failed to delete event');
            }
    
            // Optionally, refresh the page or update the state to reflect the deletion
            router.reload();
        } catch (err) {
            setError(err.message);
        }
        }
    };
    
    return (
        <Container>
        <Row className="my-4">
            <Col>
            <h5>Event List</h5>
            {error && <Alert variant="danger">{error}</Alert>}
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <Table striped bordered hover>
                <thead>
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
                    {events.map(event => (
                    <tr key={event.event_id}>
                        <td>{event.event_name}</td>
                        <td>{new Date(event.event_date).toLocaleDateString()}</td>
                        <td>{event.location}</td>
                        <td>{event.start_time}</td>
                        <td>{event.end_time}</td>
                        <td>
                        <Button variant="danger" onClick={() => handleDelete(event.event_id)}>Delete</Button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </Table>
            )}
            </Col>
        </Row>
        </Container>
    );
}

export default EventTable;