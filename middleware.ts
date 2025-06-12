import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./src/lib/auth-utils"

// List of paths that require authentication
const protectedPaths = ["/profile", "/educate", "/guide", "/camp", "/interview", "/attribute"]

// List of paths that are accessible only for non-authenticated users
const authPaths = ["/login", "/signup"]

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  const isAuthenticated = token && verifyToken(token)
  const path = request.nextUrl.pathname

  // If the path requires authentication and the user is not authenticated
  if (protectedPaths.some((p) => path.startsWith(p)) && !isAuthenticated) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(url)
  }

  // If the path is for non-authenticated users and the user is authenticated
  if (authPaths.some((p) => path.startsWith(p)) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

