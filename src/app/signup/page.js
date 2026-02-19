'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['client', 'freelancer']),
});

export default function SignupPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            role: 'client',
        },
    });

    const role = watch('role');

    const onSubmit = async (data) => {
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                setError(result.error || 'Signup failed');
                setLoading(false);
                return;
            }

            // Auto-login after signup
            const loginResult = await login(data.email, data.password);
            if (loginResult?.success) {
                router.push('/dashboard');
                router.refresh();
            } else {
                setError(loginResult?.error || 'Account created. Please log in manually.');
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
                <h1>Create account</h1>
                <p className="subtitle">Join fivrrClone and start your journey</p>

                {error && <div className="error-message">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="input-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            className={`input ${errors.name ? 'error' : ''}`}
                            type="text"
                            placeholder="John Doe"
                            {...register('name')}
                        />
                        {errors.name && <span className="error-text">{errors.name.message}</span>}
                    </div>
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
                            placeholder="Min 6 characters"
                            {...register('password')}
                        />
                        {errors.password && <span className="error-text">{errors.password.message}</span>}
                    </div>
                    <div className="input-group">
                        <label>I am a</label>
                        <div className="role-toggle">
                            <button
                                type="button"
                                className={role === 'client' ? 'active' : ''}
                                onClick={() => setValue('role', 'client')}
                            >
                                👤 Client
                            </button>
                            <button
                                type="button"
                                className={role === 'freelancer' ? 'active' : ''}
                                onClick={() => setValue('role', 'freelancer')}
                            >
                                💼 Freelancer
                            </button>
                        </div>
                        <input type="hidden" {...register('role')} />
                    </div>
                    <button
                        className="btn btn-primary btn-lg"
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link href="/login">Log in</Link>
                </div>
            </div>
        </div>
    );
}
