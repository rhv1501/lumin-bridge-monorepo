import { proxy } from "../../proxy";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  return proxy(req);
}

// config must be declared inline — Next.js statically parses this at build time
export const config = {
  matcher: ["/((?!api|_next/static|_next/image).*)" ],
};
