'use client';

import { useAuth } from '@/app/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function OrderButton({ gigId, sellerId, price }) {
    const { user } = useAuth();
    const router = useRouter();

    const handleOrder = () => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (user.role !== 'client') {
            return;
        }

        // Redirect to checkout page
        router.push(`/gigs/${gigId}/checkout`);
    };

    if (user?.role === 'freelancer') {
        return (
            <button className="btn btn-secondary btn-lg" disabled style={{ width: '100%', opacity: 0.5 }}>
                Freelancers cannot order
            </button>
        );
    }

    return (
        <button
            className="btn btn-primary btn-lg"
            onClick={handleOrder}
            style={{ width: '100%' }}
        >
            Order Now — ₹{price}
        </button>
    );
}
