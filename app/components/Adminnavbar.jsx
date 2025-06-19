'use client'

import React from 'react'
import Link from 'next/link'

export default function AdminNavbar() {
return (
<nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom px-4">
<div className="container-fluid justify-content-between">
<span className="navbar-brand fw-bold">PLANNA</span>
<div className="d-flex align-items-center gap-4">
<Link href="/" className="nav-link">Home</Link>
<Link href="/about" className="nav-link">About Us</Link>
<i className="bi bi-person-circle fs-3"></i>
</div>
</div>
</nav>
)
}