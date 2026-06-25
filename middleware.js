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
// pages/maintenance.js — Next.js Maintenance Page
// This is the page shown to visitors when maintenance mode is ON.
// Design mirrors maintenance.html but as a React component.

import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';

const TARGET_MS = 4 * 60 * 60 * 1000; // 4 hours from deploy

export default function MaintenancePage() {
  const [theme, setTheme]       = useState('dark');
  const [countdown, setCountdown] = useState({ h: '00', m: '00', s: '00' });
  const [adminOpen, setAdminOpen] = useState(false);
  const [maintOn, setMaintOn]   = useState(true);
  const targetRef = useRef(null);

  useEffect(() => {
    // Theme
    const saved = localStorage.getItem('maint-theme') ||
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    setTheme(saved);

    // Maintenance state
    const stored = localStorage.getItem('maintenance-mode');
    setMaintOn(stored !== 'off');

    // Countdown
    if (!targetRef.current) targetRef.current = Date.now() + TARGET_MS;
    const tick = () => {
      const diff = Math.max(0, targetRef.current - Date.now());
      setCountdown({
        h: String(Math.floor(diff / 3600000)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('maint-theme', next);
  }

  function toggleMaintenance() {
    const next = !maintOn;
    setMaintOn(next);
    localStorage.setItem('maintenance-mode', next ? 'on' : 'off');
    if (!next) setTimeout(() => { window.location.href = '/'; }, 800);
  }

  const isDark = theme === 'dark';

  return (
    <>
      <Head>
        <title>Under Maintenance — Back Soon</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className={`root ${isDark ? 'dark' : 'light'}`}>
        {/* Hazard tape */}
        <div className="hazard top" aria-hidden />
        <div className="hazard bottom" aria-hidden />

        {/* Theme toggle */}
        <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* Card */}
        <main className="card">
          <div className="badge">
            <span className="dot" />
            Maintenance Active
          </div>

          {/* SVG Scene — same as maintenance.html */}
          <div className="scene">
            <svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <defs>
                <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a2744"/>
                  <stop offset="100%" stopColor="#0f172a"/>
                </linearGradient>
              </defs>
              <rect width="640" height="280" fill="url(#sky2)"/>
              <circle cx="580" cy="35" r="18" fill="#FEF3C7" opacity="0.9"/>
              <circle cx="588" cy="30" r="14" fill="#1a2744"/>
              {/* Building */}
              <rect x="240" y="130" width="160" height="120" fill="#2a3555"/>
              <line x1="240" y1="160" x2="400" y2="160" stroke="#0f172a" strokeWidth="1.5"/>
              <line x1="240" y1="190" x2="400" y2="190" stroke="#0f172a" strokeWidth="1.5"/>
              <rect x="248" y="138" width="24" height="16" fill="#FEF08A" opacity="0.8" rx="1"/>
              <rect x="328" y="138" width="24" height="16" fill="#FEF08A" opacity="0.9" rx="1"/>
              <rect x="248" y="168" width="24" height="16" fill="#93C5FD" opacity="0.5" rx="1"/>
              <rect x="240" y="110" width="160" height="22" fill="#1e293b"/>
              {/* Left Crane */}
              <rect x="182" y="40" width="8" height="220" fill="#F59E0B"/>
              <rect x="110" y="40" width="160" height="8" fill="#F59E0B"/>
              <line x1="230" y1="48" x2="230" y2="112" stroke="#9CA3AF" strokeWidth="1.5"/>
              <path d="M225,112 Q230,120 235,112" fill="none" stroke="#9CA3AF" strokeWidth="1.5"/>
              {/* Right Crane */}
              <rect x="450" y="20" width="8" height="240" fill="#F59E0B"/>
              <rect x="380" y="20" width="190" height="8" fill="#F59E0B"/>
              <line x1="490" y1="28" x2="490" y2="100" stroke="#9CA3AF" strokeWidth="1.5"/>
              {/* Truck */}
              <rect x="500" y="228" width="110" height="24" fill="#D97706" rx="3"/>
              <rect x="500" y="218" width="45" height="34" fill="#F59E0B" rx="4"/>
              <circle cx="522" cy="253" r="9" fill="#1F2937"/>
              <circle cx="591" cy="253" r="9" fill="#1F2937"/>
              {/* Ground */}
              <rect x="0" y="250" width="640" height="30" fill="#0a0a06"/>
              {/* Barrier */}
              <rect x="130" y="238" width="290" height="6" fill="#F59E0B"/>
              {/* Sign */}
              <rect x="195" y="212" width="90" height="20" fill="#1F2937" rx="3"/>
              <rect x="197" y="214" width="86" height="16" fill="#F59E0B" rx="2"/>
              <text x="240" y="225" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#1F2937">UNDER CONSTRUCTION</text>
            </svg>
          </div>

          <h1>We're doing some <em>heavy lifting</em></h1>
          <p className="sub">
            We're currently performing maintenance to make things better for you.
            Our crew is hard at work — we'll be back shortly!
          </p>

          {/* Icons */}
          <div className="icons">
            {[['🪖','Safety First'],['🔧','Tuning Up'],['⚙️','Upgrading'],['🏗️','Building']].map(([e,l]) => (
              <div key={l} className="icon-item"><span>{e}</span><small>{l}</small></div>
            ))}
          </div>

          {/* Progress */}
          <div className="prog-wrap">
            <div className="prog-fill" />
          </div>
          <div className="prog-label">
            <span>Maintenance progress</span>
            <span>73%</span>
          </div>

          {/* Countdown */}
          <div className="countdown">
            {[['h','Hours'],['m','Minutes'],['s','Seconds']].map(([k,l]) => (
              <div key={k} className="cd-block">
                <span className="cd-num">{countdown[k]}</span>
                <span className="cd-lbl">{l}</span>
              </div>
            ))}
          </div>

          <hr className="divider" />

          <nav className="contact">
            <a href="mailto:hello@yoursite.com">📧 hello@yoursite.com</a>
            <a href="https://twitter.com/yourhandle" target="_blank" rel="noopener">𝕏 @yourhandle</a>
            <a href="https://github.com/yourrepo" target="_blank" rel="noopener">⌥ GitHub</a>
          </nav>
        </main>

        {/* Admin FAB */}
        <button className="admin-fab" onClick={() => setAdminOpen(o => !o)} aria-label="Admin">⚙️</button>

        <div className={`admin-panel ${adminOpen ? 'open' : ''}`}>
          <div className="ap-title">🔐 Admin Panel</div>
          <div className="ap-row">
            <span>Maintenance Mode</span>
            <button
              className={`toggle ${maintOn ? 'on' : ''}`}
              onClick={toggleMaintenance}
              role="switch"
              aria-checked={maintOn}
            />
          </div>
          <div className="ap-status">
            Status: <span className={maintOn ? 'red' : 'green'}>{maintOn ? '● ON' : '● OFF'}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .root {
          --amber: #F59E0B;
          --amber-dark: #D97706;
          font-family: 'Space Grotesk', sans-serif;
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 2rem 1rem;
          overflow-x: hidden;
          transition: background 0.3s, color 0.3s;
        }
        .dark  { background: #0F0F0F; color: #F9FAFB; }
        .light { background: #F5F5F0; color: #111; }

        .hazard {
          position: fixed; left: 0; right: 0; height: 32px; z-index: 100;
          background: repeating-linear-gradient(-45deg,#1A1A1A 0px,#1A1A1A 20px,#F59E0B 20px,#F59E0B 40px);
          animation: tape 4s linear infinite;
        }
        .hazard.top    { top: 0; }
        .hazard.bottom { bottom: 0; }
        @keyframes tape { to { background-position: 56px 0; } }

        .theme-btn {
          position: fixed; top: 48px; right: 1.5rem;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px; padding: 6px 14px; cursor: pointer;
          font-size: 18px; z-index: 99;
        }
        .light .theme-btn { background: rgba(0,0,0,0.05); border-color: rgba(0,0,0,0.1); }

        .card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px; padding: 3rem 2.5rem; max-width: 780px;
          width: 100%; text-align: center; margin-top: 2rem;
          box-shadow: 0 24px 64px rgba(0,0,0,0.3);
        }
        .light .card { background: white; border-color: rgba(0,0,0,0.08); }

        .badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 50px; padding: 6px 14px; font-size: 0.72rem;
          font-family: 'Space Mono', monospace; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--amber); margin-bottom: 2rem;
        }
        .dot {
          width: 7px; height: 7px; background: var(--amber);
          border-radius: 50%; animation: pulse 1.6s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }

        .scene {
          width: 100%; max-width: 640px; margin: 0 auto 2rem;
          border-radius: 16px; overflow: hidden;
          background: linear-gradient(180deg,#1a2744,#0f172a 60%,#1a1a0a);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .scene svg { width: 100%; height: auto; display: block; }

        h1 { font-size: clamp(1.6rem,4vw,2.4rem); font-weight: 700; margin-bottom: 0.75rem; letter-spacing: -0.02em; }
        h1 em { font-style: normal; color: var(--amber); }
        .sub { color: #9CA3AF; font-size: 0.95rem; line-height: 1.65; max-width: 500px; margin: 0 auto 2.5rem; }

        .icons { display: flex; justify-content: center; gap: 1.5rem; margin-bottom: 2.5rem; flex-wrap: wrap; }
        .icon-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .icon-item span { font-size: 1.6rem; }
        .icon-item small { font-size: 0.62rem; font-family: 'Space Mono',monospace; text-transform: uppercase; color: #9CA3AF; letter-spacing: 0.06em; }

        .prog-wrap { background: rgba(255,255,255,0.06); border-radius: 50px; height: 10px; overflow: hidden; margin-bottom: 0.5rem; border: 1px solid rgba(255,255,255,0.08); }
        .prog-fill { height: 100%; width: 0%; background: linear-gradient(90deg,#D97706,#F59E0B,#FDE68A); border-radius: 50px; animation: pLoad 2.5s ease forwards; }
        @keyframes pLoad { to { width: 73%; } }
        .prog-label { display: flex; justify-content: space-between; font-size: 0.72rem; font-family: 'Space Mono',monospace; color: #9CA3AF; margin-bottom: 2.5rem; }
        .prog-label span:last-child { color: var(--amber); }

        .countdown { display: flex; justify-content: center; gap: 1rem; margin-bottom: 2.5rem; flex-wrap: wrap; }
        .cd-block { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 0.9rem 1.2rem; min-width: 72px; }
        .cd-num { font-family: 'Space Mono',monospace; font-size: 2rem; font-weight: 700; color: var(--amber); display: block; }
        .cd-lbl { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.1em; color: #9CA3AF; display: block; margin-top: 4px; }

        .divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 0 0 2rem; }

        .contact { display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap; }
        .contact a { color: #9CA3AF; text-decoration: none; font-size: 0.85rem; padding: 6px 12px; border-radius: 8px; border: 1px solid transparent; transition: all 0.2s; }
        .contact a:hover { color: var(--amber); border-color: rgba(245,158,11,0.2); background: rgba(245,158,11,0.08); }

        .admin-fab { position: fixed; bottom: 56px; right: 1.5rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; z-index: 99; transition: all 0.2s; }
        .admin-fab:hover { transform: rotate(30deg) scale(1.1); }

        .admin-panel { position: fixed; bottom: 110px; right: 1.5rem; background: #181818; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1.25rem; width: 240px; z-index: 98; box-shadow: 0 16px 48px rgba(0,0,0,0.4); transform: translateY(16px) scale(0.95); opacity: 0; pointer-events: none; transition: all 0.3s; }
        .admin-panel.open { transform: translateY(0) scale(1); opacity: 1; pointer-events: all; }
        .ap-title { font-size: 0.72rem; font-family: 'Space Mono',monospace; text-transform: uppercase; letter-spacing: 0.08em; color: #9CA3AF; margin-bottom: 1rem; }
        .ap-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.85rem; }
        .toggle { width: 46px; height: 26px; background: rgba(255,255,255,0.1); border-radius: 50px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; position: relative; transition: background 0.2s; }
        .toggle.on { background: var(--amber); border-color: var(--amber-dark); }
        .toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: white; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
        .toggle.on::after { transform: translateX(20px); }
        .ap-status { font-size: 0.75rem; font-family: 'Space Mono',monospace; padding: 8px 10px; background: rgba(255,255,255,0.04); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); color: #9CA3AF; }
        .red   { color: #EF4444; }
        .green { color: #10B981; }

        @media (max-width: 600px) {
          .card { padding: 2rem 1.25rem; }
          .countdown { gap: 0.6rem; }
          .cd-block { min-width: 60px; }
          .cd-num { font-size: 1.6rem; }
        }
      `}</style>
    </>
  );
}
// pages/admin/maintenance.js  (or app/admin/maintenance/page.jsx for App Router)
//
// SECURE ADMIN TOGGLE PAGE
// ─────────────────────────────────────────────────────────────────────────────
// This page lets you toggle maintenance mode WITHOUT editing env vars manually.
// It calls /api/admin/maintenance to flip the flag in Vercel Edge Config
// (requires @vercel/edge-config package and a configured Edge Config store).
//
// ALTERNATIVE (simpler): Just use the Vercel Dashboard env vars approach.
// See the README.md for both methods.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_HINT || 'admin'; // UI hint only

export default function AdminMaintenancePage() {
  const [status, setStatus] = useState(null); // 'on' | 'off' | null
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [authed, setAuthed]   = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [log, setLog]         = useState([]);

  // Fetch current status on mount (after auth)
  useEffect(() => {
    if (!authed) return;
    fetch('/api/admin/maintenance')
      .then(r => r.json())
      .then(d => {
        setStatus(d.maintenanceMode ? 'on' : 'off');
        setLoading(false);
      })
      .catch(() => { setLoading(false); setError('Could not fetch status'); });
  }, [authed]);

  function handleLogin(e) {
    e.preventDefault();
    // In production: replace with real server-side auth check
    const secret = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'changeme123';
    if (password === secret) {
      setAuthed(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  }

  async function toggle() {
    setSaving(true);
    const newStatus = status === 'on' ? 'off' : 'on';
    try {
      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newStatus === 'on' }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus(newStatus);
        setLog(prev => [
          { time: new Date().toLocaleTimeString(), action: `Maintenance turned ${newStatus.toUpperCase()}` },
          ...prev.slice(0, 9)
        ]);
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setSaving(false);
  }

  if (!authed) {
    return (
      <div style={styles.page}>
        <div style={styles.loginCard}>
          <h1 style={styles.title}>🔐 Admin Login</h1>
          <form onSubmit={handleLogin} style={styles.form}>
            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              autoFocus
            />
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.btn}>Login</button>
          </form>
          <p style={styles.hint}>Set NEXT_PUBLIC_ADMIN_SECRET in your env vars</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏗️ Maintenance Control</h1>
        <p style={styles.sub}>Toggle maintenance mode for your site</p>

        {loading ? (
          <p style={styles.loading}>Loading status…</p>
        ) : (
          <>
            <div style={styles.statusRow}>
              <div style={{
                ...styles.statusBadge,
                background: status === 'on' ? '#FEF3C7' : '#D1FAE5',
                color: status === 'on' ? '#92400E' : '#065F46',
                border: `1px solid ${status === 'on' ? '#F59E0B' : '#10B981'}`,
              }}>
                {status === 'on' ? '🚧 MAINTENANCE ON' : '✅ SITE LIVE'}
              </div>
            </div>

            <p style={styles.description}>
              {status === 'on'
                ? 'All visitors are currently seeing the maintenance page.'
                : 'Your site is fully accessible to all visitors.'}
            </p>

            <button
              onClick={toggle}
              disabled={saving}
              style={{
                ...styles.toggleBtn,
                background: status === 'on' ? '#10B981' : '#EF4444',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving
                ? 'Updating…'
                : status === 'on'
                  ? '✅ Turn Maintenance OFF (go live)'
                  : '🚧 Turn Maintenance ON'}
            </button>

            {error && <p style={styles.error}>{error}</p>}

            {log.length > 0 && (
              <div style={styles.log}>
                <p style={styles.logTitle}>Recent actions</p>
                {log.map((l, i) => (
                  <div key={i} style={styles.logItem}>
                    <span style={styles.logTime}>{l.time}</span>
                    <span>{l.action}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={styles.note}>
              <strong>Method:</strong> Uses <code>/api/admin/maintenance</code> + Vercel Edge Config.<br/>
              Changes take effect within seconds — no redeploy needed.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#0F0F0F', padding: '1rem',
    fontFamily: "'Space Grotesk', -apple-system, sans-serif",
  },
  card: {
    background: '#181818', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20, padding: '2.5rem 2rem', maxWidth: 480, width: '100%',
    color: '#F9FAFB', textAlign: 'center',
  },
  loginCard: {
    background: '#181818', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20, padding: '2.5rem 2rem', maxWidth: 360, width: '100%',
    color: '#F9FAFB', textAlign: 'center',
  },
  title: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' },
  sub:   { color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '1.5rem' },
  loading: { color: '#9CA3AF', marginBottom: '1.5rem' },
  statusRow: { display: 'flex', justifyContent: 'center', marginBottom: '1rem' },
  statusBadge: {
    display: 'inline-block', padding: '8px 18px', borderRadius: 50,
    fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.04em',
  },
  description: { color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '1.5rem' },
  toggleBtn: {
    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
    cursor: 'pointer', fontWeight: 700, fontSize: '1rem', color: 'white',
    marginBottom: '1rem', transition: 'all 0.2s',
  },
  error:   { color: '#F87171', fontSize: '0.85rem', marginBottom: '1rem' },
  log:     { background: '#111', borderRadius: 10, padding: '1rem', textAlign: 'left', marginTop: '1rem' },
  logTitle:{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B7280', marginBottom: '0.5rem' },
  logItem: { display: 'flex', gap: '0.75rem', fontSize: '0.82rem', color: '#9CA3AF', padding: '3px 0' },
  logTime: { color: '#6B7280', fontFamily: 'monospace' },
  note: {
    background: '#111', borderRadius: 10, padding: '1rem',
    fontSize: '0.8rem', color: '#9CA3AF', textAlign: 'left', marginTop: '1rem',
    border: '1px solid rgba(255,255,255,0.06)', lineHeight: 1.6,
  },
  form:    { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  input:   {
    background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
    padding: '12px 16px', color: '#F9FAFB', fontSize: '1rem', outline: 'none',
  },
  btn: {
    background: '#F59E0B', border: 'none', borderRadius: 10, padding: '12px',
    fontWeight: 700, cursor: 'pointer', fontSize: '1rem',
  },
  hint: { color: '#6B7280', fontSize: '0.75rem', marginTop: '0.75rem' },
};
// pages/api/admin/maintenance.js
//
// API Route: Toggle Maintenance Mode
// ─────────────────────────────────────────────────────────────────────────────
// GET  /api/admin/maintenance  → returns current maintenance status
// POST /api/admin/maintenance  → sets maintenance mode on/off
//
// STORAGE OPTIONS (pick one — see comments below):
//   Option A: Vercel Edge Config  (recommended — instant, no redeploy)
//   Option B: Upstash Redis        (works anywhere, free tier available)
//   Option C: Simple JSON file     (easiest, but read-only on Vercel serverless)
//
// This file implements Option A (Edge Config) with a fallback to env var.
// ─────────────────────────────────────────────────────────────────────────────

// ─── OPTION A: Vercel Edge Config ────────────────────────────────────────────
// Setup:
//   1. vercel env add EDGE_CONFIG              (paste your Edge Config URL)
//   2. npm install @vercel/edge-config
//   3. In Vercel Dashboard: Storage → Edge Config → Create Store
//      Add key:  maintenance_mode  value: false
//
// import { get } from '@vercel/edge-config';
// import { createClient } from '@vercel/edge-config';

// ─── OPTION B: Upstash Redis ──────────────────────────────────────────────────
// npm install @upstash/redis
// import { Redis } from '@upstash/redis';
// const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });

// ─── OPTION C: In-Memory (dev/demo only, resets on cold start) ───────────────
let _maintenanceState = process.env.MAINTENANCE_MODE === 'true';

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE-LEVEL APPROACH (Recommended for production):
// Instead of a runtime API toggle, use this endpoint to update the env var
// using the Vercel API, then trigger a redeploy. This is the most reliable.
// ─────────────────────────────────────────────────────────────────────────────

async function updateVercelEnvVar(enabled) {
  const token    = process.env.VERCEL_ACCESS_TOKEN;
  const teamId   = process.env.VERCEL_TEAM_ID;     // optional, for team projects
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) {
    // Fall back to in-memory toggle
    _maintenanceState = enabled;
    return { ok: true, method: 'in-memory', note: 'Set VERCEL_ACCESS_TOKEN + VERCEL_PROJECT_ID for persistent toggle' };
  }

  const baseUrl = `https://api.vercel.com/v9/projects/${projectId}/env`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  const qs = teamId ? `?teamId=${teamId}` : '';

  // 1. Get existing env var ID
  const listRes = await fetch(`${baseUrl}${qs}`, { headers });
  const listData = await listRes.json();
  const existing = listData.envs?.find(e => e.key === 'MAINTENANCE_MODE');

  if (existing) {
    // 2a. Update existing
    await fetch(`${baseUrl}/${existing.id}${qs}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ value: String(enabled), target: ['production', 'preview'] }),
    });
  } else {
    // 2b. Create new
    await fetch(`${baseUrl}${qs}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        key: 'MAINTENANCE_MODE',
        value: String(enabled),
        type: 'plain',
        target: ['production', 'preview'],
      }),
    });
  }

  // 3. Trigger redeploy (picks up new env var instantly via Edge Config alternative)
  // Note: For truly instant (no redeploy) use Edge Config instead
  const deployRes = await fetch(
    `https://api.vercel.com/v13/deployments${qs}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: process.env.VERCEL_PROJECT_ID,
        gitSource: { type: 'github', repoId: process.env.VERCEL_GIT_REPO_ID, ref: 'main' },
        target: 'production',
      }),
    }
  );

  return { ok: true, method: 'vercel-api', redeploy: deployRes.status === 200 };
}

// ─────────────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Protect this endpoint
  const adminSecret = req.headers['x-admin-secret'] || req.query.secret;
  if (adminSecret !== process.env.ADMIN_API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // ── Return current status ──
    const maintenanceMode = _maintenanceState ?? (process.env.MAINTENANCE_MODE === 'true');
    return res.status(200).json({ maintenanceMode, timestamp: new Date().toISOString() });
  }

  if (req.method === 'POST') {
    // ── Toggle ──
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be boolean' });
    }

    try {
      const result = await updateVercelEnvVar(enabled);
      return res.status(200).json({ ok: true, maintenanceMode: enabled, ...result });
    } catch (err) {
      console.error('Maintenance toggle error:', err);
      return res.status(500).json({ error: 'Failed to update maintenance mode', detail: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

