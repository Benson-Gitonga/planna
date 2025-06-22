'use client';

import { createContext, useContext, useState } from 'react';

const SeatingContext = createContext();

export const SeatingProvider = ({ children }) => {
  const [layoutType, setLayoutType] = useState('table'); // or 'row'
  const [guestList, setGuestList] = useState([]);
  const [seatingConfig, setSeatingConfig] = useState(null);
  const [lockedSeats, setLockedSeats] = useState(new Set());

  // Assign a seat to a guest
  const updateSeatAssignment = (guestId, newSeatId) => {
    setGuestList(prev =>
      prev.map(g =>
        g.id === guestId ? { ...g, seat_number: newSeatId } : g
      )
    );
  };

  // Automatically assign unseated guests
  const autoAssignSeats = async (eventId) => {
    try {
      const res = await fetch(`/api/seating/generate/${eventId}`, {
        method: 'POST',
      });
      const data = await res.json();
      setGuestList(data.updatedGuests || []);
    } catch (err) {
      console.error('Failed to auto-assign seats:', err);
    }
  };

  return (
    <SeatingContext.Provider
      value={{
        layoutType,
        setLayoutType,
        guestList,
        setGuestList,
        seatingConfig,
        setSeatingConfig,
        updateSeatAssignment,
        autoAssignSeats,
        lockedSeats,
        setLockedSeats,
      }}
    >
      {children}
    </SeatingContext.Provider>
  );
};

export const useSeating = () => useContext(SeatingContext);
