import React from 'react';

export default function StatsCard({ label, value, colorClass = 'primary' }) {
    return (
        <div className="col-md-3 col-sm-6 mb-3">
            <div className={`card border-${colorClass} h-100`}>
                <div className="card-body text-center">
                    <div className={`text-${colorClass}`} style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {value}
                    </div>
                    <div className="text-muted">{label}</div>
                </div>
            </div>
        </div>
    );
}
