'use client';

import 'bootswatch/dist/flatly/bootstrap.min.css';
import './global.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'aos/dist/aos.css'; 
import './components/seating.css'; 

import Footer from './components/Footer';
import AOS from 'aos';
import { useEffect } from 'react';

export default function PublicLayout({ children }) {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <html lang="en">
      <head />
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
