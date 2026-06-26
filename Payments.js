/* ============================================================
   js/payments.js — depends on supabase-client.js
   IMPORTANT: this is a MANUAL payment record system, not a live
   payment gateway. A student says "I paid via UPI/Cash", it's
   stored as 'pending', and an admin marks it 'verified' once
   they've actually confirmed receipt of money. To take real
   online payments you need a registered gateway (Razorpay/Stripe)
   — that's a separate integration requiring merchant credentials.
   ============================================================ */

async function recordPayment({ studentId, courseId, amount, method, referenceNote }) {
  const { data, error } = await sb.from('payments').insert({
    student_id: studentId,
    course_id: courseId,
    amount,
    method,                  // 'UPI' | 'Cash' | 'Card' | 'NetBanking'
    reference_note: referenceNote || null,
    status: 'pending',
  }).select().single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data };
}

async function fetchMyPayments(studentId) {
  const { data, error } = await sb
    .from('payments')
    .select('id, amount, method, status, reference_note, paid_at, courses:course_id (title, template_label)')
    .eq('student_id', studentId)
    .order('paid_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data;
}

// Admin-only: verify or reject a pending payment
async function setPaymentStatus(paymentId, status, adminId) {
  const { error } = await sb.from('payments')
    .update({ status, verified_by: adminId })
    .eq('id', paymentId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

function renderPaymentHistoryTable(rows) {
  if (!rows.length) {
    return `<tr><td colspan="6" style="text-align:center;color:var(--text2);padding:16px">No payments yet.</td></tr>`;
  }
  return rows.map(p => `
    <tr>
      <td style="font-weight:600">${p.courses?.template_label || p.courses?.title || '—'}</td>
      <td style="font-weight:700;color:var(--accent)">₹${Number(p.amount).toLocaleString()}</td>
      <td>${p.method}</td>
      <td>${new Date(p.paid_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
      <td><span class="s-pill ${p.status === 'verified' ? 'sp-active' : p.status === 'rejected' ? 'sp-susp' : 'sp-pending'}">${p.status.toUpperCase()}</span></td>
      <td>${p.reference_note || '—'}</td>
    </tr>`).join('');
}

window.Payments = { recordPayment, fetchMyPayments, setPaymentStatus, renderPaymentHistoryTable };
