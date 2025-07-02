'use client';
import { Container, Row, Col } from 'react-bootstrap';
import TotalEventsCard from '../../components/OrganizerEventsCard';
import TotalGuestsCard from '../../components/OrganizerTotalGuestsCard';
import AttendanceRateChart from '../../components/OrganizerAttendanceRateChart';
import RSVPDistributionChart from '../../components/OrganizerRSVPDistributionChart';
import AttendanceRateCard from '../../components/OrganizerAttendanceRateCard'

export default function OrganizerAnalyticsPage() {
  return (
    <Container className="py-4">
      <h4 className="mb-4 fw-bold">📊 Organizer Analytics</h4>

      <Row className="mb-4">
        <Col md={6} lg={4}><TotalEventsCard /></Col>
        <Col md={6} lg={4}><TotalGuestsCard /></Col>
        <Col md={6} lg={4}><AttendanceRateCard /></Col>
      </Row>

      <Row>
        <Col lg={6}><AttendanceRateChart /></Col>
      </Row>
    </Container>
  );
}
