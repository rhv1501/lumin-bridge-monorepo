import { badRequest, jsonNoStore, sql } from "@luminbridge/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const role = url.searchParams.get("role");

  if (!role) return badRequest("role required");

  const users = await sql<{ id: number; email: string; company_name: string | null }[]>`
    SELECT id::int as id, email, company_name
    FROM users
    WHERE role = ${role}
    ORDER BY id
  `;

  return jsonNoStore(users);
}
