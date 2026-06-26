/* ============================================================
   js/admin.js — depends on supabase-client.js, auth.js
   Real admin guard: checks profile.role === 'admin' via the DB
   (RLS-backed), not a client-side flag. Non-admins are bounced.
   ============================================================ */

async function requireAdmin() {
  const session = await Auth.getSession();
  if (!session.ok || session.profile.role !== 'admin') {
    showToast('Admin access only.', 'error');
    showPage('home');
    return null;
  }
  return session.profile;
}

async function fetchAllProfiles(filterRole = '') {
  let q = sb.from('profiles').select('*').order('created_at', { ascending: false });
  if (filterRole) q = q.eq('role', filterRole);
  const { data, error } = await q;
  if (error) { console.error(error); return []; }
  return data;
}

async function setUserStatus(userId, status) {
  const { error } = await sb.from('profiles').update({ status }).eq('id', userId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

async function approveInstructor(userId) {
  return setUserStatus(userId, 'active');
}

async function fetchAdminStats() {
  const [{ count: totalUsers }, { count: students }, { count: instructors }, { count: courses }, { count: enrollments }, payRows] = await Promise.all([
    sb.from('profiles').select('*', { count: 'exact', head: true }),
    sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'instructor'),
    sb.from('courses').select('*', { count: 'exact', head: true }),
    sb.from('enrollments').select('*', { count: 'exact', head: true }),
    sb.from('payments').select('amount').eq('status', 'verified'),
  ]);
  const revenue = (payRows.data || []).reduce((sum, p) => sum + Number(p.amount), 0);
  return { totalUsers, students, instructors, courses, enrollments, revenue };
}

async function fetchAllPayments() {
  const { data, error } = await sb
    .from('payments')
    .select('id, amount, method, status, reference_note, paid_at, profiles:student_id (first_name,last_name,email), courses:course_id (title,template_label)')
    .order('paid_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data;
}

window.AdminAPI = { requireAdmin, fetchAllProfiles, setUserStatus, approveInstructor, fetchAdminStats, fetchAllPayments };
