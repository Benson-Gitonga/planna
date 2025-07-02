'use client';
import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';

export default function TotalGuestsCard() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchTotalGuests = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/organizer/total-guests', {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setCount(data.total_guests || 0);
        }
      } catch (err) {
        console.error('Failed to load total guests:', err);
      }
    };
    fetchTotalGuests();
  }, []);

  return (
    <StatCard
      title="Total Guests"
      value={count}
      description="Guests invited across all events"
      type="organizers"
    />
  );
}
