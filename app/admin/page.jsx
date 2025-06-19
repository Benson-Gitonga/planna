'use client'

import React from 'react'
import CardItem from '../components/CardItem'
import Link from 'next/link'

const cards = [
{ icon: 'search', label: 'Search Account', link: '/admin/search-account' },
{ icon: 'person-plus', label: 'Add Account', link: '/admin/add-account' },
{ icon: 'calendar-check', label: 'Manage Events', link: '/admin/manage-events' },
{ icon: 'gear', label: 'System Settings', link: '/admin/system-settings' },
{ icon: 'bar-chart-line', label: 'View Statistics', link: '/admin/statistics' },
]

export default function Page() {
return (
<div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
<h2 className="mb-4 fw-bold text-center">Admin Dashboard</h2>
<div className="container">
<div className="row g-4 justify-content-center">
{cards.map((card, i) => (
<div key={i} className="col-6 col-md-4 col-lg-2">
<Link href={card.link} className="text-decoration-none">
<CardItem icon={card.icon} label={card.label} />
</Link>
</div>
))}
</div>
</div>
</div>
)
}