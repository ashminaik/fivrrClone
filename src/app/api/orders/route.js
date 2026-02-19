import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getOrders, createOrder, getOrdersByBuyer, getOrdersBySeller } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const buyerId = searchParams.get('buyerId');
        const sellerId = searchParams.get('sellerId');

        let orders;
        if (buyerId) {
            orders = await getOrdersByBuyer(buyerId);
        } else if (sellerId) {
            orders = await getOrdersBySeller(sellerId);
        } else {
            orders = await getOrders();
        }

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { gigId, buyerId, sellerId, price } = body;

        if (!gigId || !buyerId || !sellerId || price == null) {
            return NextResponse.json(
                { error: 'gigId, buyerId, sellerId, and price are required' },
                { status: 400 }
            );
        }

        const newOrder = {
            id: uuidv4(),
            gigId,
            buyerId,
            sellerId,
            price: parseFloat(price),
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        await createOrder(newOrder);

        return NextResponse.json(newOrder, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
