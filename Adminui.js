/* ============================================================
   js/admin-ui.js — depends on admin.js, payments.js, maintenance.js
   Renders the actual admin dashboard markup into #page-admin.
   Called from main.js's showPage('admin') after requireAdmin().
   ============================================================ */

async function renderAdminPage(adminProfile) {
  const wrap = document.getElementById('adminWrap');
  if (!wrap) return;
  wrap.innerHTML = `<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading admin data…</p></div>`;

  const [stats, users, payments, settings] = await Promise.all([
    AdminAPI.fetchAdminStats(),
    AdminAPI.fetchAllProfiles(),
    AdminAPI.fetchAllPayments(),
    Maintenance.checkMaintenance(),
  ]);

  wrap.innerHTML = `
    <div class="admin-stats">
      <div class="as-c c1"><i class="fas fa-users"></i><div class="asv">${stats.totalUsers}</div><div class="asl">Total Users</div></div>
      <div class="as-c c2"><i class="fas fa-user-graduate"></i><div class="asv">${stats.students}</div><div class="asl">Students</div></div>
      <div class="as-c c3"><i class="fas fa-chalkboard-teacher"></i><div class="asv">${stats.instructors}</div><div class="asl">Instructors</div></div>
      <div class="as-c c4"><i class="fas fa-rupee-sign"></i><div class="asv">₹${stats.revenue.toLocaleString()}</div><div class="asl">Verified Revenue</div></div>
    </div>

    <div class="dash-card" style="margin-bottom:14px">
      <div class="dc-title">Website Maintenance Settings</div>
      <div class="form-group">
        <label class="form-label">Maintenance Mode</label>
        <button class="btn-sm ${settings.maintenance_mode ? 'btn-primary' : 'btn-outline'}" id="maintToggleBtn"
          onclick="toggleMaintenanceUI()">${settings.maintenance_mode ? 'ON — Click to turn OFF' : 'OFF — Click to turn ON'}</button>
      </div>
      <div class="form-group"><label class="form-label">Maintenance Message</label>
        <textarea class="form-input" id="maintMsg" rows="2">${settings.maintenance_message}</textarea></div>
      <div class="form-group"><label class="form-label">Image/GIF URL</label>
        <input class="form-input" id="maintImg" value="${settings.maintenance_image_url || ''}"></div>
      <div class="form-group"><label class="form-label">Estimated Completion</label>
        <input class="form-input" type="datetime-local" id="maintEta" value="${settings.estimated_completion ? settings.estimated_completion.slice(0,16) : ''}"></div>
      <button class="btn-sm btn-primary" onclick="saveMaintenanceSettings('${adminProfile.id}', ${settings.maintenance_mode})">Save Settings</button>
    </div>

    <div class="dash-card" style="margin-bottom:14px">
      <div class="dc-title">User Management</div>
      <div style="overflow-x:auto"><table class="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${users.map(u => `
          <tr>
            <td>${[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td><span class="s-pill ${u.status === 'active' ? 'sp-active' : u.status === 'pending' ? 'sp-pending' : 'sp-susp'}">${u.status.toUpperCase()}</span></td>
            <td><div class="act-btns">
              ${u.role === 'instructor' && u.status === 'pending' ? `<button class="abt ab-v" onclick="adminApprove('${u.id}')">Approve</button>` : ''}
              ${u.status !== 'suspended' && u.role !== 'admin' ? `<button class="abt ab-d" onclick="adminSetStatus('${u.id}','suspended')">Suspend</button>` : ''}
              ${u.status === 'suspended' ? `<button class="abt ab-v" onclick="adminSetStatus('${u.id}','active')">Unsuspend</button>` : ''}
            </div></td>
          </tr>`).join('')}</tbody>
      </table></div>
    </div>

    <div class="dash-card">
      <div class="dc-title">Payment History — All Students</div>
      <div style="overflow-x:auto"><table class="admin-table">
        <thead><tr><th>Student</th><th>Course</th><th>Amount</th><th>Method</th><th>Date/Time</th><th>Status</th><th>Verify</th></tr></thead>
        <tbody>${payments.map(p => `
          <tr>
            <td>${[p.profiles?.first_name, p.profiles?.last_name].filter(Boolean).join(' ')}<br><span style="color:var(--text2);font-size:10px">${p.profiles?.email || ''}</span></td>
            <td>${p.courses?.template_label || p.courses?.title || '—'}</td>
            <td style="color:var(--accent);font-weight:700">₹${Number(p.amount).toLocaleString()}</td>
            <td>${p.method}</td>
            <td>${new Date(p.paid_at).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</td>
            <td><span class="s-pill ${p.status==='verified'?'sp-active':p.status==='rejected'?'sp-susp':'sp-pending'}">${p.status.toUpperCase()}</span></td>
            <td><div class="act-btns">
              ${p.status === 'pending' ? `<button class="abt ab-v" onclick="adminVerifyPayment('${p.id}','verified','${adminProfile.id}')">Verify</button><button class="abt ab-d" onclick="adminVerifyPayment('${p.id}','rejected','${adminProfile.id}')">Reject</button>` : '—'}
            </div></td>
          </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text2)">No payments yet.</td></tr>'}</tbody>
      </table></div>
    </div>`;

  window._currentMaintSettings = settings;
}

function toggleMaintenanceUI() {
  window._maintPending = !(window._maintPending ?? window._currentMaintSettings.maintenance_mode);
  document.getElementById('maintToggleBtn').textContent = window._maintPending ? 'ON — Click to turn OFF' : 'OFF — Click to turn ON';
}

async function saveMaintenanceSettings(adminId, originalMode) {
  const mode = window._maintPending ?? originalMode;
  const res = await Maintenance.setMaintenanceMode({
    mode,
    message: document.getElementById('maintMsg').value,
    imageUrl: document.getElementById('maintImg').value || null,
    estimatedCompletion: document.getElementById('maintEta').value || null,
    adminId,
  });
  showToast(res.ok ? 'Maintenance settings saved.' : res.error, res.ok ? 'success' : 'error');
}

async function adminApprove(userId) {
  const res = await AdminAPI.approveInstructor(userId);
  showToast(res.ok ? 'Instructor approved.' : res.error, res.ok ? 'success' : 'error');
  if (res.ok) AdminAPI.requireAdmin().then(renderAdminPage);
}
async function adminSetStatus(userId, status) {
  const res = await AdminAPI.setUserStatus(userId, status);
  showToast(res.ok ? `User ${status}.` : res.error, res.ok ? 'success' : 'error');
  if (res.ok) AdminAPI.requireAdmin().then(renderAdminPage);
}
async function adminVerifyPayment(paymentId, status, adminId) {
  const res = await Payments.setPaymentStatus(paymentId, status, adminId);
  showToast(res.ok ? `Payment ${status}.` : res.error, res.ok ? 'success' : 'error');
  if (res.ok) AdminAPI.requireAdmin().then(renderAdminPage);
}
