'use client';
import { useSeating } from '../context/SeatingContext';
import SeatBox from './SeatBox';

export default function RowLayout() {
  const { seatingConfig } = useSeating();

  if (!seatingConfig) return <p>No row layout found.</p>;

  return (
    <div className="d-flex flex-column gap-3">
      {Array.from({ length: seatingConfig.number_of_rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="d-flex gap-2">
          <strong>Row {rowIndex + 1}</strong>
          {Array.from({ length: seatingConfig.seats_per_row }).map((_, seatIndex) => (
            <SeatBox key={seatIndex} seatId={`R${rowIndex + 1}-${seatIndex + 1}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
