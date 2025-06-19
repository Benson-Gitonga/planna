'use client';

import React from 'react';
import { Navbar, Container } from 'react-bootstrap';

export default function OrganizerTopbar({ user }) {
  return (
    <Navbar bg="light" className="shadow-sm px-3 border-bottom">
      <Container fluid className="d-flex justify-content-between align-items-center">
        <div>
          <h2 className="mb-0 fs-4">Organizer Dashboard</h2>
        </div>
        <div>
          <i className="bi bi-person-circle fs-4"></i>
          {user && <span className="ms-2">{user.name}</span>}
        </div>
      </Container>
    </Navbar>
  );
}
