'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';

function getAvatarColor(name) {
    const colors = ['#3b82f6', '#d946ef', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <header className="navbar">
            <div className="container navbar-inner">
                <Link href="/" className="logo">
                    fivrrClone
                </Link>

                <nav className="nav-links">
                    <Link href="/gigs">Browse Gigs</Link>
                    {user?.role === 'freelancer' && (
                        <Link href="/gigs/create">Create Gig</Link>
                    )}
                    {user && (
                        <Link href="/dashboard">Dashboard</Link>
                    )}
                    {user && (
                        <Link href="/messages">Messages</Link>
                    )}
                </nav>

                <div className="navbar-actions">
                    {user ? (
                        <div className="user-menu">
                            <div className="user-info">
                                <div
                                    className="avatar avatar-sm"
                                    style={{ background: getAvatarColor(user.name) }}
                                >
                                    {user.name[0]}
                                </div>
                                <span>{user.name}</span>
                            </div>
                            <button onClick={logout} className="btn btn-secondary btn-sm">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="auth-links">
                            <Link href="/login" className="btn btn-secondary">
                                Log In
                            </Link>
                            <Link href="/signup" className="btn btn-primary">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
