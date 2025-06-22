'use client';
import { useSeating } from '../context/SeatingContext';
import SeatBox from './SeatBox';
import { Card } from 'react-bootstrap';

export default function TableLayout() {
  const { seatingConfig } = useSeating();

  if (!seatingConfig) return <p>No table layout found.</p>;

  const tables = Array.from({ length: seatingConfig.table_count });

  return (
    <div className="d-flex flex-wrap gap-3">
      {tables.map((_, tableIndex) => (
        <Card key={tableIndex} className="p-3">
          <h6>Table {tableIndex + 1}</h6>
          <div className="d-flex gap-2 flex-wrap">
            {Array.from({ length: seatingConfig.seats_per_table }).map((_, seatIndex) => (
              <SeatBox key={seatIndex} seatId={`T${tableIndex + 1}-${seatIndex + 1}`} />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
