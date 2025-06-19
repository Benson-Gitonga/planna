'use client'

import React from 'react'
import AdminNavbar from '../components/Adminnavbar'


export default function AdminLayout({ children }) {
return (
<html lang="en">
<body className="d-flex flex-column min-vh-100">
<AdminNavbar />
<main className="flex-fill container py-4">
{children}
</main>

</body>
</html>
)
}