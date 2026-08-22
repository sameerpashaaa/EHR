import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { UserRole } from "@/types";

// Define route permissions
const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  "/admin": ["ADMIN"],
  "/admin/users": ["ADMIN"],
  "/admin/practitioners": ["ADMIN"],
  "/admin/settings": ["ADMIN"],
  "/admin/audit": ["ADMIN"],
  "/clinical": ["PHYSICIAN", "NURSE", "MEDICAL_ASSISTANT"],
  "/clinical/vitals": ["PHYSICIAN", "NURSE", "MEDICAL_ASSISTANT"],
  "/clinical/medications": ["PHYSICIAN", "NURSE"],
  "/clinical/allergies": ["PHYSICIAN", "NURSE", "MEDICAL_ASSISTANT"],
  "/reports": ["ADMIN", "PHYSICIAN"],
  "/patients/new": ["ADMIN", "PHYSICIAN", "FRONT_DESK"],
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/signup",
  "/plans",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/public",
];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Allow public routes
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Check if user is authenticated
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role as UserRole;
    const portal = (token as any).portal as string;

    // Check API route permissions first
    if (pathname.startsWith("/api/") && !PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
      if (pathname.startsWith("/api/admin") && userRole !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (pathname.startsWith("/api/clinical") && !["PHYSICIAN", "NURSE", "MEDICAL_ASSISTANT"].includes(userRole)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (pathname.startsWith("/api/patient") && userRole !== "PATIENT") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else {
      // Check UI route-specific permissions
      for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
        if (pathname.startsWith(route)) {
          if (!allowedRoles.includes(userRole)) {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
          }
        }
      }

      // Check portal-specific boundaries
      if (pathname.startsWith("/admin") && portal !== "ADMIN_PORTAL") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      if (pathname.startsWith("/clinical") && portal !== "CLINICAL_PORTAL" && portal !== "PHYSICIAN_PORTAL") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      if (pathname.startsWith("/reception") && portal !== "RECEPTION_PORTAL") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      if (pathname.startsWith("/patient-portal") && portal !== "PATIENT_PORTAL") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Add security headers
    const response = NextResponse.next();
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    // NOTE: 'unsafe-eval' and 'unsafe-inline' are required for Next.js dev mode.
    // In production you can harden this further.
    const isDev = process.env.NODE_ENV === "development";
    response.headers.set(
      "Content-Security-Policy",
      isDev
        ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' ws: wss:;"
        : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data:; font-src 'self' data: https://fonts.gstatic.com;"
    );

    return response;
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized({ req, token }) {
        // Allow public routes without token
        const { pathname } = req.nextUrl;
        if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
          return true;
        }
        // Validate token exists AND has not expired
        if (!token) return false;
        const now = Math.floor(Date.now() / 1000);
        if (token.exp && (token.exp as number) < now) return false;
        // Must have a user id to be a real authenticated session
        return !!(token.sub || (token as any).id);
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
