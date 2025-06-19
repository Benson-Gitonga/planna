'use client';

import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import Event from '../components/Event'
import { useState } from 'react';

const actions = [
    { label: 'Upload Guest List', href: '/csvupload', icon: 'bi-upload' },
    // Remove 'Create Event' from actions, will render inline with Event component
    { label: 'Create Seating', href: '/seating', icon: 'bi-grid-3x3-gap' },
    { label: 'View RSVP Responses', href: '/view-rsvp', icon: 'bi-person-check' }
];

export default function OrganizerDashboardHome() {
    const [showCreateEvent, setShowCreateEvent] = useState(false);

    return (
        <div className="container py-4">
            <h2 className="mb-4 text-center fw-bold">Welcome to the Organizer Dashboard</h2>
            <Row className="g-4 justify-content-center">
                {actions.map((action, idx) => (
                    <Col key={idx} xs={10} sm={6} md={4} lg={3}>
                        <Link href={action.href} className="text-decoration-none text-dark">
                            <Card className="text-center h-100 shadow-sm hover-shadow">
                                <Card.Body>
                                    <i className={`bi ${action.icon} fs-1 text-primary mb-3`}></i>
                                    <Card.Title>{action.label}</Card.Title>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                ))}
                {/* Add Create Event as a button that toggles the Event component */}
                <Col xs={10} sm={6} md={4} lg={3}>
                    <button
                        className="text-decoration-none text-dark btn p-0 w-100 h-100"
                        style={{ background: 'none', border: 'none' }}
                        onClick={() => setShowCreateEvent((prev) => !prev)}
                    >
                        <Card className="text-center h-100 shadow-sm hover-shadow">
                            <Card.Body>
                                <i className="bi bi-calendar-plus fs-1 text-primary mb-3"></i>
                                <Card.Title>Create Event</Card.Title>
                            </Card.Body>
                        </Card>
                    </button>
                </Col>
            </Row>
            {showCreateEvent && (
                <div className="mt-5">
                    <Event />
                </div>
            )}
        </div>
    );
}
