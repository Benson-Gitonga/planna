'use client'
import { useState, useEffect } from 'react';
import EventTable from '@/app/components/EventTable';

export default function ManageEvents(){
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        const fetchEvents = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/all-events', {
            credentials: 'include',
            });
            if (!response.ok) {
            throw new Error('Failed to fetch events');
            }
            const data = await response.json();
            setEvents(data.events);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        };
    
        fetchEvents();
    }, []);
    
    return (
        <div>
        <h4>Manage Events</h4>
        {error && <p className="text-danger">{error}</p>}
        {loading ? <p>Loading...</p> : <EventTable events={events} />}
        </div>
    );
}