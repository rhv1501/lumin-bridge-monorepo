import { createNotification, getCustomOrderMessages, publishUserEventExternal, sql } from "@luminbridge/db";
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

    let resolvedReceiverId =
      typeof receiver_id === "number" && receiver_id > 0 ? receiver_id : 0;

    if (!resolvedReceiverId) {
      const [fallbackAdmin] = await sql<{ id: number }[]>`
        SELECT id::int as id
        FROM users
        WHERE role = 'admin'
        ORDER BY id
        LIMIT 1
      `;
      resolvedReceiverId = fallbackAdmin?.id ?? 0;
    }

    const [newMessage] = await sql`
      INSERT INTO messages (custom_order_id, sender_id, receiver_id, content)
      VALUES (${custom_order_id}, ${sender_id}, ${resolvedReceiverId}, ${content})
      RETURNING *
    `;

    if (resolvedReceiverId) {
      await createNotification(
        resolvedReceiverId,
        `New message for custom order #${custom_order_id}`,
        "message",
        custom_order_id,
      );
    }

    const admins = await sql<{ id: number }[]>`
      SELECT id::int as id
      FROM users
      WHERE role = 'admin'
    `;

    const realtimeTargets = new Set<number>([
      ...admins.map((a) => a.id),
      ...(resolvedReceiverId ? [resolvedReceiverId] : []),
    ]);

    // Publish real-time event to all admins so active admin sessions always refresh.
    await Promise.all(
      Array.from(realtimeTargets).map(async (userId) => {
        await publishUserEventExternal(userId, 'new_message', newMessage);
        await publishUserEventExternal(userId, 'refresh', {
          type: 'message',
          id: custom_order_id,
          custom_order_id,
        });
      }),
    );

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
