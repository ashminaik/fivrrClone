import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getReviewsByGig, getReviewByOrder, getReviewsByBuyer, createReview } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gigId = searchParams.get('gigId');
    const orderId = searchParams.get('orderId');
    const buyerId = searchParams.get('buyerId');

    if (orderId) {
      const review = await getReviewByOrder(orderId);
      return NextResponse.json(review || null);
    }
    if (gigId) {
      const reviews = await getReviewsByGig(gigId);
      return NextResponse.json(reviews);
    }
    if (buyerId) {
      const reviews = await getReviewsByBuyer(buyerId);
      return NextResponse.json(reviews);
    }

    return NextResponse.json({ error: 'gigId, orderId, or buyerId required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, gigId, buyerId, sellerId, rating, comment } = body;

    if (!orderId || !gigId || !buyerId || !sellerId || !rating) {
      return NextResponse.json(
        { error: 'orderId, gigId, buyerId, sellerId, and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
    }

    const existing = await getReviewByOrder(orderId);
    if (existing) {
      return NextResponse.json({ error: 'Already reviewed this order' }, { status: 409 });
    }

    const newReview = {
      id: uuidv4(),
      orderId,
      gigId,
      buyerId,
      sellerId,
      rating: Math.round(rating),
      comment: comment || '',
      createdAt: new Date().toISOString(),
    };

    const review = await createReview(newReview);
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
