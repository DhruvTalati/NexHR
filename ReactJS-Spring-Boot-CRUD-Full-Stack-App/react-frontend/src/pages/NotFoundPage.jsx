import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="text-center mt-5">
            <h1 className="display-4">404</h1>
            <p className="text-muted">The page you're looking for doesn't exist.</p>
            <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
    );
}
