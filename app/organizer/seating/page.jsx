'use client';
import { useEffect } from 'react';
import { SeatingProvider } from '../../context/SeatingContext';
import SeatingLayoutSwitcher from '../../components/SeatingLayoutSwitcher';
import TableLayout from '../../components/TableLayout';
import RowLayout from  '../../components/RowLayout';
import AutoAssignButton from '../../components/AutoAssignButton';
import { useSeating } from '../../context/SeatingContext';
import '../../components/Seating.css';


function SeatingUI({ eventId }) {
  const { layoutType } = useSeating();

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Seating Arrangement for Event {eventId}</h3>
        <SeatingLayoutSwitcher />
      </div>
      <AutoAssignButton eventId={eventId} />
      {layoutType === 'table' ? <TableLayout /> : <RowLayout />}
    </div>
  );
}

export default function Page({ params }) {
  const { eventId } = params;

  return (
    <SeatingProvider>
      <SeatingUI eventId={eventId} />
    </SeatingProvider>
  );
}
