'use Client'

import { useState, useEffect } from 'react';
import {Container, Alert, Spinner} from 'react-bootstrap';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';

export default function RSVPsPerEventChart(){
    const [rsvpData, setRsvpData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRsvps = async () => {
            try{
                const res = await fetch('http://localhost:5000/api/admin/rsvps-per-event', {
                    credentials: 'include',
                });
                const data = await res.json();
                if(res.ok){
                    setRsvpData(data.rsvps_per_event);
                }else{
                    throw new Error(data.error || 'Failed to load RSVP data');
                }
            }catch(err){
                console.error('Error loading RSVP data:', err);
                setError('Failed to load RSVP analytics');
            }finally{
                setLoading(false);
            }
        };
        fetchRsvps();
    }, []);
    return (
        <Container className="my-5">
            <h5 className="mb-4 text-center">📊 RSVP Analytics</h5>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={rsvpData} margin={{ top: 5, right: 10, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="event_name" />
                        <YAxis allowDecimals={false}/>
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="accepted_rsvps" stackId="a" fill="#28a745" name="Accepted" />
                        <Bar dataKey="declined_rsvps" stackId="a" fill="#dc3545" name="Declined" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Container>
    );
}