import { badRequest, getPusherServer, unauthorized, userChannelName } from "@luminbridge/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Pusher private channel auth.
 * Client sends { socket_id, channel_name }.
 */
export async function POST(req: Request) {
  let socketId: string | undefined;
  let channelName: string | undefined;

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => null);
    socketId = body?.socket_id;
    channelName = body?.channel_name;
  } else {
    const text = await req.text().catch(() => "");
    const params = new URLSearchParams(text);
    socketId = params.get("socket_id") || undefined;
    channelName = params.get("channel_name") || undefined;
  }

  if (!socketId || !channelName) return badRequest("socket_id and channel_name required");

  const cookieStore = await cookies();
  const session = cookieStore.get("lumina_session");
  if (!session?.value) return unauthorized("No session");

  let userId: number | null = null;
  try {
    const user = JSON.parse(session.value) as { id?: number };
    userId = typeof user.id === "number" ? user.id : null;
  } catch {
    return unauthorized("Invalid session");
  }

  if (!userId) return unauthorized("Invalid session");

  // Only allow subscribing to the caller's own private channel.
  if (channelName !== userChannelName(userId)) {
    return unauthorized("Not allowed");
  }

  const pusher = getPusherServer();
  if (!pusher) {
    return NextResponse.json(
      { error: "Realtime not configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  // Pusher server SDK returns { auth: '...' } (and possibly channel_data for presence)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p: any = pusher as any;
  const auth =
    (typeof p.authorizeChannel === "function" &&
      p.authorizeChannel(socketId, channelName)) ||
    (typeof p.authenticate === "function" && p.authenticate(socketId, channelName));

  if (!auth) {
    return NextResponse.json(
      { error: "Realtime auth failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(auth, { headers: { "Cache-Control": "no-store" } });
}
