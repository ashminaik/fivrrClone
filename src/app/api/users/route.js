import { NextResponse } from 'next/server';
import { getUsers, getUserById } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const user = await getUserById(id);
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    }
    const users = await getUsers();
    return NextResponse.json(users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
