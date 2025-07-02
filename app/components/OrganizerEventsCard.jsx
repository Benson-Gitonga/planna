'use client';
import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';

export default function TotalEventsCard() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchTotalEvents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/organizer/total-events', {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setCount(data.total_events || 0);
        }
      } catch (err) {
        console.error('Failed to load total events:', err);
      }
    };
    fetchTotalEvents();
  }, []);

  return (
    <StatCard
      title="Total Events"
      value={count}
      description="Events you've created"
      type="events"
    />
  );
}
