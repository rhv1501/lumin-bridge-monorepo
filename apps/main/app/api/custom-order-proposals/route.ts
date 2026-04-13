import { jsonNoStore, sql, toInt, badRequest, refreshAdmins, refreshUsers, createNotification } from "@luminbridge/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
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
        cop.production_time,
        cop.notes,
        cop.price_inr,
        cop.status,
        cop.created_at::text as created_at,
        u.company_name as factory_company
      FROM custom_order_proposals cop
      JOIN users u ON cop.factory_id = u.id
      JOIN custom_orders co ON cop.custom_order_id = co.id
      WHERE co.buyer_id = ${userId ?? -1} AND cop.status = 'published'
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
        cop.production_time,
        cop.notes,
        cop.price_inr,
        cop.status,
        cop.created_at::text as created_at,
        u.company_name as factory_company
      FROM custom_order_proposals cop
      JOIN users u ON cop.factory_id = u.id
      WHERE cop.factory_id = ${userId ?? -1}
    `;
    return jsonNoStore(proposals);
  }

  const proposals = await sql`
    SELECT
      cop.id::int as id,
      cop.custom_order_id::int as custom_order_id,
      cop.factory_id::int as factory_id,
      cop.photo,
      cop.description,
      cop.price_cny,
      cop.production_time,
      cop.notes,
      cop.price_inr,
      cop.status,
      cop.created_at::text as created_at,
      u.company_name as factory_company
    FROM custom_order_proposals cop
    JOIN users u ON cop.factory_id = u.id
  `;

  return jsonNoStore(proposals);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const customOrderId = body?.custom_order_id as number | undefined;
  const factory_id = body?.factory_id as number | undefined;
  const photo = (body?.photo as string | undefined) ?? null;
  const description = (body?.description as string | undefined) ?? null;
  const price_cny = body?.price_cny as number | undefined;

  if (!customOrderId) return badRequest("custom_order_id required");
  if (!factory_id) return badRequest("factory_id required");

  const rows = await sql<{ id: number }[]>`
    INSERT INTO custom_order_proposals (custom_order_id, factory_id, photo, description, price_cny)
    VALUES (${customOrderId}, ${factory_id}, ${photo}, ${description}, ${price_cny ?? null})
    RETURNING id::int as id
  `;

  const proposalId = rows[0].id;

  // Realtime refresh
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
        action: "created",
        id: proposalId,
      }),
      refreshUsers(
        [factory_id, ...(buyerId ? [buyerId] : [])],
        {
          resource: "custom-order-proposals",
          action: "created",
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
        `New proposal for Custom Order #${customOrderId} from ${factoryCompany}`,
        "custom-order",
        customOrderId,
      );
    }
  } catch (e) {
    console.error("Failed to create proposal notification", e);
  }

  return jsonNoStore({ id: proposalId });
}
