'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OrganizerSidebar from '../components/sidebar';
import OrganizerTopbar from '../components/Organizertopbar';

export default function OrganizerLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleLogout = async () => {
    await fetch('http://localhost:5000/api/logout', {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/me', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        if (data.user.role !== 'organizer') throw new Error('Forbidden');
        setUser(data.user);
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <OrganizerSidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main
          style={{
            flex: 1,
            marginLeft: sidebarOpen ? 220 : 70,
            padding: '2rem',
            paddingTop: '80px', // leave space for topbar
            transition: 'margin-left 0.3s ease',
          }}
        >
          {children}
        </main>
      </div>
    </>
  );
}
