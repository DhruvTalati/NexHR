import React, { useState } from 'react';

export default function SearchBar({ placeholder = 'Search...', onSearch, initialValue = '' }) {
    const [value, setValue] = useState(initialValue);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(value.trim());
    };

    return (
        <form className="form-inline" onSubmit={handleSubmit}>
            <input
                type="text"
                className="form-control mr-2"
                style={{ minWidth: 240 }}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <button type="submit" className="btn btn-outline-primary">
                Search
            </button>
        </form>
    );
}
