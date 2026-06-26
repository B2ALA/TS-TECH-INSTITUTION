/* ============================================================
   js/maintenance.js — depends on supabase-client.js
   Checks maintenance_settings on load, redirects non-admins to
   a maintenance overlay, and listens for realtime changes so an
   admin's toggle takes effect instantly for everyone connected —
   no refresh needed.
   ============================================================ */

async function checkMaintenance() {
  const { data, error } = await sb.from('maintenance_settings').select('*').eq('id', 1).single();
  if (error) { console.error(error); return null; }
  return data;
}

function showMaintenanceOverlay(settings) {
  let overlay = document.getElementById('maintenanceOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'maintenanceOverlay';
    overlay.style = 'position:fixed;inset:0;z-index:5000;background:var(--bg);display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem';
    document.body.appendChild(overlay);
  }
  const eta = settings.estimated_completion
    ? new Date(settings.estimated_completion).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : null;
  overlay.innerHTML = `
    <div style="max-width:480px">
      ${settings.maintenance_image_url ? `<img src="${settings.maintenance_image_url}" style="max-width:220px;margin:0 auto 1.5rem;display:block">` : `<div style="font-size:3rem;margin-bottom:1rem">🚧</div>`}
      <h1 style="font-size:1.6rem;font-weight:800;margin-bottom:.8rem">Website Under Maintenance</h1>
      <p style="color:var(--text2);line-height:1.7;margin-bottom:1rem">${settings.maintenance_message}</p>
      ${eta ? `<p style="font-size:.85rem;color:var(--text2)">Estimated completion: <strong>${eta}</strong></p>` : ''}
      <p style="font-size:.8rem;color:var(--text2);margin-top:1.5rem">info@tstechpark.com · +91 9876543210</p>
    </div>`;
  overlay.style.display = 'flex';
}

function hideMaintenanceOverlay() {
  const overlay = document.getElementById('maintenanceOverlay');
  if (overlay) overlay.style.display = 'none';
}

async function applyMaintenanceState(isAdmin) {
  const settings = await checkMaintenance();
  if (!settings) return;
  if (settings.maintenance_mode && !isAdmin) {
    showMaintenanceOverlay(settings);
  } else {
    hideMaintenanceOverlay();
  }
}

function subscribeMaintenance(isAdmin) {
  sb.channel('maintenance_settings_changes')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'maintenance_settings' }, (payload) => {
      if (payload.new.maintenance_mode && !isAdmin) {
        showMaintenanceOverlay(payload.new);
      } else {
        hideMaintenanceOverlay();
      }
    })
    .subscribe();
}

// Admin control panel actions
async function setMaintenanceMode({ mode, message, imageUrl, estimatedCompletion, adminId }) {
  const { error } = await sb.from('maintenance_settings').update({
    maintenance_mode: mode,
    maintenance_message: message,
    maintenance_image_url: imageUrl,
    estimated_completion: estimatedCompletion,
    updated_by: adminId,
  }).eq('id', 1);
  return error ? { ok: false, error: error.message } : { ok: true };
}

window.Maintenance = { checkMaintenance, applyMaintenanceState, subscribeMaintenance, setMaintenanceMode };
