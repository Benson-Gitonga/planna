'use client';
import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';

export default function AttendanceRateCard() {
  const [rate, setRate] = useState('0');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/organizer/attendance-rate', {
          credentials: 'include',
        });
        const data = await res.json();

        if (res.ok && data.attendance_rate_per_event?.length > 0) {
          let totalGuests = 0;
          let checkedIn = 0;

          data.attendance_rate_per_event.forEach(ev => {
            totalGuests += ev.total_guests;
            checkedIn += ev.checked_in;
          });

          const avg = totalGuests > 0 ? (checkedIn / totalGuests) * 100 : 0;
          setRate(avg.toFixed(2));
        }
      } catch (err) {
        console.error('Failed to load attendance rate:', err);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <StatCard
      title="Avg Attendance"
      value={rate}
      description="Checked-in guests / RSVP Confirmations"
      type="rsvps"
    />
  );
}
