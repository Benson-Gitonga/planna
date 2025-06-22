'use client';
import { useSeating } from '../context/SeatingContext';
import { Button } from 'react-bootstrap';

export default function AutoAssignButton({ eventId }) {
  const { autoAssignSeats } = useSeating();

  return (
    <Button onClick={() => autoAssignSeats(eventId)} className="mb-3">
      Auto-Assign Unseated Guests
    </Button>
  );
}
