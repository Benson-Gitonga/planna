'use client'
import { useState, useEffect } from 'react';
import {Container, Row, Col, Alert, Spinner, Table, Button} from 'react-bootstrap';
import StatCard from '@/app/components/StatCard';

export default function StatisticsBoard(){
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalOrganizers: 0,
        totalRSVPs: 0,
    })
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try{
                const [eventsRes, organizersRes, rsvpsRes] = await Promise.all([
                    fetch('http://localhost:5000/api/admin/total-events', {credentials: 'include'}),
                    fetch('http://localhost:5000/api/admin/total-organizers', {credentials: 'include'}),
                    fetch('http://localhost:5000/api/admin/total-rsvps', {credentials: 'include'})
                ]);
                const eventData = await eventsRes.json();
                const organizersData = await organizersRes.json();
                const rsvpsData = await rsvpsRes.json();

                setStats({
                    totalEvents: eventsData.total_events,
                    totalOrganizers: organizersData.total_organizers,
                    totalRSVPs: rsvpsData.total_rsvp_accepted,
                });
            }catch(err){
                setError('Failed to load statistics');
                console.error(err);
            }finally{
                setLoading(false);
            }
        };
        fetchStats();
    }, []);
    return (
        <Container>
            <Row className="my-4">
                <Col>
                    <h4>Application Stats</h4>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {loading ? (
                        <Spinner animation="border" />
                    ) : (
                        <Row>
                            <Col md={4}>
                                <StatCard title="Total Events" value={stats.totalEvents} />
                            </Col>
                            <Col md={4}>
                                <StatCard title="Total Organizers" value={stats.totalOrganizers} />
                            </Col>
                            <Col md={4}>
                                <StatCard title="Total RSVPs" value={stats.totalRSVPs} />
                            </Col>
                        </Row>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

