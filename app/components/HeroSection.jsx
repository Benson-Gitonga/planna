'use client';

import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <div
      style={{
        background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)',
        color: '#ffffff',
        padding: '80px 0',
      }}
    >
      <Container>
        <Row className="align-items-center">
          {/* Text Content */}
          <Col
            md={6}
            className="mb-4 mb-md-0"
            data-aos="fade-right"
          >
            <h1 style={{ fontSize: '2.8rem', fontWeight: 'bold' }}>
              Simplify Your Event Planning
            </h1>
            <p className="mt-3" style={{ fontSize: '1.15rem', color: '#d1d1d1' }}>
              From sending invites to tracking RSVPs and managing guests, our all-in-one platform gives organizers the power to host smooth, stress-free events.
            </p>
            <div className="d-flex gap-3 mt-4">
              <Button variant="outline-light" size="lg" href="/register">
                Get Started
              </Button>
              <Button variant="light" size="lg" href="/login" style={{ color: '#0f2027' }}>
                Login
              </Button>
            </div>
          </Col>

          {/* Image Content */}
          <Col md={6} className="text-center" data-aos="fade-left">
            <Image
              src="/heroimage.jpg"
              alt="Event illustration"
              width={500}
              height={350}
              style={{
                borderRadius: '10px',
                maxWidth: '100%',
                height: 'auto',
              }}
              priority
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}
