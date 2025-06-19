'use client'

import React from 'react'
import './CardItem.css'

export default function CardItem({ icon, label }) {
    return (
        <div className="card card-hover text-center shadow-sm h-100 p-4 border-0 bg-white">
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '120px' }}>
                <i className={`bi bi-${icon} fs-1 text-primary mb-2`}></i>
                <span className="fw-semibold">{label}</span>
            </div>
        </div>
    )
}