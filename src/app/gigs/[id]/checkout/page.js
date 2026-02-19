'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import { useRouter, useParams } from 'next/navigation';

export default function CheckoutPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const gigId = params?.id;
    
    const [gig, setGig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (user.role !== 'client') {
            router.push('/dashboard');
            return;
        }
        if (gigId) {
            fetch(`/api/gigs/${gigId}`)
                .then((r) => r.json())
                .then((data) => {
                    setGig(data);
                    setLoading(false);
                })
                .catch(() => {
                    router.push('/gigs');
                });
        }
    }, [gigId, user, router]);

    const handleCheckout = async () => {
        if (!gig || !user) return;
        setProcessing(true);
        setError('');

        try {
            // Mock Stripe checkout - simulate payment processing
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Create order after "payment"
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gigId: gig.id,
                    buyerId: user.id,
                    sellerId: gig.sellerId,
                    price: gig.price,
                }),
            });

            if (res.ok) {
                router.push('/dashboard?order=success');
            } else {
                const data = await res.json();
                setError(data.error || 'Order failed');
            }
        } catch (err) {
            setError('Payment processing failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="section">
                <div className="container" style={{ maxWidth: 600, margin: '0 auto' }}>
                    <div className="skeleton" style={{ height: 200 }}></div>
                </div>
            </div>
        );
    }

    if (!gig) return null;

    return (
        <div className="section">
            <div className="container" style={{ maxWidth: 600, margin: '0 auto' }}>
                <h1 style={{ marginBottom: '2rem' }}>Checkout</h1>

                <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>{gig.title}</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Service Price</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{gig.price}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                        <span style={{ fontWeight: 600 }}>Total</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>₹{gig.price}</span>
                    </div>
                </div>

                <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Payment Method</h3>
                    <div style={{ padding: '1rem', background: 'var(--color-surface-hover)', borderRadius: '8px', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>💳</span>
                            <div>
                                <div style={{ fontWeight: 600 }}>Mock Payment (Stripe)</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    This is a demo checkout. No real payment will be processed.
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        <strong>Note:</strong> In production, this would integrate with Stripe Checkout API for secure payment processing.
                    </div>
                </div>

                {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn btn-secondary btn-lg"
                        onClick={() => router.back()}
                        disabled={processing}
                        style={{ flex: 1 }}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleCheckout}
                        disabled={processing}
                        style={{ flex: 2 }}
                    >
                        {processing ? 'Processing Payment...' : `Pay ₹${gig.price}`}
                    </button>
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
                    🔒 Secure checkout • Money-back guarantee
                </p>
            </div>
        </div>
    );
}
