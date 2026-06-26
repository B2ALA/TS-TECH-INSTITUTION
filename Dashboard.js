/* ============================================================
   js/dashboard.js — depends on supabase-client.js, courses.js
   FIXES THE BUG: previously "Automotive Embedded 72% complete" /
   "Edge AI 45% complete" were hardcoded in the hero + dashboard
   regardless of what the logged-in user actually enrolled in.
   This version pulls real rows from `enrollments`, joined with
   `courses`, for the CURRENT user only — a brand-new signup will
   correctly show zero enrolled courses.
   ============================================================ */

async function fetchMyEnrollments(userId) {
  const { data, error } = await sb
    .from('enrollments')
    .select('id, progress_pct, completed, enrolled_at, courses:course_id (id, title, template_label, color, hours, price)')
    .eq('student_id', userId)
    .order('enrolled_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data;
}

async function renderOverview(user, profile) {
  const main = document.getElementById('dashMain');
  if (!main) return;
  main.innerHTML = `<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading your dashboard…</p></div>`;

  const enrollments = await fetchMyEnrollments(user.id);
  const nm = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email;

  const continueLearningHtml = enrollments.length === 0
    ? `<div class="empty-state" style="padding:1.5rem">
         <i class="fas fa-book"></i>
         <p style="margin-bottom:8px">No courses enrolled yet.</p>
         <button class="btn-enroll" onclick="showPage('courses')">Browse Courses</button>
       </div>`
    : enrollments.slice(0, 4).map(e => `
        <div class="enr-item">
          <div class="enr-ico" style="background:${e.courses.color}22"></div>
          <div style="flex:1;min-width:0">
            <div class="enr-name">${e.courses.template_label}</div>
            <div class="enr-prog"><div class="mb"><div class="mf" style="width:${e.progress_pct}%"></div></div>${e.progress_pct}%</div>
          </div>
          <button class="btn-resume" onclick="showPage('courses')">Resume</button>
        </div>`).join('');

  main.innerHTML = `
    <div class="dash-hdr">
      <div><h2>Welcome back, ${nm}!</h2><p>You have ${enrollments.length} course${enrollments.length === 1 ? '' : 's'} in progress.</p></div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:5px;background:rgba(255,214,0,.1);border:1px solid rgba(255,214,0,.2);border-radius:8px;padding:6px 11px;font-size:11px;color:var(--gold)">
          <i class="fas fa-fire"></i>${profile.streak || 1}-day streak!
        </div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card sc1"><div class="sc-ico"><i class="fas fa-book-open"></i></div><div class="sc-val">${enrollments.length}</div><div class="sc-lbl">Enrolled Courses</div></div>
      <div class="stat-card sc2"><div class="sc-ico"><i class="fas fa-clock"></i></div><div class="sc-val">${profile.hours_learned || 0}h</div><div class="sc-lbl">Hours Learned</div></div>
      <div class="stat-card sc3"><div class="sc-ico"><i class="fas fa-star"></i></div><div class="sc-val">${profile.xp || 0}</div><div class="sc-lbl">XP Points</div></div>
      <div class="stat-card sc4"><div class="sc-ico"><i class="fas fa-certificate"></i></div><div class="sc-val">${profile.certificates || 0}</div><div class="sc-lbl">Certificates</div></div>
    </div>
    <div class="dash-g2">
      <div class="dash-card">
        <div class="dc-title">Continue Learning <a onclick="switchDash(null,'mycourses')">View all</a></div>
        ${continueLearningHtml}
      </div>
      <div class="streak-card">
        <div style="font-size:10px;color:var(--text2)">STREAK</div>
        <div class="streak-num">${profile.streak || 1}</div>
        <div style="font-size:11px;color:var(--text2)">days in a row!</div>
      </div>
    </div>`;
}

window.Dashboard = { fetchMyEnrollments, renderOverview };
