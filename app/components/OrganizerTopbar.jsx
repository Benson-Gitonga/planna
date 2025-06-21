'use client';

import React from 'react';
import { Navbar, Container, Dropdown } from 'react-bootstrap';

export default function OrganizerTopbar({ user, onLogout, sidebarOpen }) {
  const firstName = user?.firstName || 'Organizer';
  const leftOffset = sidebarOpen ? 220 : 70;

  return (
    <Navbar
      bg="white"
      className="shadow-sm border-bottom"
      expand="lg"
      fixed="top"
      style={{
        height: '64px',
        zIndex: 1040,
        left: `${leftOffset}px`,
        right: 0,
        position: 'fixed',
      }}
    >
      <Container fluid className="d-flex justify-content-end">
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="light"
            id="dropdown-user"
            className="d-flex align-items-center border-0"
            style={{ background: 'transparent', boxShadow: 'none' }}
          >
            <i className="bi bi-person-circle fs-4 me-2"></i>
            <span className="fw-medium">Hello, {firstName}</span>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={onLogout}>
              <i className="bi bi-box-arrow-right me-2"></i> Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Container>
    </Navbar>
  );
}
