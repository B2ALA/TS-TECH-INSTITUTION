const supabaseAdmin = require('../config/supabaseAdmin');

/**
 * Verifies the Supabase access token sent by the frontend in the
 * Authorization header: "Bearer <token>". Attaches req.user and req.profile.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing auth token' });

    const { data: userData, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !userData?.user) return res.status(401).json({ error: 'Invalid or expired token' });

    const { data: profile, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();
    if (profErr || !profile) return res.status(401).json({ error: 'Profile not found' });
    if (profile.is_blocked) return res.status(403).json({ error: 'Account suspended. Contact support.' });

    req.user = userData.user;
    req.profile = profile;
    next();
  } catch (err) {
    console.error('requireAuth error:', err);
    res.status(500).json({ error: 'Auth check failed' });
  }
}

/** Restricts a route to a given list of roles, e.g. requireRole('admin') */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.profile || !roles.includes(req.profile.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
