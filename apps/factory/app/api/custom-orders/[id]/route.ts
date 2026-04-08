import { badRequest, createNotification, jsonNoStore, refreshAdmins, refreshFactories, refreshUsers, sql } from "@luminbridge/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const orderId = Number.parseInt(id, 10);
  if (!Number.isFinite(orderId)) return badRequest("Invalid custom order ID");

  const body = await req.json().catch(() => null);
  const status = body?.status as string | undefined;
  if (!status) return badRequest("status required");

  await sql`UPDATE custom_orders SET status = ${status} WHERE id = ${orderId}`;

  try {
    const rows = await sql<{ buyer_id: number; buyer_company: string | null }[]>`
      SELECT
        co.buyer_id::int as buyer_id,
        u.company_name as buyer_company
      FROM custom_orders co
      JOIN users u ON co.buyer_id = u.id
      WHERE co.id = ${orderId}
      LIMIT 1
    `;
    const buyerId = rows[0]?.buyer_id;
    const buyerCompany = rows[0]?.buyer_company ?? "(unknown buyer)";

    const admins = await sql<{ id: number }[]>`
      SELECT id::int as id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1
    `;

    await Promise.all([
      refreshAdmins({ resource: "custom-orders", action: "updated", id: orderId }),
      refreshFactories({ resource: "custom-orders", action: "updated", id: orderId }),
      ...(buyerId
        ? [
            refreshUsers([buyerId], {
              resource: "custom-orders",
              action: "updated",
              id: orderId,
            }),
          ]
        : []),
    ]);

    // Notify buyer about status change
    if (buyerId) {
      await createNotification(
        buyerId,
        `Your custom order #${orderId} status has been updated to: ${status}.`,
        "custom-order",
        orderId,
      );
    }

    // Notify admin
    if (admins[0]?.id) {
      await createNotification(
        admins[0].id,
        `Custom order #${orderId} status changed to ${status} by ${buyerCompany}.`,
        "custom-order",
        orderId,
      );
    }
  } catch (e) {
    console.error("Failed to publish custom order refresh", e);
  }

  return jsonNoStore({ success: true });
}
