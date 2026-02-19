import { NextResponse } from 'next/server';
import { getGigById, updateGig, deleteGig } from '@/lib/db';
import { authorizeGigOwner } from '@/lib/middleware';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const gig = await getGigById(id);
    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }
    return NextResponse.json(gig);
  } catch (error) {
    console.error('Error fetching gig:', error);
    return NextResponse.json({ error: 'Failed to fetch gig' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    
    // Authenticate and authorize
    const auth = await authorizeGigOwner(request, id);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const allowed = ['title', 'description', 'price', 'category', 'deliveryTime', 'images', 'image'];
    const updates = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }
    const gig = await updateGig(id, updates);
    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }
    return NextResponse.json(gig);
  } catch (error) {
    console.error('Error updating gig:', error);
    return NextResponse.json({ error: 'Failed to update gig' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Authenticate and authorize
    const auth = await authorizeGigOwner(request, id);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const deleted = await deleteGig(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting gig:', error);
    return NextResponse.json({ error: 'Failed to delete gig' }, { status: 500 });
  }
}
