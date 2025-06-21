'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { FaUserPlus, FaSignInAlt, FaUserCircle, FaQuestionCircle } from 'react-icons/fa';

export default function MainNavbar() {
  return (
    <Navbar expand="lg" className="shadow-sm" style={{ backgroundColor: '#121212' }} variant="dark" sticky="top">
      <Container>
        <Navbar.Brand
          href="/"
          style={{
            color: '#00e0b8',
            fontWeight: 'bold',
            fontSize: '1.6rem',
            letterSpacing: '1px',
          }}
        >
          Planna
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" style={{ borderColor: '#00e0b8' }} />

        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto">
            <NavDropdown
              title={<FaUserCircle size={22} />}
              id="user-nav-dropdown"
              align="end"
              menuVariant="dark"
              className="fw-semibold"
            >
              <NavDropdown.Item as={Link} href="/register" className="d-flex align-items-center gap-2">
                <FaUserPlus /> Sign Up
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/login" className="d-flex align-items-center gap-2">
                <FaSignInAlt /> Login
              </NavDropdown.Item>
              <NavDropdown.Divider />
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
