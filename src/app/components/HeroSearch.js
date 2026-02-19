'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroSearch() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/gigs?q=${encodeURIComponent(query.trim())}`);
        } else {
            router.push('/gigs');
        }
    };

    return (
        <form className="hero-search" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder='Try "website design" or "logo creation"'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">Search</button>
        </form>
    );
}
