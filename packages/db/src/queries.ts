/**
 * lib/queries.ts
 * Server-only DB query helpers — used by server components (page.tsx)
 * and API route handlers to avoid duplicating SQL.
 */
import { isTransientDbError, sql, withDbRetry } from "./db";
import type {
  Product,
  Order,
  CustomOrder,
  CustomOrderProposal,
  Settings,
  Review,
  Message,
} from "@luminbridge/types";

async function runQuery<T>(task: () => Promise<T>, fallback: T) {
  try {
    return await withDbRetry(task, {
      attempts: 4,
      retryDelayMs: 1500,
    });
  } catch (error) {
    if (isTransientDbError(error)) {
      console.error("Query fallback after DB timeout:", error);
      return fallback;
    }

    throw error;
  }
}

// ─── Products ───────────────────────────────────────────────────────────────

export async function getFactoryProducts(userId: number): Promise<Product[]> {
  return runQuery(
    () =>
      sql`
        SELECT
          id::int as id,
          name, description, specifications, photo,
          factory_price_cny, buyer_price_inr,
          status, factory_id::int as factory_id,
          category, created_at::text as created_at
        FROM products
        WHERE factory_id = ${userId}
        ORDER BY created_at DESC
      ` as unknown as Promise<Product[]>,
    [],
  );
}

export async function getAdminProducts(): Promise<Product[]> {
  return runQuery(
    () =>
      sql`
        SELECT
          p.id::int as id,
          p.name, p.description, p.specifications, p.photo,
          p.factory_price_cny, p.buyer_price_inr,
          p.status, p.factory_id::int as factory_id,
          p.category, p.created_at::text as created_at,
          u.company_name as factory_company,
          u.email as factory_email,
          u.wechat_id as factory_wechat,
          u.mobile_number as factory_mobile
        FROM products p
        JOIN users u ON p.factory_id = u.id
        ORDER BY p.created_at DESC
      ` as unknown as Promise<Product[]>,
    [],
  );
}

export async function getBuyerProducts(): Promise<Product[]> {
  return runQuery(
    () =>
      sql`
        SELECT
          id::int as id,
          name, description, specifications, photo,
          factory_price_cny, buyer_price_inr,
          status, factory_id::int as factory_id,
          category, created_at::text as created_at
        FROM products
        WHERE status = 'published'
        ORDER BY created_at DESC
      ` as unknown as Promise<Product[]>,
    [],
  );
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export async function getFactoryOrders(userId: number): Promise<Order[]> {
  return runQuery(
    () =>
      sql`
        SELECT
          o.id::int as id,
          o.product_id::int as product_id,
          o.buyer_id::int as buyer_id,
          p.factory_id::int as factory_id,
          o.quantity, o.status, o.rejection_reason,
          COALESCE((o.quantity * p.buyer_price_inr), 0)::double precision as total_price,
          o.created_at::text as created_at,
          p.name as product_name,
          p.photo as product_photo
        FROM orders o
        JOIN products p ON o.product_id = p.id
        WHERE p.factory_id = ${userId}
        ORDER BY o.created_at DESC
      ` as unknown as Promise<Order[]>,
    [],
  );
}

export async function getAdminOrders(): Promise<Order[]> {
  return runQuery(
    () =>
      sql`
        SELECT
          o.id::int as id,
          o.product_id::int as product_id,
          o.buyer_id::int as buyer_id,
          p.factory_id::int as factory_id,
          o.quantity, o.status, o.rejection_reason,
          COALESCE((o.quantity * p.buyer_price_inr), 0)::double precision as total_price,
          o.created_at::text as created_at,
          p.name as product_name,
          p.photo as product_photo,
          u.email as buyer_email,
          u.company_name as buyer_company,
          u.whatsapp_number as buyer_whatsapp
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users u ON o.buyer_id = u.id
        ORDER BY o.created_at DESC
      ` as unknown as Promise<Order[]>,
    [],
  );
}

export async function getBuyerOrders(userId: number): Promise<Order[]> {
  return runQuery(
    () =>
      sql`
        SELECT
          o.id::int as id,
          o.product_id::int as product_id,
          o.buyer_id::int as buyer_id,
          p.factory_id::int as factory_id,
          o.quantity, o.status, o.rejection_reason,
          COALESCE((o.quantity * p.buyer_price_inr), 0)::double precision as total_price,
          o.created_at::text as created_at,
          p.name as product_name,
          p.photo as product_photo
        FROM orders o
        JOIN products p ON o.product_id = p.id
        WHERE o.buyer_id = ${userId}
        ORDER BY o.created_at DESC
      ` as unknown as Promise<Order[]>,
    [],
  );
}

// ─── Custom Orders ──────────────────────────────────────────────────────────

export async function getAdminCustomOrders(): Promise<CustomOrder[]> {
  return runQuery(
    () =>
      sql`
        SELECT
          co.id::int as id,
          co.buyer_id::int as buyer_id,
          co.photo, co.requirements, co.status,
          co.created_at::text as created_at,
          u.company_name as buyer_company,
          u.email as buyer_email
        FROM custom_orders co
        JOIN users u ON co.buyer_id = u.id
        ORDER BY co.created_at DESC
      ` as unknown as Promise<CustomOrder[]>,
    [],
  );
}

export async function getFactoryCustomOrders(): Promise<CustomOrder[]> {
  return getAdminCustomOrders(); // same query
}

export async function getBuyerCustomOrders(
  userId: number,
): Promise<CustomOrder[]> {
  return runQuery(
    () =>
      sql`
        SELECT
          co.id::int as id,
          co.buyer_id::int as buyer_id,
          co.photo, co.requirements, co.status,
          co.created_at::text as created_at,
          u.company_name as buyer_company,
          u.email as buyer_email
        FROM custom_orders co
        JOIN users u ON co.buyer_id = u.id
        WHERE co.buyer_id = ${userId}
        ORDER BY co.created_at DESC
      ` as unknown as Promise<CustomOrder[]>,
    [],
  );
}

// ─── Proposals ──────────────────────────────────────────────────────────────

export async function getBuyerProposals(
  userId: number,
): Promise<CustomOrderProposal[]> {
  return runQuery(
    () =>
      sql`
        SELECT
          cop.id::int as id,
          cop.custom_order_id::int as custom_order_id,
          cop.factory_id::int as factory_id,
          cop.photo, cop.description,
          cop.price_cny, cop.price_inr,
          cop.status, cop.created_at::text as created_at,
          u.company_name as factory_company
        FROM custom_order_proposals cop
        JOIN users u ON cop.factory_id = u.id
        JOIN custom_orders co ON cop.custom_order_id = co.id
        WHERE co.buyer_id = ${userId} AND cop.status = 'published'
        ORDER BY cop.created_at DESC
      ` as unknown as Promise<CustomOrderProposal[]>,
    [],
  );
}

// ─── Settings ───────────────────────────────────────────────────────────────

export async function getSettings(): Promise<Settings> {
  const rows = await runQuery(
    () =>
      sql<{ key: string; value: string }[]>`
        SELECT key, value FROM settings
      ` as unknown as Promise<{ key: string; value: string }[]>,
    [],
  );
  const map = rows.reduce<Record<string, string>>((acc, r) => {
    acc[r.key] = r.value;
    return acc;
  }, {});
  return {
    exchange_rate: map.exchange_rate ?? "12.0",
    admin_markup: map.admin_markup ?? "1.2",
  };
}

// ─── Analytics ─────────────────────────────────────────────────────────────

export async function getFactoryAnalytics(factoryId: number) {
  return runQuery(async () => {
    // Total Sales
    const [salesRow] = await sql`
      SELECT SUM(p.factory_price_cny * o.quantity)::float as total
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE p.factory_id = ${factoryId} AND o.status != 'rejected'
    `;
    const totalSales = Number(salesRow?.total || 0);

    // Conversion Rate
    const [proposalRow] = await sql`
      SELECT 
        COUNT(*)::int as total,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END)::int as accepted
      FROM custom_order_proposals
      WHERE factory_id = ${factoryId}
    `;
    const totalProposals = Number(proposalRow?.total || 0);
    const acceptedProposals = Number(proposalRow?.accepted || 0);
    const conversionRate = totalProposals > 0 ? (acceptedProposals / totalProposals) * 100 : 0;

    // Profile Views
    const [userRow] = await sql`
      SELECT profile_views::int as views
      FROM users
      WHERE id = ${factoryId}
    `;
    const profileViews = Number(userRow?.views || 0);

    // Monthly Sales
    const monthlySales = await sql`
      SELECT to_char(o.created_at, 'YYYY-MM') as month, SUM(p.factory_price_cny * o.quantity)::float as sales
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE p.factory_id = ${factoryId} AND o.status != 'rejected'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `;

    return {
      totalSales,
      conversionRate,
      profileViews,
      monthlySales: monthlySales.map(r => ({
        month: r.month,
        sales: Number(r.sales || 0)
      })).reverse()
    };
  }, { totalSales: 0, conversionRate: 0, profileViews: 0, monthlySales: [] });
}

export async function getAdminAnalytics() {
  return runQuery(async () => {
    // Total Volume (INR)
    const [volumeRow] = await sql`
      SELECT SUM(p.buyer_price_inr * o.quantity)::float as total
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.status != 'rejected'
    `;
    const totalVolume = Number(volumeRow?.total || 0);

    // Factory Cost (CNY)
    const [costRow] = await sql`
      SELECT SUM(p.factory_price_cny * o.quantity)::float as total
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.status != 'rejected'
    `;
    const factoryCost = Number(costRow?.total || 0);

    // Get exchange rate from settings
    const [rateRow] = await sql`SELECT value FROM settings WHERE key = 'exchange_rate'`;
    const exchangeRate = parseFloat(rateRow?.value || "12.0");
    const revenue = totalVolume - (factoryCost * exchangeRate);

    // Active Users (non-admin)
    const [usersRow] = await sql`
      SELECT COUNT(*)::int as count
      FROM users
      WHERE role != 'admin'
    `;
    const activeUsers = Number(usersRow?.count || 0);

    // Monthly Sales (INR)
    const monthlySales = await sql`
      SELECT to_char(o.created_at, 'YYYY-MM') as month, SUM(p.buyer_price_inr * o.quantity)::float as sales
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.status != 'rejected'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `;

    return {
      totalVolume,
      revenue,
      activeUsers,
      monthlySales: monthlySales.map(r => ({
        month: r.month,
        sales: Number(r.sales || 0)
      })).reverse()
    };
  }, { totalVolume: 0, revenue: 0, activeUsers: 0, monthlySales: [] });
}

// ─── Reviews ───────────────────────────────────────────────────────────────

export async function getReviews(filter: { factory_id?: number; product_id?: number }): Promise<Review[]> {
  const where = filter.factory_id 
    ? sql`WHERE factory_id = ${filter.factory_id}`
    : filter.product_id 
      ? sql`WHERE product_id = ${filter.product_id}`
      : sql``;

  return runQuery(
    () => sql`
      SELECT 
        r.id::int, r.order_id::int, r.product_id::int, r.factory_id::int, r.buyer_id::int,
        r.rating, r.comment, r.created_at::text,
        p.name as product_name,
        u.company_name as buyer_company
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON r.buyer_id = u.id
      ${where}
      ORDER BY r.created_at DESC
    ` as unknown as Promise<Review[]>,
    []
  );
}

// ─── Messages ──────────────────────────────────────────────────────────────

export async function getCustomOrderMessages(customOrderId: number): Promise<Message[]> {
  return runQuery(
    () => sql`
      SELECT 
        m.id::int, m.custom_order_id::int, m.sender_id::int, m.receiver_id::int,
        m.content, m.created_at::text,
        u.company_name as sender_name,
        u.role as sender_role
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE custom_order_id = ${customOrderId}
      ORDER BY m.created_at ASC
    ` as unknown as Promise<Message[]>,
    []
  );
}
