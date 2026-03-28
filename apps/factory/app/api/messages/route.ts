import { getCustomOrderMessages, publishUserEventExternal, sql } from "@luminbridge/db";
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customOrderId = searchParams.get('custom_order_id');

  if (!customOrderId) {
    return NextResponse.json({ error: 'Missing custom_order_id' }, { status: 400 });
  }

  try {
    const messages = await getCustomOrderMessages(parseInt(customOrderId));
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { custom_order_id, sender_id, receiver_id, content } = body;

    const [newMessage] = await sql`
      INSERT INTO messages (custom_order_id, sender_id, receiver_id, content)
      VALUES (${custom_order_id}, ${sender_id}, ${receiver_id}, ${content})
      RETURNING *
    `;

    // Trigger notification
    await sql`
      INSERT INTO notifications (user_id, message, type, related_id)
      VALUES (${receiver_id}, ${'New message for custom order #' + custom_order_id}, 'message', ${custom_order_id})
    `;

    // Publish real-time event
    await publishUserEventExternal(receiver_id, 'new_message', newMessage);
    await publishUserEventExternal(receiver_id, 'refresh', { type: 'message', id: custom_order_id });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
