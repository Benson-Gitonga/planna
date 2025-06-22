'use client';
import { useDrag } from 'react-dnd';
import { Card } from 'react-bootstrap';

export default function GuestCard({ guest }) {
  const [, drag] = useDrag({
    type: 'GUEST',
    item: { id: guest.id },
  });

  return (
    <Card ref={drag} className="p-2 bg-light">
      <strong>{guest.first_name} {guest.last_name}</strong>
    </Card>
  );
}
