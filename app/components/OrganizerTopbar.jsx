'use client';

import React from 'react';
import { Navbar, Container, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';

export default function OrganizerTopbar({ onToggle, isOpen }) {
  return (
    <Navbar bg="light" className="shadow-sm px-3 border-bottom">
      <Container fluid className="d-flex justify-content-between align-items-center">
        {/* ☰ Toggle with dynamic tooltip */}
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id="sidebar-toggle-tooltip">
              {isOpen ? 'Close menu' : 'Open menu'}
            </Tooltip>
          }
        >
          <button
            className="btn btn-outline-primary me-2"
            onClick={onToggle}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <i className="bi bi-list fs-4"></i>
          </button>
        </OverlayTrigger>

        <span className="fw-bold mb-0">Organizer Dashboard</span>

        <Dropdown align="end">
          <Dropdown.Toggle variant="light" id="profile-dropdown" className="border-0">
            <i className="bi bi-person-circle fs-4"></i>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item href="#">Profile</Dropdown.Item>
            <Dropdown.Item href="#">Settings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item href="page.jsx">Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Container>
    </Navbar>
  );
}
