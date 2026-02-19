'use client';

import { useAuth } from '@/app/components/AuthProvider';
import { useRouter } from 'next/navigation';
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
        'Music & Audio': '🎵',
        'Business & Finance': '💼',
        'Data & Analytics': '📊',
    };
    return icons[category] || '✨';
}

function getStatusBadge(status) {
    const map = {
        pending: 'badge-warning',
        in_progress: 'badge-info',
        delivered: 'badge-info',
        completed: 'badge-success',
        cancelled: 'badge-neutral',
    };
    return map[status] || 'badge-neutral';
}

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [gigs, setGigs] = useState([]);
    const [orders, setOrders] = useState([]);
    const [allGigs, setAllGigs] = useState([]);
    const [messages, setMessages] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, router]);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const gigsRes = await fetch('/api/gigs');
                const gigsData = await gigsRes.json();
                setAllGigs(Array.isArray(gigsData) ? gigsData : []);

                if (user.role === 'freelancer') {
                    const myGigs = (Array.isArray(gigsData) ? gigsData : []).filter((g) => g.sellerId === user.id);
                    setGigs(myGigs);
                    const ordersRes = await fetch(`/api/orders?sellerId=${user.id}`);
                    const ordersData = await ordersRes.json();
                    setOrders(Array.isArray(ordersData) ? ordersData : []);

                    // Fetch messages for freelancer
                    const orderIds = (Array.isArray(ordersData) ? ordersData : []).map(o => o.id);
                    if (orderIds.length > 0) {
                        const allMessages = await Promise.all(
                            orderIds.map(id => fetch(`/api/messages?orderId=${id}`).then(r => r.json()).catch(() => []))
                        );
                        const flatMessages = allMessages.flat().filter(m => m && m.receiverId === user.id);
                        setMessages(flatMessages);
                    }
                } else {
                    const ordersRes = await fetch(`/api/orders?buyerId=${user.id}`);
                    const ordersData = await ordersRes.json();
                    setOrders(Array.isArray(ordersData) ? ordersData : []);

                    // Fetch reviews left by this client
                    const reviewsRes = await fetch(`/api/reviews?buyerId=${user.id}`);
                    const reviewsData = await reviewsRes.json();
                    setReviews(Array.isArray(reviewsData) ? reviewsData : []);

                    // Fetch messages for client
                    const orderIds = (Array.isArray(ordersData) ? ordersData : []).map(o => o.id);
                    if (orderIds.length > 0) {
                        const allMessages = await Promise.all(
                            orderIds.map(id => fetch(`/api/messages?orderId=${id}`).then(r => r.json()).catch(() => []))
                        );
                        const flatMessages = allMessages.flat().filter(m => m && m.receiverId === user.id);
                        setMessages(flatMessages);
                    }
                }
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setDataLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                const updated = await res.json();
                setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
            }
        } catch (err) {
            console.error('Failed to update order', err);
        }
    };

    if (loading || dataLoading) {
        return (
            <div className="dashboard">
                <div className="container">
                    <div className="skeleton" style={{ height: 36, width: 250, marginBottom: 12 }}></div>
                    <div className="skeleton" style={{ height: 20, width: 350, marginBottom: 40 }}></div>
                    <div className="gig-grid">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card" style={{ padding: 20 }}>
                                <div className="skeleton" style={{ height: 160, marginBottom: 16 }}></div>
                                <div className="skeleton" style={{ height: 20, width: '80%', marginBottom: 8 }}></div>
                                <div className="skeleton" style={{ height: 14, width: '50%' }}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const isFreelancer = user.role === 'freelancer';

    const getGigTitle = (gigId) => {
        const gig = allGigs.find((g) => g.id === gigId);
        return gig?.title || 'Unknown Service';
    };

    const getGigPrice = (gigId) => {
        const gig = allGigs.find((g) => g.id === gigId);
        return gig?.price ?? 0;
    };

    const getOrderPrice = (order) => order.price ?? getGigPrice(order.gigId);

    // Calculate earnings for freelancer
    const earnings = isFreelancer ? orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + getOrderPrice(o), 0) : 0;

    const pendingEarnings = isFreelancer ? orders
        .filter(o => ['pending', 'in_progress', 'delivered'].includes(o.status))
        .reduce((sum, o) => sum + getOrderPrice(o), 0) : 0;

    return (
        <div className="dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <h1>
                        {isFreelancer ? '🎯' : '👋'} {isFreelancer ? 'Freelancer Dashboard' : 'Client Dashboard'}
                    </h1>
                    <p className="welcome-text">
                        Welcome back, <strong>{user.name}</strong>!
                        {isFreelancer
                            ? ' Manage your gigs and track incoming orders.'
                            : ' Browse services and track your orders.'}
                    </p>
                </div>

                {isFreelancer && (
                    <div className="dashboard-section">
                        <h2>Earnings Summary</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                            <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' }}>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Earnings</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700 }}>₹{earnings.toLocaleString()}</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.25rem' }}>From {orders.filter(o => o.status === 'completed').length} completed orders</div>
                            </div>
                            <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #d946ef 0%, #c026d3 100%)', color: 'white' }}>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Pending</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700 }}>₹{pendingEarnings.toLocaleString()}</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.25rem' }}>In progress orders</div>
                            </div>
                            <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Orders</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{orders.length}</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.25rem' }}>All time</div>
                            </div>
                        </div>
                    </div>
                )}

                {isFreelancer && (
                    <div className="dashboard-section">
                        <div className="dashboard-section-header">
                            <h2>My Gigs ({gigs.length})</h2>
                            <Link href="/gigs/create" className="btn btn-primary">
                                + Create New Gig
                            </Link>
                        </div>

                        {gigs.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📦</div>
                                <h3>No gigs yet</h3>
                                <p>Create your first gig to start getting orders from clients.</p>
                                <Link href="/gigs/create" className="btn btn-primary">Create Your First Gig</Link>
                            </div>
                        ) : (
                            <div className="gig-grid">
                                {gigs.map((gig) => (
                                    <div key={gig.id} className="gig-card card" style={{ position: 'relative' }}>
                                        <Link href={`/gigs/${gig.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div className="gig-card-image">
                                                {(gig.images && gig.images[0]) || gig.image ? (
                                                    <img src={gig.images?.[0] || gig.image} alt={gig.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <span className="category-icon">{getCategoryIcon(gig.category)}</span>
                                                )}
                                                <div className="price-tag">₹{getGigPrice(gig.id) || gig.price}</div>
                                            </div>
                                            <div className="gig-card-body">
                                                <div className="gig-card-title">{gig.title}</div>
                                                <div className="gig-card-footer">
                                                    <div className="stars">
                                                        {'★'.repeat(Math.floor(gig.rating || 0))}{'☆'.repeat(5 - Math.floor(gig.rating || 0))}
                                                        <span className="rating-value">{Number(gig.rating || 0).toFixed(1)}</span>
                                                    </div>
                                                    <span className="badge badge-primary">{gig.category}</span>
                                                </div>
                                            </div>
                                        </Link>
                                        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.25rem', zIndex: 10 }}>
                                            <Link href={`/gigs/${gig.id}/edit`} className="btn btn-sm btn-secondary" onClick={(e) => e.stopPropagation()} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                                ✏️
                                            </Link>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (confirm('Are you sure you want to delete this gig?')) {
                                                        try {
                                                            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                                                            const res = await fetch(`/api/gigs/${gig.id}`, {
                                                                method: 'DELETE',
                                                                headers: token ? { Authorization: `Bearer ${token}` } : {},
                                                            });
                                                            if (res.ok) {
                                                                setGigs((prev) => prev.filter((g) => g.id !== gig.id));
                                                            } else {
                                                                const err = await res.json();
                                                                alert(err.error || 'Delete failed');
                                                            }
                                                        } catch (err) {
                                                            console.error('Delete failed', err);
                                                        }
                                                    }
                                                }}
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h2>{isFreelancer ? 'Orders Received' : 'My Orders'} ({orders.length})</h2>
                        {!isFreelancer && (
                            <Link href="/gigs" className="btn btn-secondary">
                                Browse Gigs →
                            </Link>
                        )}
                    </div>

                    {orders.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">{isFreelancer ? '📭' : '🛒'}</div>
                            <h3>No orders yet</h3>
                            <p>
                                {isFreelancer
                                    ? 'When clients order your gigs, they will appear here.'
                                    : 'Browse available gigs and place your first order!'}
                            </p>
                            {!isFreelancer && (
                                <Link href="/gigs" className="btn btn-primary">Browse Gigs</Link>
                            )}
                        </div>
                    ) : (
                        <div className="orders-grid">
                            {orders.map((order) => (
                                <div key={order.id} className="order-card">
                                    <div className="order-info">
                                        <div className="order-title">{getGigTitle(order.gigId)}</div>
                                        <div className="order-date">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                        <div className="order-price">₹{getOrderPrice(order)}</div>
                                        <span className={`badge ${getStatusBadge(order.status)}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                        {isFreelancer && order.status === 'pending' && (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => updateOrderStatus(order.id, 'in_progress')}
                                            >
                                                Start Work
                                            </button>
                                        )}
                                        {isFreelancer && order.status === 'in_progress' && (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                            >
                                                Mark Delivered
                                            </button>
                                        )}
                                        {!isFreelancer && order.status === 'delivered' && (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                            >
                                                Complete
                                            </button>
                                        )}
                                        {['pending', 'in_progress', 'delivered'].includes(order.status) && (
                                            <Link href={`/orders/${order.id}/messages`} className="btn btn-sm btn-secondary">
                                                Message
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {!isFreelancer && (
                    <div className="dashboard-section">
                        <div className="dashboard-section-header">
                            <h2>My Reviews ({reviews.length})</h2>
                        </div>

                        {reviews.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">⭐</div>
                                <h3>No reviews yet</h3>
                                <p>After completing an order, you can leave a review on the gig page.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {reviews.map((rev) => (
                                    <Link
                                        key={rev.id}
                                        href={`/gigs/${rev.gigId}`}
                                        className="card"
                                        style={{ padding: '1rem', textDecoration: 'none', color: 'inherit', display: 'block' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                            <div className="stars">
                                                {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                                                <span className="rating-value">{rev.rating}.0</span>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                            {getGigTitle(rev.gigId)}
                                        </div>
                                        {rev.comment && (
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                {rev.comment}
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h2>Recent Messages ({messages.length})</h2>
                        <Link href="/messages" className="btn btn-secondary">
                            View All →
                        </Link>
                    </div>

                    {messages.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">💬</div>
                            <h3>No messages yet</h3>
                            <p>
                                {isFreelancer
                                    ? 'When clients message you about orders, they will appear here.'
                                    : 'Start a conversation with sellers from your orders.'}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {messages.slice(0, 5).map((msg) => {
                                const order = orders.find(o => o.id === msg.orderId);
                                return (
                                    <Link
                                        key={msg.id}
                                        href={`/orders/${msg.orderId}/messages`}
                                        className="card"
                                        style={{ padding: '1rem', textDecoration: 'none', color: 'inherit', display: 'block' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                                    {getGigTitle(order?.gigId || '')}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                                                    {msg.content.length > 60 ? msg.content.substring(0, 60) + '...' : msg.content}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                    {new Date(msg.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                            {order && (
                                                <span className={`badge ${getStatusBadge(order.status)}`}>
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                            {messages.length > 5 && (
                                <Link href="/messages" className="btn btn-secondary" style={{ alignSelf: 'center', marginTop: '0.5rem' }}>
                                    View All Messages
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
