import { NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/db';

const VALID_STATUSES = ['pending', 'in_progress', 'delivered', 'completed', 'cancelled'];
const STATUS_FLOW = { pending: ['in_progress', 'cancelled'], in_progress: ['delivered'], delivered: ['completed'], completed: [], cancelled: [] };

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Valid status required' }, { status: 400 });
    }

    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const allowed = STATUS_FLOW[order.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${order.status} to ${status}` },
        { status: 400 }
      );
    }

    const updated = await updateOrder(id, { status });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
