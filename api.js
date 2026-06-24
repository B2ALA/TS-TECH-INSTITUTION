/* js/api.js — single place that talks to the backend */
const API_BASE = window.TS_API_BASE || 'http://localhost:5000/api';

function getToken() { return localStorage.getItem('ts_token') || ''; }
function getAdminToken() { return localStorage.getItem('ts_admin_token') || ''; }
function setToken(t) { t ? localStorage.setItem('ts_token', t) : localStorage.removeItem('ts_token'); }
function setAdminToken(t) { t ? localStorage.setItem('ts_admin_token', t) : localStorage.removeItem('ts_admin_token'); }

/**
 * api(path, { method, body, asAdmin, silent })
 * - Automatically attaches the user or admin bearer token.
 * - Throws an Error with `.message` set to the server's `error` field on failure,
 *   so callers can just `catch(e){ showToast(e.message,'error') }`.
 */
async function api(path, { method = 'GET', body, asAdmin = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = asAdmin ? getAdminToken() : getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error('Could not reach the server. Check that the backend is running.');
  }

  let data = {};
  try { data = await res.json(); } catch (_) { /* empty body */ }

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

window.TS = window.TS || {};
window.TS.api = api;
window.TS.getToken = getToken;
window.TS.setToken = setToken;
window.TS.getAdminToken = getAdminToken;
window.TS.setAdminToken = setAdminToken;
