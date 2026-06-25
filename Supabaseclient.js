// Requires the Supabase JS CDN script loaded BEFORE this file:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>

const supabaseClient = window.supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

/** Helper: returns the current session's access token, or null if logged out */
async function getAccessToken() {
  const { data } = await supabaseClient.auth.getSession();
  return data?.session?.access_token || null;
}

/** Helper: calls our backend API with the Supabase auth token attached */
async function apiFetch(path, options = {}) {
  const token = await getAccessToken();
  const res = await fetch(`${window.APP_CONFIG.API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}
