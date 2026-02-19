'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function getAvatarColor(name) {
    const colors = ['#3b82f6', '#d946ef', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function getCategoryIcon(category) {
    const icons = {
        'Web Development': '💻',
        'Design': '🎨',
        'Marketing': '📈',
        'Writing': '✍️',
        'Video': '🎬',
        'Music': '🎵',
        'Programming & Tech': '💻',
        'Graphics & Design': '🎨',
        'Digital Marketing': '📈',
        'Writing & Translation': '✍️',
        'Video & Animation': '🎬',
        'Business & Finance': '💼',
        'Data & Analytics': '📊',
    };
    return icons[category] || '✨';
}

const CATEGORIES = ['All', 'Web Development', 'Design', 'Marketing', 'Writing', 'Video', 'Music', 'Programming & Tech', 'Graphics & Design', 'Digital Marketing', 'Writing & Translation', 'Video & Animation', 'Business & Finance', 'Data & Analytics'];

export default function GigsPage() {
    const [gigs, setGigs] = useState([]);
    const [allGigs, setAllGigs] = useState([]);
    const [sellers, setSellers] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [maxPrice, setMaxPrice] = useState(10000);
    const [sliderMax, setSliderMax] = useState(10000);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q) setSearchQuery(q);
    }, []);

    useEffect(() => {
        fetch('/api/gigs')
            .then((res) => res.json())
            .then(async (data) => {
                const all = Array.isArray(data) ? data : [];
                setAllGigs(all);
                if (all.length > 0) {
                    const prices = all.map(g => g.price || 0);
                    const max = Math.max(...prices);
                    const ceilMax = Math.ceil(max / 1000) * 1000 || 10000;
                    setSliderMax(ceilMax);
                    setMaxPrice(ceilMax);
                }

                const sellerIds = [...new Set(all.map(g => g.sellerId).filter(Boolean))];
                const sellerMap = {};
                await Promise.all(
                    sellerIds.map(async (id) => {
                        try {
                            const res = await fetch(`/api/users?id=${id}`);
                            const user = await res.json();
                            if (user?.name) sellerMap[id] = user.name;
                        } catch {}
                    })
                );
                setSellers(sellerMap);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (allGigs.length > 0) {
            let filtered = [...allGigs];

            if (searchQuery) {
                const lowerQ = searchQuery.toLowerCase();
                filtered = filtered.filter(
                    (g) =>
                        g.title?.toLowerCase().includes(lowerQ) ||
                        g.description?.toLowerCase().includes(lowerQ) ||
                        g.category?.toLowerCase().includes(lowerQ)
                );
            }
            if (activeCategory && activeCategory !== 'All') {
                filtered = filtered.filter((g) => g.category === activeCategory);
            }
            filtered = filtered.filter((g) => (g.price || 0) <= maxPrice);

            setGigs(filtered);
        }
    }, [activeCategory, searchQuery, maxPrice, allGigs]);

    const pricePercent = sliderMax > 0 ? Math.round((maxPrice / sliderMax) * 100) : 100;

    return (
        <div className="section">
            <div className="container">
                <div className="section-header">
                    <div>
                        <h1 className="section-title">Browse Services</h1>
                        <p className="section-subtitle">Find the right freelancer for any project</p>
                    </div>
                </div>

                {/* Compact filter bar: keyword + category + max price all in one row */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0,
                    marginBottom: '1rem',
                    background: 'var(--color-surface)',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    height: '48px',
                    overflow: 'hidden',
                }}>
                    {/* Search by keyword */}
                    <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                        <svg
                            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--color-text-muted)' }}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                outline: 'none',
                                paddingLeft: '38px',
                                paddingRight: '12px',
                                fontSize: '0.9rem',
                                background: 'transparent',
                                color: 'var(--color-text)',
                            }}
                        />
                    </div>

                    {/* Divider */}
                    <div style={{ width: '1px', height: '24px', background: 'var(--color-border)', flexShrink: 0 }} />

                    {/* Category dropdown */}
                    <div style={{ flexShrink: 0 }}>
                        <select
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value)}
                            style={{
                                height: '48px',
                                border: 'none',
                                outline: 'none',
                                padding: '0 32px 0 14px',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                background: 'transparent',
                                color: 'var(--color-text)',
                                cursor: 'pointer',
                                appearance: 'none',
                                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E\")",
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 12px center',
                            }}
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Divider */}
                    <div style={{ width: '1px', height: '24px', background: 'var(--color-border)', flexShrink: 0 }} />

                    {/* Max price - compact inline slider */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '0 16px',
                        flexShrink: 0,
                        minWidth: '200px',
                    }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Max ₹</span>
                        <input
                            type="range"
                            min={0}
                            max={sliderMax}
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            style={{
                                flex: 1,
                                height: '4px',
                                accentColor: 'var(--color-primary)',
                                cursor: 'pointer',
                            }}
                        />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', whiteSpace: 'nowrap', minWidth: '50px', textAlign: 'right' }}>
                            ₹{maxPrice.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Category filter chips below the bar */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '2rem',
                }}>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '9999px',
                                fontSize: '0.82rem',
                                fontWeight: 500,
                                border: activeCategory === cat ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                                background: activeCategory === cat ? 'var(--color-primary)' : 'var(--color-surface)',
                                color: activeCategory === cat ? 'white' : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="gig-grid">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="card">
                                <div className="skeleton" style={{ height: 200 }}></div>
                                <div className="card-body">
                                    <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 12 }}></div>
                                    <div className="skeleton" style={{ height: 20, width: '90%', marginBottom: 12 }}></div>
                                    <div className="skeleton" style={{ height: 14, width: '40%' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : gigs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <h3>No services found</h3>
                        <p>Try adjusting your filters or check back later for new listings.</p>
                    </div>
                ) : (
                    <div className="gig-grid">
                        {gigs.map((gig) => {
                            const sellerName = sellers[gig.sellerId] || 'Freelancer';
                            return (
                                <Link href={`/gigs/${gig.id}`} key={gig.id} className="gig-card card">
                                    <div className="gig-card-image">
                                        {(gig.images && gig.images.length > 0) || gig.image ? (
                                            <img src={gig.images?.[0] || gig.image} alt={gig.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span className="category-icon">{getCategoryIcon(gig.category)}</span>
                                        )}
                                        <div className="price-tag">₹{gig.price}</div>
                                    </div>
                                    <div className="gig-card-body">
                                        <div className="gig-card-seller">
                                            <div
                                                className="avatar"
                                                style={{ background: getAvatarColor(sellerName) }}
                                            >
                                                {sellerName[0]}
                                            </div>
                                            <span className="gig-card-seller-name">{sellerName}</span>
                                        </div>
                                        <div className="gig-card-title">{gig.title}</div>
                                        <div className="gig-card-footer">
                                            <div className="stars">
                                                {'★'.repeat(Math.floor(gig.rating || 0))}{'☆'.repeat(5 - Math.floor(gig.rating || 0))}
                                                <span className="rating-value">{(gig.rating ?? 0).toFixed(1)}</span>
                                                <span className="review-count">({gig.reviewCount ?? 0})</span>
                                            </div>
                                            <span className="badge badge-primary">{gig.category}</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
