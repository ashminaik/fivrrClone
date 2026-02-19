'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gigSchema } from '@/lib/schemas';
import ImageUpload from '@/app/components/ImageUpload';

const CATEGORIES = ['Web Development', 'Design', 'Marketing', 'Writing', 'Video', 'Music', 'Programming & Tech', 'Graphics & Design', 'Digital Marketing', 'Writing & Translation', 'Video & Animation', 'Business & Finance', 'Data & Analytics'];

export default function EditGigPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const gigId = params?.id;

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(gigSchema),
        defaultValues: {
            title: '',
            description: '',
            price: '',
            category: '',
            deliveryTime: '5 days',
        },
    });

    const images = watch('images') || [];
    const setImages = (updater) => {
        const current = watch('images') || [];
        const next = typeof updater === 'function' ? updater(current) : updater;
        setValue('images', next);
    };

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [authLoading, user, router]);

    useEffect(() => {
        if (!gigId || !user) return;
        fetch(`/api/gigs/${gigId}`)
            .then((r) => r.json())
            .then((gig) => {
                if (gig.sellerId !== user.id) {
                    router.push('/dashboard');
                    return;
                }
                reset({
                    title: gig.title || '',
                    description: gig.description || '',
                    price: gig.price?.toString() || '',
                    category: gig.category || '',
                    deliveryTime: gig.deliveryTime || '5 days',
                });
                setValue('images', gig.images || (gig.image ? [gig.image] : []));
                setFetchLoading(false);
            })
            .catch(() => {
                router.push('/dashboard');
            });
    }, [gigId, user, router, reset, setValue]);

    if (authLoading || fetchLoading) {
        return (
            <div className="create-gig-page container">
                <div className="skeleton" style={{ height: 32, width: 200, marginBottom: 16 }}></div>
                <div className="skeleton" style={{ height: 200, marginBottom: 16 }}></div>
            </div>
        );
    }

    if (!user || user.role !== 'freelancer') {
        return (
            <div className="create-gig-page container">
                <div className="empty-state">
                    <div className="empty-state-icon">🔒</div>
                    <h3>Access Denied</h3>
                    <p>Only freelancers can edit gigs.</p>
                </div>
            </div>
        );
    }

    const onSubmit = async (data) => {
        setError('');
        setLoading(true);

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const res = await fetch(`/api/gigs/${gigId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    ...data,
                    price: parseFloat(data.price),
                    images,
                }),
            });

            if (res.ok) {
                router.push('/dashboard');
                router.refresh();
            } else {
                const resp = await res.json();
                setError(resp.error || 'Failed to update gig');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-gig-page container">
            <h1>Edit Gig</h1>
            <p className="subtitle">Update your gig details</p>

            {error && <div className="error-message" style={{ marginBottom: '1.5rem' }}>{error}</div>}

            <form className="create-gig-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="input-group">
                    <label htmlFor="title">Gig Title</label>
                    <input
                        id="title"
                        className={`input ${errors.title ? 'error' : ''}`}
                        type="text"
                        placeholder="e.g. I will design a modern website"
                        {...register('title')}
                    />
                    {errors.title && <span className="error-text">{errors.title.message}</span>}
                </div>
                <div className="input-group">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        className={`input ${errors.category ? 'error' : ''}`}
                        {...register('category')}
                    >
                        <option value="">Select a category</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {errors.category && <span className="error-text">{errors.category.message}</span>}
                </div>
                <div className="input-group">
                    <label htmlFor="price">Price (₹)</label>
                    <input
                        id="price"
                        className={`input ${errors.price ? 'error' : ''}`}
                        type="number"
                        min="5"
                        max="100000"
                        placeholder="500"
                        {...register('price')}
                    />
                    {errors.price && <span className="error-text">{errors.price.message}</span>}
                </div>
                <div className="input-group">
                    <label htmlFor="deliveryTime">Delivery Time</label>
                    <select
                        id="deliveryTime"
                        className={`input ${errors.deliveryTime ? 'error' : ''}`}
                        {...register('deliveryTime')}
                    >
                        <option value="1 day">1 day</option>
                        <option value="2 days">2 days</option>
                        <option value="3 days">3 days</option>
                        <option value="5 days">5 days</option>
                        <option value="7 days">7 days</option>
                        <option value="14 days">14 days</option>
                        <option value="30 days">30 days</option>
                    </select>
                    {errors.deliveryTime && <span className="error-text">{errors.deliveryTime.message}</span>}
                </div>
                <div className="input-group">
                    <label htmlFor="images">Gig Images</label>
                    <ImageUpload images={images} setImages={setImages} />
                </div>
                <div className="input-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        className={`input ${errors.description ? 'error' : ''}`}
                        placeholder="Describe what you'll deliver, your process, and what makes your service unique..."
                        rows={6}
                        {...register('description')}
                    />
                    {errors.description && <span className="error-text">{errors.description.message}</span>}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn btn-primary btn-lg"
                        type="submit"
                        disabled={loading}
                        style={{ flex: 1 }}
                    >
                        {loading ? 'Updating...' : 'Update Gig'}
                    </button>
                    <button
                        className="btn btn-secondary btn-lg"
                        type="button"
                        onClick={() => router.back()}
                        style={{ flex: 1 }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
