'use client';

import React from 'react';

export default function AdminFooter() {
  return (
    <footer
      style={{
        backgroundColor: '#1a1a1a',
        color: '#cccccc',
        padding: '2rem 1rem',
        textAlign: 'center',
        borderTop: '1px solid #2c5364'
      }}
    >
      <p className="mb-2">Follow us on:</p>
      <div className="d-flex justify-content-center gap-4 fs-5 text-white">
        <i className="bi bi-facebook" style={{ cursor: 'pointer' }}></i>
        <i className="bi bi-instagram" style={{ cursor: 'pointer' }}></i>
        <i className="bi bi-linkedin" style={{ cursor: 'pointer' }}></i>
      </div>
      <p className="mt-3 small">&copy; 2025 Planna. All rights reserved.</p>
    </footer>
  );
}
