import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getMessagesByOrder, createMessage } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });
    }

    const messages = await getMessagesByOrder(orderId);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, senderId, receiverId, content } = body;

    if (!orderId || !senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'orderId, senderId, receiverId, and content are required' },
        { status: 400 }
      );
    }

    const newMessage = {
      id: uuidv4(),
      orderId,
      senderId,
      receiverId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    const message = await createMessage(newMessage);
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
