'use client'
import React from 'react'
import Login from './components/Login'
import { Card, Container, Row, Col } from 'react-bootstrap';
import HeroSection from './components/HeroSection';
import AppNavbar from './components/Navbar';
import Testimonials from './components/Testimonials';
function page() {
  return (
    <div>
      <AppNavbar />
      <HeroSection />
      <Testimonials/>
    </div>    
              
  )
}

export default page