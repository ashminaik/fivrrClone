'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema } from '@/lib/schemas';

export default function ReviewsSection({ gigId, sellerId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [orderIdForReview, setOrderIdForReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: '' },
  });

  useEffect(() => {
    if (!gigId) return;
    fetch(`/api/reviews?gigId=${gigId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [gigId]);

  useEffect(() => {
    if (!user || user.role !== 'client' || !gigId) return;
    fetch(`/api/orders?buyerId=${user.id}`)
      .then((r) => r.json())
      .then((orders) => {
        const paid = Array.isArray(orders) ? orders.find((o) => o.gigId === gigId) : null;
        if (paid) {
          setOrderIdForReview(paid.id);
          fetch(`/api/reviews?orderId=${paid.id}`)
            .then((rr) => rr.json())
            .then((existing) => {
              setCanReview(!existing || !existing.id);
            })
            .catch(() => setCanReview(true));
        }
      });
  }, [user, gigId]);

  const onSubmit = async (data) => {
    if (!user || !orderIdForReview || !gigId || !sellerId) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderIdForReview,
          gigId,
          buyerId: user.id,
          sellerId,
          rating: data.rating,
          comment: data.comment?.trim() || '',
        }),
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews((prev) => [...prev, newReview]);
        setSubmitted(true);
        reset();
      }
    } catch (err) {
      console.error('Review submit failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-section">
      <h2 style={{ marginBottom: '1rem' }}>Reviews</h2>
      {canReview && !submitted && (
        <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: '2rem' }}>
          <div className="input-group" style={{ marginBottom: '0.75rem' }}>
            <label>Your Rating</label>
            <select
              className={`input ${errors.rating ? 'error' : ''}`}
              style={{ maxWidth: 120 }}
              {...register('rating')}
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} ★</option>
              ))}
            </select>
            {errors.rating && <span className="error-text">{errors.rating.message}</span>}
          </div>
          <div className="input-group" style={{ marginBottom: '0.75rem' }}>
            <label>Comment (optional)</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Share your experience..."
              {...register('comment')}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No reviews yet. Be the first to review!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map((r) => (
            <div key={r.id} className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              {r.comment && <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
