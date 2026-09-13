import React, { useEffect } from 'react';

/**
 * Simple, dependency-free toast. Auto-dismisses after `duration` ms.
 * Not a portal/stack manager - one toast at a time is enough for this app.
 */
export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
    useEffect(() => {
        if (!message) return undefined;
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    const bgClass = type === 'error' ? 'bg-danger' : 'bg-success';

    return (
        <div
            className={`toast show text-white ${bgClass} position-fixed`}
            style={{ top: 20, right: 20, zIndex: 1080, minWidth: 260 }}
        >
            <div className="d-flex justify-content-between align-items-center p-3">
                <span>{message}</span>
                <button
                    type="button"
                    className="close text-white ml-3"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        </div>
    );
}
