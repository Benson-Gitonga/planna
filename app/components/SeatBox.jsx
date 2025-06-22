'use client';
import { useSeating } from '../context/SeatingContext';
import { useDrop } from 'react-dnd';
import GuestCard from './GuestCard';
import { Card } from 'react-bootstrap';

export default function SeatBox({ seatId }) {
  const { guestList, updateSeatAssignment } = useSeating();

  const guest = guestList.find(g => g.seat_number === seatId);

  const [, drop] = useDrop({
    accept: 'GUEST',
    drop: (draggedGuest) => {
      updateSeatAssignment(draggedGuest.id, seatId);
    },
  });

  return (
    <Card ref={drop} className="p-2 seat-box text-center">
      <div className="small text-muted">{seatId}</div>
      {guest ? <GuestCard guest={guest} /> : <div className="text-muted">Empty</div>}
    </Card>
  );
}
