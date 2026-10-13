import { NextResponse, type NextRequest } from "next/server";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (request.method !== "GET" && request.method !== "HEAD") {
    return privateResponse(NextResponse.next());
  }
  const session = await readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/") {
    if (session) return privateResponse(NextResponse.redirect(new URL("/visao-geral", request.url)));
    return privateResponse(NextResponse.next());
  }

  if (!session) return privateResponse(NextResponse.redirect(new URL("/", request.url)));
  return privateResponse(NextResponse.next());
}

function privateResponse(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
