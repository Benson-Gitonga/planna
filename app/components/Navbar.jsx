'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';

export default function MainNavbar() {
  return (
    <Navbar expand="lg" style={{ backgroundColor: '#1a1a1a' }} variant="dark">
      <Container>
        <Navbar.Brand href="/" style={{ color: '#1abc9c', fontWeight: 'bold' }}>
          Planna
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto">
            <Nav.Link as={Link} href="/" style={{ color: '#fff' }}>
              Home
            </Nav.Link>
            <NavDropdown title="Account" id="basic-nav-dropdown" menuVariant="dark">
              <NavDropdown.Item as={Link} href="/register">Sign Up</NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/login">Login</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
