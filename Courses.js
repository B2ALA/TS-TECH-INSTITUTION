/* ============================================================
   js/courses.js — depends on supabase-client.js
   Replaces the old hardcoded COURSES array entirely.
   Course "template_label" is shown instead of an emoji,
   e.g. "DATA SCIENCE BY TS TECH PARK".
   ============================================================ */

async function fetchCourses() {
  const { data, error } = await sb
    .from('courses')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data;
}

async function fetchCourseById(id) {
  const { data, error } = await sb.from('courses').select('*').eq('id', id).single();
  if (error) { console.error(error); return null; }
  return data;
}

function renderCourseCard(c) {
  return `
  <div class="cc" onclick="openCourseModal('${c.id}')">
    <div class="cc-thumb" style="background:linear-gradient(135deg,${c.color}22,${c.color}55)">
      <div class="cc-template-label">${c.template_label}</div>
      <button class="cc-wish" onclick="event.stopPropagation();toggleWish('${c.id}',this)"><i class="fas fa-heart"></i></button>
    </div>
    <div class="cc-body">
      <div class="cc-cat">${c.category}</div>
      <div class="cc-title">${c.title}</div>
      <div class="cc-desc">${(c.description || '').substring(0, 90)}…</div>
      <div class="cc-meta"><span><i class="fas fa-clock"></i>${c.hours}h</span><span><i class="fas fa-signal"></i>${c.level}</span></div>
      <div class="cc-footer">
        <div class="cc-price">₹${Number(c.price).toLocaleString()}</div>
        <button class="btn-enroll" onclick="event.stopPropagation();startEnroll('${c.id}')">Enroll Now</button>
      </div>
    </div>
  </div>`;
}

async function renderCoursesGrid() {
  const grid = document.getElementById('coursesGrid');
  if (!grid) return;
  grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-spinner fa-spin"></i><p>Loading courses…</p></div>`;
  const courses = await fetchCourses();
  if (!courses.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-book"></i><p>No courses published yet.</p></div>`;
    return;
  }
  grid.innerHTML = courses.map(renderCourseCard).join('');
}

/* The "template_label" convention: when an admin/instructor creates
   a course, generate this automatically from the title, e.g.:
   "Data Science" -> "DATA SCIENCE BY TS TECH PARK"            */
function makeTemplateLabel(title) {
  return `${title.toUpperCase()} BY TS TECH PARK`;
}

window.Courses = { fetchCourses, fetchCourseById, renderCoursesGrid, makeTemplateLabel };
