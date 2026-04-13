import { badRequest, createNotification, jsonNoStore, refreshAdmins, refreshUsers, sql, toInt } from "@luminbridge/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const customOrderId = Number.parseInt(id, 10);
  if (!Number.isFinite(customOrderId)) return badRequest("Invalid custom order ID");

  const url = new URL(req.url);
  const role = url.searchParams.get("role");
  const userId = toInt(url.searchParams.get("userId"));

  if (role === "buyer") {
    const proposals = await sql`
      SELECT
        cop.id::int as id,
        cop.custom_order_id::int as custom_order_id,
        cop.factory_id::int as factory_id,
        cop.photo,
        cop.description,
        cop.price_cny,
        cop.price_inr,
        cop.status,
        cop.created_at::text as created_at,
        u.company_name as factory_company
      FROM custom_order_proposals cop
      JOIN users u ON cop.factory_id = u.id
      WHERE cop.custom_order_id = ${customOrderId} AND cop.status = 'published'
    `;
    return jsonNoStore(proposals);
  }

  if (role === "factory") {
    const proposals = await sql`
      SELECT
        cop.id::int as id,
        cop.custom_order_id::int as custom_order_id,
        cop.factory_id::int as factory_id,
        cop.photo,
        cop.description,
        cop.price_cny,
        cop.price_inr,
        cop.status,
        cop.created_at::text as created_at,
        u.company_name as factory_company
      FROM custom_order_proposals cop
      JOIN users u ON cop.factory_id = u.id
      WHERE cop.custom_order_id = ${customOrderId} AND cop.factory_id = ${userId ?? -1}
    `;
    return jsonNoStore(proposals);
  }

  // Admins see all proposals + contact info
  const proposals = await sql`
    SELECT
      cop.id::int as id,
      cop.custom_order_id::int as custom_order_id,
      cop.factory_id::int as factory_id,
      cop.photo,
      cop.description,
      cop.price_cny,
      cop.price_inr,
      cop.status,
      cop.created_at::text as created_at,
      u.company_name as factory_company,
      u.email as factory_email,
      u.mobile_number as factory_mobile,
      u.wechat_id as factory_wechat
    FROM custom_order_proposals cop
    JOIN users u ON cop.factory_id = u.id
    WHERE cop.custom_order_id = ${customOrderId}
  `;

  return jsonNoStore(proposals);
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const customOrderId = Number.parseInt(id, 10);
  if (!Number.isFinite(customOrderId)) return badRequest("Invalid custom order ID");

  const body = await req.json().catch(() => null);
  const factory_id = body?.factory_id as number | undefined;
  const photo = (body?.photo as string | undefined) ?? null;
  const description = (body?.description as string | undefined) ?? null;
  const price_cny = body?.price_cny as number | undefined;
  const production_time = body?.production_time as number | undefined;
  const notes = (body?.notes as string | undefined) ?? null;

  if (!factory_id) return badRequest("factory_id required");

  const existing = await sql<{ id: number }[]>`
    SELECT id::int as id
    FROM custom_order_proposals
    WHERE custom_order_id = ${customOrderId} AND factory_id = ${factory_id}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  let proposalId: number;
  let action: "created" | "updated" = "created";

  if (existing[0]?.id) {
    proposalId = existing[0].id;
    action = "updated";

    await sql`
      UPDATE custom_order_proposals
      SET
        photo = ${photo},
        description = ${description},
        price_cny = ${price_cny ?? null},
        production_time = ${production_time ?? null},
        notes = ${notes},
        status = 'pending'
      WHERE id = ${proposalId}
    `;
  } else {
    const rows = await sql<{ id: number }[]>`
      INSERT INTO custom_order_proposals (
        custom_order_id,
        factory_id,
        photo,
        description,
        price_cny,
        production_time,
        notes
      )
      VALUES (
        ${customOrderId},
        ${factory_id},
        ${photo},
        ${description},
        ${price_cny ?? null},
        ${production_time ?? null},
        ${notes}
      )
      RETURNING id::int as id
    `;
    proposalId = rows[0].id;
  }

  // Realtime refresh: admins see proposals list, factory sees its proposal, buyer may see status changes later
  // We'll also refresh the buyer who owns this custom order.
  try {
    const owners = await sql<{ buyer_id: number }[]>`
      SELECT buyer_id::int as buyer_id
      FROM custom_orders
      WHERE id = ${customOrderId}
      LIMIT 1
    `;
    const buyerId = owners[0]?.buyer_id;
    await Promise.all([
      refreshAdmins({
        resource: "custom-order-proposals",
        action,
        id: proposalId,
      }),
      refreshUsers(
        [factory_id, ...(buyerId ? [buyerId] : [])],
        {
          resource: "custom-order-proposals",
          action,
          id: proposalId,
        },
      ),
    ]);
  } catch (e) {
    console.error("Failed to publish proposal refresh", e);
  }

  // If custom order is pending, bump to sourcing
  const current = await sql<{ status: string }[]>`
    SELECT status
    FROM custom_orders
    WHERE id = ${customOrderId}
    LIMIT 1
  `;

  if (current[0]?.status === "pending") {
    await sql`UPDATE custom_orders SET status = 'sourcing' WHERE id = ${customOrderId}`;
  }

  // Notify Admin
  try {
    const admins = await sql<{ id: number }[]>`
      SELECT id::int as id
      FROM users
      WHERE role = 'admin'
      ORDER BY id
      LIMIT 1
    `;

    const factories = await sql<{ company_name: string | null }[]>`
      SELECT company_name
      FROM users
      WHERE id = ${factory_id}
      LIMIT 1
    `;

    const factoryCompany = factories[0]?.company_name ?? "(unknown factory)";

    if (admins[0]?.id) {
      await createNotification(
        admins[0].id,
        `${action === "updated" ? "Updated" : "New"} proposal for Custom Order #${customOrderId} from ${factoryCompany}`,
        "custom-order",
        customOrderId,
      );
    }

    // Notify the buyer who owns this custom order
    const owners = await sql<{ buyer_id: number }[]>`
      SELECT buyer_id::int as buyer_id
      FROM custom_orders
      WHERE id = ${customOrderId}
      LIMIT 1
    `;
    const buyerId = owners[0]?.buyer_id;
    if (buyerId) {
      await createNotification(
        buyerId,
        `A factory has ${action === "updated" ? "updated" : "submitted"} a proposal for your Custom Order #${customOrderId}. Review it now!`,
        "custom-order",
        customOrderId,
      );
    }
  } catch (e) {
    console.error("Failed to create proposal notification", e);
  }

  return jsonNoStore({ id: proposalId });
}
