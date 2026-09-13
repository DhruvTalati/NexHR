import React from 'react';

export default function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i);

    return (
        <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center">
                <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => onPageChange(page - 1)} disabled={page === 0}>
                        Previous
                    </button>
                </li>
                {pages.map((p) => (
                    <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => onPageChange(p)}>
                            {p + 1}
                        </button>
                    </li>
                ))}
                <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}>
                        Next
                    </button>
                </li>
            </ul>
        </nav>
    );
}
