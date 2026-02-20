'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setError('');
        setLoading(true);

        try {
            const result = await login(data.email, data.password);
            if (result?.success) {
                router.push('/dashboard');
                router.refresh();
            } else {
                setError(result?.error || 'Invalid email or password');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Welcome back</h1>
                <p className="subtitle">Log in to your fivrrClone account</p>

                {error && <div className="error-message">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            className={`input ${errors.email ? 'error' : ''}`}
                            type="email"
                            placeholder="you@example.com"
                            {...register('email')}
                        />
                        {errors.email && <span className="error-text">{errors.email.message}</span>}
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            className={`input ${errors.password ? 'error' : ''}`}
                            type="password"
                            placeholder="••••••••"
                            {...register('password')}
                        />
                        {errors.password && <span className="error-text">{errors.password.message}</span>}
                    </div>
                    <button
                        className="btn btn-primary btn-lg"
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div className="auth-footer">
                    {"Don't have an account? "}<Link href="/signup">Sign up</Link>
                </div>

                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0fdf4', borderRadius: '10px', fontSize: '0.8rem', color: '#065f46' }}>
                    <strong>Demo Credentials:</strong><br />
                    Freelancer: rajesh.kumar@email.com / password123<br />
                    Client: anjali.nair@email.com / password123
                </div>
            </div>
        </div>
    );
}