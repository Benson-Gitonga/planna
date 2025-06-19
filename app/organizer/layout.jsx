'use client';

import React, { useState } from 'react';
import '../components/sidebar.css';
import EventForm from '../components/Event'; // Adjust path if needed
import CsvUpload from '../components/CsvUpload'; // Import your CsvUpload component

const links = [
    { label: 'Upload Guest List', key: 'upload' },
    { label: 'Create Event', key: 'createEvent' },
    { label: 'Create Seating', key: 'createSeating' },
    { label: 'View Events', key: 'viewEvents' },
    { label: 'View RSVP Responses', key: 'viewRSVP' }
];

function UploadGuestList() {
    return (
        <div>
            <h2>Upload Guest List</h2>
            <CsvUpload /> {/* Use imported CsvUpload here */}
        </div>
    );
}
function CreateSeating() {
    return <div><h2>Create Seating</h2><p>Create seating content here.</p></div>;
}
function ViewEvents() {
    return <div><h2>View Events</h2><p>View events content here.</p></div>;
}
function ViewRSVP() {
    return <div><h2>View RSVP Responses</h2><p>View RSVP responses content here.</p></div>;
}

const contentMap = {
    upload: <UploadGuestList />,
    createEvent: <EventForm />,
    createSeating: <CreateSeating />,
    viewEvents: <ViewEvents />,
    viewRSVP: <ViewRSVP />
};

export default function Page() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selected, setSelected] = useState('upload');
    const [menuHover, setMenuHover] = useState(false);

    const handleSidebarClick = (key) => {
        setSelected(key);
        setSidebarOpen(false);
    };

    return (
        <div className="d-flex">
            {/* Menu Button */}
            <div
                className="position-fixed top-0 start-0 p-2"
                style={{ zIndex: 1050, marginTop: '20px', marginLeft: '20px' }} // Add margin
            >
                <button
                    className="btn btn-outline-dark"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    onMouseEnter={() => setMenuHover(true)}
                    onMouseLeave={() => setMenuHover(false)}
                >
                    <i className={`bi ${sidebarOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
                </button>
                {menuHover && (
                    <div
                        style={{
                            position: 'absolute',
                            left: '110%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: '#222',
                            color: '#fff',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap',
                            fontSize: '0.9rem'
                        }}
                    >
                        {sidebarOpen ? 'close menu' : 'open menu'}
                    </div>
                )}
            </div>
            {/* Sidebar */}
            <div
                className={`organizer-sidebar bg-dark text-white vh-100 position-fixed top-0 start-0 p-4 shadow-lg ${sidebarOpen ? 'sidebar-open' : ''}`}
                style={{ width: '250px', zIndex: 1040, display: sidebarOpen ? 'flex' : 'none', flexDirection: 'column', justifyContent: 'flex-end' }}
            >
                <nav className="d-flex flex-column gap-3" style={{ marginBottom: '40px' }}>
                    {links.map((link) => (
                        <button
                            key={link.key}
                            className={`d-flex align-items-center gap-2 px-2 py-2 rounded text-decoration-none btn btn-link text-start ${selected === link.key ? 'bg-primary text-white' : 'text-white'}`}
                            style={{ border: 'none', background: 'none' }}
                            onClick={() => handleSidebarClick(link.key)}
                        >
                            <span>{link.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            {/* Main Content */}
            <main className="flex-grow-1 p-4" style={{ marginLeft: sidebarOpen ? '250px' : '0', transition: 'margin-left 0.3s ease' }}>
                {contentMap[selected]}
            </main>
        </div>
    );
}
