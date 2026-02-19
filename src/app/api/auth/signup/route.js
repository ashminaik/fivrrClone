import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getUserByEmail, createUser } from '@/lib/db';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (!['client', 'freelancer'].includes(role)) {
            return NextResponse.json(
                { error: 'Role must be client or freelancer' },
                { status: 400 }
            );
        }

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: uuidv4(),
            name,
            email,
            password: hashedPassword,
            role,
            avatar: null,
            bio: '',
            createdAt: new Date().toISOString(),
        };

        await createUser(newUser);

        return NextResponse.json(
            { message: 'Account created successfully', userId: newUser.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
