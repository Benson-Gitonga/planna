'use client'
import React from 'react'
import RsvpGuestResponses from '@/app/components/EventGuestList';

export default function Page({ params }) {
  return <RsvpGuestResponses params={params} />;
}