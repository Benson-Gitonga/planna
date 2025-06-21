'use client';

import { useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import AOS from 'aos';
import 'aos/dist/aos.css';

const testimonials = [
  {
    name: 'Peter Bannks',
    image: '/person1.jpg',
    text: 'This platform made managing my events seamless. The guest tracking and invite system is top-notch!',
  },
  {
    name: 'Alfred Owiti',
    image: '/person2.jpg',
    text: 'Clean UI, fast email delivery, and QR codes for check-in. What more could an organizer ask for?',
  },
  {
    name: 'Emily Taylor',
    image: '/person3.jpg',
    text: 'Our guests loved the personalized invites. The system is reliable, intuitive, and beautifully designed.',
  },
  {
    name: 'Michael Brown',
    image: '/person4.jpg',
    text: 'RSVP tracking and CSV upload made our large event super easy to manage. Highly recommended!',
  },
];

export default function Testimonials() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });
  }, []);

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h2
          className="fw-bold text-dark"
          style={{ fontSize: '2.5rem' }}
          data-aos="fade-up"
          data-aos-duration="1200"
        >
          What Organizers Are Saying
        </h2>
        <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }} data-aos="fade-up" data-aos-delay="200">
          Hear directly from the people who trust our system to power their events, guests, and invitations.
        </p>
      </div>

      <Row className="g-4">
        {testimonials.map((review, index) => (
          <Col key={index} md={6} lg={3}>
            <Card
              className="h-100 p-4 text-center border-0 testimonial-card"
              data-aos="fade-up"
              data-aos-delay={index * 200}
              style={{
                borderRadius: '16px',
                transition: 'transform 0.4s ease, box-shadow 0.4s ease',
              }}
            >
              <div className="d-flex justify-content-center mb-3">
                <img
                  src={review.image}
                  alt={review.name}
                  className="rounded-circle shadow-sm"
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <Card.Body className="px-2">
                <Card.Text className="text-muted fst-italic" style={{ fontSize: '0.95rem' }}>
                  <i className="bi bi-quote"></i> {review.text}
                </Card.Text>
                <Card.Title className="mt-3 fw-semibold">{review.name}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <style jsx>{`
        .testimonial-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </Container>
  );
}
