'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { FaUserPlus, FaSignInAlt, FaUserCircle, FaInfoCircle } from 'react-icons/fa';

export default function MainNavbar() {
  return (
    <>
      <Navbar expand="lg" className="main-navbar shadow-sm" variant="dark" sticky="top">
        <Container>
          <Navbar.Brand
            as={Link}
            href="/"
            className="brand-gradient fw-bold fs-3"
            style={{ letterSpacing: '1px' }}
          >
            Planna
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-navbar" className="border-0" />

          <Navbar.Collapse id="main-navbar">
            <Nav className="ms-auto align-items-center gap-3">
              <Nav.Link
                as={Link}
                href="/guests/view-event"
                className="d-flex align-items-center gap-2 nav-link-custom"
              >
                <FaInfoCircle /> Event Info
              </Nav.Link>

              <NavDropdown
                title={<FaUserCircle size={22} />}
                id="user-nav-dropdown"
                align="end"
                menuVariant="dark"
                className="user-dropdown"
              >
                <NavDropdown.Item
                  as={Link}
                  href="/register"
                  className="d-flex align-items-center gap-2"
                >
                  <FaUserPlus /> Sign Up
                </NavDropdown.Item>
                <NavDropdown.Item
                  as={Link}
                  href="/login"
                  className="d-flex align-items-center gap-2"
                >
                  <FaSignInAlt /> Login
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <style jsx global>{`
        .main-navbar {
          background: #000000;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .brand-gradient {
          background: linear-gradient(90deg, #00e0b8 0%, #00ffab 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-link-custom {
          color: #ffffff !important;
          font-weight: 500;
          padding: 0.5rem 1rem;
          transition: color 0.3s, background 0.3s;
          border-radius: 6px;
        }

        .nav-link-custom:hover,
        .nav-link-custom:focus {
          color: #00e0b8 !important;
          background: rgba(0, 224, 184, 0.08);
          text-decoration: none;
        }

        .navbar-dark .navbar-nav .nav-link.active,
        .navbar-dark .navbar-nav .nav-link.show {
          color: #00e0b8 !important;
        }

        .navbar-dark .navbar-nav .dropdown-menu {
          background: #1e1e1e;
          border: none;
          border-radius: 8px;
          padding: 0.5rem 0;
        }

        .navbar-dark .navbar-nav .dropdown-item {
          color: #ffffff;
          padding: 0.5rem 1.25rem;
          font-weight: 500;
          transition: background 0.2s, color 0.2s;
        }

        .navbar-dark .navbar-nav .dropdown-item:hover,
        .navbar-dark .navbar-nav .dropdown-item:focus {
          background: #00e0b8;
          color: #121212;
        }

        .user-dropdown .dropdown-toggle::after {
          display: none;
        }
      `}</style>
    </>
  );
}
