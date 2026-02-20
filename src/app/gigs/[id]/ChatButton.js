'use client';

import { useState } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function ChatButton({ gigId, sellerId, price }) {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleChat = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (user.id === sellerId) return;

        setLoading(true);
        try {
            // Check if there's already an order for this gig from this user
            const res = await fetch(`/api/orders?buyerId=${user.id}`);
            const orders = await res.json();
            const existing = Array.isArray(orders)
                ? orders.find(o => o.gigId === gigId)
                : null;

            if (existing) {
                window.location.href = `/messages?order=${existing.id}`;
                return;
            }

            // Create a pending order so they can chat
            const orderRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gigId,
                    buyerId: user.id,
                    sellerId,
                    price: price || 0,
                }),
            });

            if (orderRes.ok) {
                const order = await orderRes.json();
                window.location.href = `/messages?order=${order.id}`;
            }
        } catch (err) {
            console.error('Chat init failed', err);
        } finally {
            setLoading(false);
        }
    };

    // Don't show chat button to the seller viewing their own gig
    if (user?.id === sellerId) return null;

    return (
        <button
            className="btn btn-secondary btn-lg"
            onClick={handleChat}
            disabled={loading}
            style={{ width: '100%', marginTop: '0.75rem' }}
        >
            {loading ? 'Opening chat...' : 'Chat with Seller'}
        </button>
    );
}
