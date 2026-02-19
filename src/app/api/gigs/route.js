import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getGigs, createGig } from '@/lib/db';
import { authenticateRequest } from '@/lib/middleware';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    let gigs = await getGigs();

    if (q) {
      const lowerQ = q.toLowerCase();
      gigs = gigs.filter(
        (g) =>
          g.title?.toLowerCase().includes(lowerQ) ||
          g.description?.toLowerCase().includes(lowerQ) ||
          g.category?.toLowerCase().includes(lowerQ)
      );
    }
    if (category) {
      gigs = gigs.filter((g) => g.category === category);
    }
    if (minPrice != null && minPrice !== '') {
      const min = parseFloat(minPrice);
      gigs = gigs.filter((g) => g.price >= min);
    }
    if (maxPrice != null && maxPrice !== '') {
      const max = parseFloat(maxPrice);
      gigs = gigs.filter((g) => g.price <= max);
    }

    return NextResponse.json(gigs);
  } catch (error) {
    console.error('Error fetching gigs:', error);
    return NextResponse.json({ error: 'Failed to fetch gigs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    if (auth.user.role !== 'freelancer') {
      return NextResponse.json({ error: 'Only freelancers can create gigs' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, price, category, sellerId, deliveryTime, images } = body;

    if (!title || !description || !price || !category || !sellerId) {
      return NextResponse.json(
        { error: 'title, description, price, category, and sellerId are required' },
        { status: 400 }
      );
    }
    if (sellerId !== auth.user.id) {
      return NextResponse.json({ error: 'You can only create gigs for yourself' }, { status: 403 });
    }

    const newGig = {
      id: uuidv4(),
      sellerId,
      title,
      description,
      price: parseFloat(price),
      category,
      image: images?.[0] || null,
      images: images || [],
      deliveryTime: deliveryTime || '5 days',
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };

    const gig = await createGig(newGig);
    return NextResponse.json(gig, { status: 201 });
  } catch (error) {
    console.error('Error creating gig:', error);
    return NextResponse.json({ error: 'Failed to create gig' }, { status: 500 });
  }
}
