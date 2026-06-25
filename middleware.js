// middleware.js — Place this in your project ROOT (same level as package.json)
// Vercel Edge Middleware: runs on every request BEFORE it reaches your pages.
//
// HOW IT WORKS:
//   1. Check the MAINTENANCE_MODE environment variable (set in Vercel Dashboard).
//   2. If "true", redirect all non-maintenance, non-static, non-API paths → /maintenance
//   3. If "false" (or unset), requests pass through normally.
//
// TOGGLE WITHOUT CODE CHANGES:
//   Vercel Dashboard → Project → Settings → Environment Variables
//   Set:  MAINTENANCE_MODE = true   (turns ON)
//   Set:  MAINTENANCE_MODE = false  (turns OFF)
//   Then: Vercel Dashboard → Deployments → Redeploy (instant, ~10s)
//
//   OR use Vercel CLI:
//     vercel env add MAINTENANCE_MODE   → type "true"
//     vercel --prod                     → redeploys with new env

import { NextResponse } from 'next/server';

// ── Paths that are ALWAYS accessible during maintenance ──────────────────────
const BYPASS_PATHS = [
  '/maintenance',      // the maintenance page itself
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

const BYPASS_PREFIXES = [
  '/_next/',           // Next.js internals
  '/api/health',       // health-check endpoint
  '/static/',
  '/images/',
  '/fonts/',
];

// ── Optional: IP-based bypass for admins ─────────────────────────────────────
// Add your IP(s) to ADMIN_IPS in Vercel env vars (comma-separated)
// e.g.  ADMIN_IPS = "203.0.113.5,198.51.100.10"
function isAdminIP(request) {
  const adminIPs = (process.env.ADMIN_IPS || '').split(',').map(ip => ip.trim()).filter(Boolean);
  if (adminIPs.length === 0) return false;

  const clientIP =
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '';

  return adminIPs.includes(clientIP);
}

// ── Optional: Secret bypass via query param ───────────────────────────────────
// Visit  https://yoursite.com/?preview=YOUR_SECRET  to bypass maintenance
function hasPreviewSecret(request) {
  const secret = process.env.MAINTENANCE_BYPASS_SECRET;
  if (!secret) return false;
  const url = new URL(request.url);
  return url.searchParams.get('preview') === secret;
}

// ─────────────────────────────────────────────────────────────────────────────
export function middleware(request) {
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  // Maintenance is OFF — let everything through
  if (!maintenanceMode) {
    return NextResponse.next();
  }

  const { pathname } = new URL(request.url);

  // Always allow the maintenance page itself
  if (BYPASS_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Always allow static asset prefixes
  if (BYPASS_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Admin IP bypass
  if (isAdminIP(request)) {
    return NextResponse.next();
  }

  // Preview secret bypass — set a cookie so they stay bypassed for the session
  if (hasPreviewSecret(request)) {
    const response = NextResponse.next();
    response.cookies.set('maintenance_bypass', process.env.MAINTENANCE_BYPASS_SECRET, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
    return response;
  }

  // Check for bypass cookie (persists the preview-secret bypass)
  const bypassCookie = request.cookies.get('maintenance_bypass');
  if (bypassCookie?.value === process.env.MAINTENANCE_BYPASS_SECRET) {
    return NextResponse.next();
  }

  // ── All other requests → redirect to /maintenance ──────────────────────────
  const url = request.nextUrl.clone();
  url.pathname = '/maintenance';
  return NextResponse.redirect(url, { status: 307 });
}

// ── Route matcher: run on ALL routes ─────────────────────────────────────────
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static (static files)
     *  - _next/image  (image optimization)
     *  - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
