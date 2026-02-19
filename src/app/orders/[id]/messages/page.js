'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function OrderMessagesRedirect() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;

  useEffect(() => {
    router.replace(`/messages?order=${orderId}`);
  }, [orderId, router]);

  return (
    <div className="section">
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
        Redirecting to messages...
      </div>
    </div>
  );
}
