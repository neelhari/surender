/**
 * EDUEME RESEARCH LABS — ADMIN PANEL CONTROLLER
 * Full CMS and Leads Management Engine
 */

let currentToken = localStorage.getItem('edueme_admin_token') || 'demo-admin-token-2026';
let adminState = {
  stats: {},
  leads: [],
  courses: [],
  events: [],
  services: [],
  subServices: [],
  gallery: [],
  team: [],
  banners: [],
  settings: null,
  seo: []
};

// --------------------------------------------------------------------------
// TOAST HELPER
// --------------------------------------------------------------------------
function showAdminToast(msg) {
  const t = document.getElementById('toast-msg');
  if (!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 3000);
}

// --------------------------------------------------------------------------
// MODAL CONTROLS
// --------------------------------------------------------------------------
function openAdminModal(title, bodyHtml, footerHtml) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('modal-footer').innerHTML = footerHtml;
  document.getElementById('admin-modal').classList.add('open');
}

function closeAdminModal() {
  document.getElementById('admin-modal').classList.remove('open');
}

// --------------------------------------------------------------------------
// AUTHENTICATION
// --------------------------------------------------------------------------
async function checkAuth() {
  if (!currentToken) {
    showLoginView();
    return;
  }
  try {
    const res = await fetch('/api/auth/check', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.authenticated) {
      showAdminView();
      loadAllAdminData();
    } else {
      showLoginView();
    }
  } catch (e) {
    showLoginView();
  }
}

function showLoginView() {
  document.getElementById('login-container').style.display = 'flex';
  document.getElementById('admin-app').style.display = 'none';
}

function showAdminView() {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('admin-app').style.display = 'flex';
}

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errDiv = document.getElementById('login-error');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      currentToken = data.token;
      localStorage.setItem('edueme_admin_token', currentToken);
      errDiv.style.display = 'none';
      showAdminView();
      loadAllAdminData();
    } else {
      errDiv.textContent = data.error || 'Invalid email or password';
      errDiv.style.display = 'block';
    }
  } catch (err) {
    errDiv.textContent = 'Connection error. Please try again.';
    errDiv.style.display = 'block';
  }
});

async function adminLogout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
  } catch (e) {}
  localStorage.removeItem('edueme_admin_token');
  currentToken = null;
  showLoginView();
}

// --------------------------------------------------------------------------
// TAB SWITCHING & SUB-TAB SWITCHING
// --------------------------------------------------------------------------
function switchAdminTab(tabName) {
  const tabs = ['dashboard', 'leads', 'courses', 'services', 'events', 'team', 'settings'];
  tabs.forEach(t => {
    const section = document.getElementById(`tab-${t}`);
    if (section) section.style.display = (t === tabName) ? 'block' : 'none';
  });

  document.querySelectorAll('.admin-nav-item a').forEach(a => {
    if (a.getAttribute('href') === `#${tabName}`) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });

  const titles = {
    dashboard: 'Dashboard Overview',
    leads: 'Leads & Enquiries',
    courses: 'Courses Management',
    services: 'Services & Sub-Services',
    events: 'Events & Media Hub',
    team: 'Team & Mentors',
    settings: 'Site Settings'
  };
  const titleEl = document.getElementById('current-tab-title');
  if (titleEl) {
    titleEl.textContent = titles[tabName] || 'Admin Panel';
  }

  // Close mobile sidebar if open
  document.getElementById('admin-sidebar')?.classList.remove('open');
}

function switchMediaHubSubTab(subTab) {
  ['events', 'gallery', 'banners'].forEach(s => {
    const view = document.getElementById(`hub-view-${s}`);
    const btn = document.getElementById(`hub-btn-${s}`);
    if (view) view.style.display = (s === subTab) ? 'block' : 'none';
    if (btn) btn.classList.toggle('active', s === subTab);
  });
}
window.switchMediaHubSubTab = switchMediaHubSubTab;

// Mobile sidebar controls
document.getElementById('mobile-sidebar-toggle')?.addEventListener('click', () => {
  document.getElementById('admin-sidebar')?.classList.add('open');
});
document.getElementById('sidebar-close-btn')?.addEventListener('click', () => {
  document.getElementById('admin-sidebar')?.classList.remove('open');
});

// --------------------------------------------------------------------------
// DATA LOADING
// --------------------------------------------------------------------------
async function loadAllAdminData() {
  await Promise.all([
    loadLeads(),
    loadCourses(),
    loadServices(),
    loadAdminEvents(),
    loadGallery(),
    loadTeam(),
    loadBanners(),
    loadSettings()
  ]);
}

// --------------------------------------------------------------------------
// 1. LEADS & DASHBOARD
// --------------------------------------------------------------------------
async function loadLeads() {
  const search = document.getElementById('leads-search-input')?.value || '';
  const status = document.getElementById('leads-filter-status')?.value || 'all';
  const source = document.getElementById('leads-filter-source')?.value || 'all';

  try {
    const res = await fetch(`/api/leads?search=${encodeURIComponent(search)}&status=${status}&source=${source}`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    adminState.leads = data.leads || [];
    adminState.stats = data.stats || {};

    renderDashboardKPIs();
    renderRecentLeads();
    renderAllLeadsTable();
  } catch (e) {
    console.error('Error fetching leads', e);
  }
}

function renderDashboardKPIs() {
  const container = document.getElementById('dashboard-kpis');
  if (!container) return;
  const s = adminState.stats;

  container.innerHTML = `
    <div class="kpi-card" style="border-left: 4px solid var(--accent-blue);">
      <div class="kpi-val" style="color: var(--accent-blue);">${s.total || 0}</div>
      <div class="kpi-label">Total Leads</div>
    </div>
    <div class="kpi-card" style="border-left: 4px solid #eab308;">
      <div class="kpi-val" style="color: #ca8a04;">${s.new || 0}</div>
      <div class="kpi-label">New Enquiries</div>
    </div>
    <div class="kpi-card" style="border-left: 4px solid #3b82f6;">
      <div class="kpi-val" style="color: #2563eb;">${s.contacted || 0}</div>
      <div class="kpi-label">Contacted</div>
    </div>
    <div class="kpi-card" style="border-left: 4px solid #22c55e;">
      <div class="kpi-val" style="color: #16a34a;">${s.converted || 0}</div>
      <div class="kpi-label">Converted</div>
    </div>
  `;
}

function renderRecentLeads() {
  const container = document.getElementById('recent-leads-list');
  if (!container) return;

  const recent = adminState.leads.slice(0, 5);
  if (recent.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 24px; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">No leads received yet.</div>';
    return;
  }

  container.innerHTML = recent.map(l => {
    const target = l.courseName || l.subServiceName || l.serviceName || 'General Enquiry';
    const dateStr = new Date(l.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const cleanPhone = (l.phone || '').replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=Hi%20${encodeURIComponent(l.fullName || '')},%20greetings%20from%20Edueme%20Research%20Labs!`;

    return `
      <div class="modern-row-card">
        <div class="modern-row-left">
          <div class="modern-row-info">
            <div class="modern-row-title">${l.fullName} <span style="font-weight: 500; font-size: 13px; color: #64748b;">(${dateStr})</span></div>
            <div class="modern-row-meta">
              <span>🎯 <strong>${target}</strong></span>
              <span>•</span>
              <span>📞 <a href="tel:${l.phone}" style="color: var(--accent-blue); font-weight: 600;">${l.phone}</a></span>
              ${l.email ? `<span>•</span><span>✉️ ${l.email}</span>` : ''}
            </div>
            ${l.message ? `<div style="font-size: 12.5px; color: #475569; margin-top: 2px;">💬 "${l.message}"</div>` : ''}
          </div>
        </div>
        <div class="modern-row-right">
          <select class="form-control" style="padding: 5px 8px; font-size: 12px; width: 110px; font-weight: 600;" onchange="updateLeadStatus('${l.id}', this.value)">
            <option value="new" ${l.status === 'new' ? 'selected' : ''}>🟡 New</option>
            <option value="contacted" ${l.status === 'contacted' ? 'selected' : ''}>🔵 Contacted</option>
            <option value="converted" ${l.status === 'converted' ? 'selected' : ''}>🟢 Converted</option>
          </select>
          <div class="modern-actions-group">
            <a href="${waLink}" target="_blank" class="action-btn action-btn-wa" title="Chat on WhatsApp" style="text-decoration: none;">💬 WhatsApp</a>
            <a href="tel:${l.phone}" class="action-btn action-btn-call" title="Direct Phone Call" style="text-decoration: none;">📞 Call</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderAllLeadsTable() {
  const container = document.getElementById('all-leads-list');
  if (!container) return;

  if (adminState.leads.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 32px; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">No leads matching search or filter criteria.</div>';
    return;
  }

  container.innerHTML = adminState.leads.map(l => {
    const target = l.courseName || l.subServiceName || l.serviceName || 'General Enquiry';
    const dateFormatted = new Date(l.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const cleanPhone = (l.phone || '').replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=Hi%20${encodeURIComponent(l.fullName || '')},%20greetings%20from%20Edueme%20Research%20Labs!`;

    return `
      <div class="modern-row-card">
        <div class="modern-row-left">
          <div class="modern-row-info">
            <div class="modern-row-title">
              ${l.fullName}
              <span class="meta-pill" style="margin-left: 6px; font-size: 11px;">${l.sourceType}</span>
            </div>
            <div class="modern-row-meta">
              <span>🎯 <strong>${target}</strong></span>
              <span>•</span>
              <span>📞 <a href="tel:${l.phone}" style="color: var(--accent-blue); font-weight: 600;">${l.phone}</a></span>
              ${l.email ? `<span>•</span><span>✉️ ${l.email}</span>` : ''}
              <span>•</span>
              <span style="color: #94a3b8;">📅 ${dateFormatted}</span>
            </div>
            ${l.message ? `<div style="font-size: 12.5px; color: #475569; margin-top: 4px; background: #f8fafc; padding: 6px 10px; border-radius: 6px; border: 1px solid #e2e8f0;">💬 "${l.message}"</div>` : ''}
          </div>
        </div>
        <div class="modern-row-right">
          <select class="form-control" style="padding: 6px 10px; font-size: 12.5px; width: 120px; font-weight: 700;" onchange="updateLeadStatus('${l.id}', this.value)">
            <option value="new" ${l.status === 'new' ? 'selected' : ''}>🟡 New</option>
            <option value="contacted" ${l.status === 'contacted' ? 'selected' : ''}>🔵 Contacted</option>
            <option value="converted" ${l.status === 'converted' ? 'selected' : ''}>🟢 Converted</option>
          </select>
          <div class="modern-actions-group">
            <a href="${waLink}" target="_blank" class="action-btn action-btn-wa" title="Chat on WhatsApp" style="text-decoration: none;">💬 WhatsApp</a>
            <a href="tel:${l.phone}" class="action-btn action-btn-call" title="Direct Phone Call" style="text-decoration: none;">📞 Call</a>
            <button class="modern-btn-delete" onclick="deleteLead('${l.id}')" title="Delete Lead">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function updateLeadStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/leads/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      showAdminToast('Lead status updated');
      loadLeads();
    }
  } catch (e) {
    alert('Failed to update status');
  }
}

async function deleteLead(id) {
  if (!confirm('Are you sure you want to delete this lead?')) return;
  try {
    await fetch(`/api/leads/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    showAdminToast('Lead deleted');
    loadLeads();
  } catch (e) {
    alert('Error deleting lead');
  }
}

function exportLeadsCSV() {
  window.open(`/api/leads/export?token=${currentToken}`, '_blank');
}

// Attach filters to leads
document.getElementById('leads-search-input')?.addEventListener('input', () => loadLeads());
document.getElementById('leads-filter-status')?.addEventListener('change', () => loadLeads());
document.getElementById('leads-filter-source')?.addEventListener('change', () => loadLeads());

// -------------------------------------------------------------
// IMAGE UPLOAD HELPER FOR ADMIN
// -------------------------------------------------------------
async function handleAdminImageUpload(fileInput, textInputId, previewImgId) {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result;
    try {
      showAdminToast('Uploading image...');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ imageBase64: base64, filename: file.name })
      });
      const data = await res.json();
      if (data.url) {
        document.getElementById(textInputId).value = data.url;
        const preview = document.getElementById(previewImgId);
        if (preview) {
          preview.src = data.url;
          preview.style.display = 'block';
        }
        showAdminToast('Image uploaded successfully!');
      } else {
        alert(data.error || 'Image upload failed');
      }
    } catch (err) {
      alert('Error uploading image');
    }
  };
  reader.readAsDataURL(file);
}

// -------------------------------------------------------------
// 2. COURSES CRUD (Screen 15)
// -------------------------------------------------------------
async function loadCourses() {
  try {
    const res = await fetch('/api/courses?all=true');
    adminState.courses = await res.json();
    renderCoursesTable();
  } catch (e) {}
}

function renderCoursesTable() {
  const container = document.getElementById('admin-courses-list');
  if (!container) return;

  if (adminState.courses.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 32px; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">No courses found. Click "+ Add New Course" to add one.</div>';
    return;
  }

  container.innerHTML = adminState.courses.map(c => `
    <div class="modern-row-card">
      <div class="modern-row-left">
        <img class="modern-row-thumb" src="${c.image || '/assets/crop_course_ref.jpg'}" alt="${c.title}" onerror="this.src='/assets/crop_course_ref.jpg'">
        <div class="modern-row-info">
          <div class="modern-row-title">${c.title}</div>
          <div class="modern-row-meta">
            <span class="meta-pill">${c.category}</span>
            <span>•</span>
            <span>⏱️ ${c.duration}</span>
            <span>•</span>
            <span>🎯 ${c.level}</span>
            <span>•</span>
            <span>Order #${c.displayOrder || 1}</span>
          </div>
        </div>
      </div>
      <div class="modern-row-right">
        <span class="modern-status-badge ${c.status === 'active' ? 'active' : 'past'}">${c.status === 'active' ? '● Active' : '○ Inactive'}</span>
        <div class="modern-actions-group">
          <button class="modern-btn-edit" onclick="openEditCourseModal('${c.id}')">✏️ Edit</button>
          <button class="modern-btn-delete" onclick="deleteCourse('${c.id}')">🗑️ Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openAddCourseModal() {
  const body = `
    <form id="modal-course-form">
      <div class="form-group">
        <label class="form-label">Course Title *</label>
        <input type="text" id="c-title" class="form-control" required placeholder="e.g. Robotics with Embedded C" oninput="if(!document.getElementById('c-slug').dataset.touched) document.getElementById('c-slug').value = this.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')">
      </div>
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
        <div class="form-group">
          <label class="form-label">URL Slug *</label>
          <input type="text" id="c-slug" class="form-control" placeholder="robotics-with-embedded-c" oninput="this.dataset.touched = 'true'">
        </div>
        <div class="form-group">
          <label class="form-label">Display Order</label>
          <input type="number" id="c-order" class="form-control" value="${adminState.courses.length + 1}" min="1">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Category *</label>
        <select id="c-category" class="form-control">
          <option value="Robotics">Robotics</option>
          <option value="AI">AI</option>
          <option value="IoT">IoT</option>
          <option value="Mechatronics">Mechatronics</option>
        </select>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label class="form-label">Duration</label>
          <input type="text" id="c-duration" class="form-control" value="3 – 6 Months">
        </div>
        <div class="form-group">
          <label class="form-label">Level</label>
          <input type="text" id="c-level" class="form-control" value="Beginner to Advanced">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Mode</label>
        <input type="text" id="c-mode" class="form-control" value="Offline / Online">
      </div>
      <div class="form-group">
        <label class="form-label">Short Summary</label>
        <input type="text" id="c-short" class="form-control" placeholder="Build, program, and innovate with industry-leading microcontrollers...">
      </div>
      <div class="form-group">
        <label class="form-label">Full Description</label>
        <textarea id="c-desc" class="form-control" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Curriculum Highlights (one per line)</label>
        <textarea id="c-highlights" class="form-control" rows="3" placeholder="Embedded C Syntax\nSensors & Actuators\nAutonomous Obstacle Robot"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Course Image (Upload or specify Asset Path / URL)</label>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="text" id="c-image" class="form-control" value="/assets/crop_course_ref.jpg" onchange="document.getElementById('c-img-prev').src = this.value">
          <input type="file" id="c-image-file" accept="image/*" style="display: none;" onchange="handleAdminImageUpload(this, 'c-image', 'c-img-prev')">
          <button type="button" class="action-btn action-btn-call" style="white-space: nowrap;" onclick="document.getElementById('c-image-file').click()">📁 Upload</button>
        </div>
        <div style="margin-top: 8px;">
          <img id="c-img-prev" src="/assets/crop_course_ref.jpg" style="height: 70px; border-radius: 6px; object-fit: cover; border: 1px solid #e2e8f0;" onerror="this.src='/assets/crop_course_ref.jpg'">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="c-status" class="form-control">
          <option value="active">Active (Visible on public website)</option>
          <option value="inactive">Inactive (Hidden from public website)</option>
        </select>
      </div>
    </form>
  `;
  const footer = `
    <button class="hero-secondary-btn" onclick="closeAdminModal()">Cancel</button>
    <button class="hero-primary-btn" onclick="saveCourse()">Save Course</button>
  `;
  openAdminModal('Add New Course', body, footer);
}

function openEditCourseModal(id) {
  const c = adminState.courses.find(item => item.id === id);
  if (!c) return;

  const body = `
    <form id="modal-course-form">
      <input type="hidden" id="c-id" value="${c.id}">
      <div class="form-group">
        <label class="form-label">Course Title *</label>
        <input type="text" id="c-title" class="form-control" value="${c.title}" required>
      </div>
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
        <div class="form-group">
          <label class="form-label">URL Slug *</label>
          <input type="text" id="c-slug" class="form-control" value="${c.slug || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Display Order</label>
          <input type="number" id="c-order" class="form-control" value="${c.displayOrder || 1}" min="1">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Category *</label>
        <select id="c-category" class="form-control">
          <option value="Robotics" ${c.category === 'Robotics' ? 'selected' : ''}>Robotics</option>
          <option value="AI" ${c.category === 'AI' ? 'selected' : ''}>AI</option>
          <option value="IoT" ${c.category === 'IoT' ? 'selected' : ''}>IoT</option>
          <option value="Mechatronics" ${c.category === 'Mechatronics' ? 'selected' : ''}>Mechatronics</option>
        </select>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label class="form-label">Duration</label>
          <input type="text" id="c-duration" class="form-control" value="${c.duration}">
        </div>
        <div class="form-group">
          <label class="form-label">Level</label>
          <input type="text" id="c-level" class="form-control" value="${c.level}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Mode</label>
        <input type="text" id="c-mode" class="form-control" value="${c.mode}">
      </div>
      <div class="form-group">
        <label class="form-label">Short Summary</label>
        <input type="text" id="c-short" class="form-control" value="${c.shortDescription || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Full Description</label>
        <textarea id="c-desc" class="form-control" rows="3">${c.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Curriculum Highlights (one per line)</label>
        <textarea id="c-highlights" class="form-control" rows="3">${(c.highlights || []).join('\n')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Course Image (Upload or specify Asset Path / URL)</label>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="text" id="c-image" class="form-control" value="${c.image || '/assets/crop_course_ref.jpg'}" onchange="document.getElementById('c-img-prev').src = this.value">
          <input type="file" id="c-image-file" accept="image/*" style="display: none;" onchange="handleAdminImageUpload(this, 'c-image', 'c-img-prev')">
          <button type="button" class="action-btn action-btn-call" style="white-space: nowrap;" onclick="document.getElementById('c-image-file').click()">📁 Upload</button>
        </div>
        <div style="margin-top: 8px;">
          <img id="c-img-prev" src="${c.image || '/assets/crop_course_ref.jpg'}" style="height: 70px; border-radius: 6px; object-fit: cover; border: 1px solid #e2e8f0;" onerror="this.src='/assets/crop_course_ref.jpg'">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="c-status" class="form-control">
          <option value="active" ${c.status === 'active' ? 'selected' : ''}>Active (Visible on public website)</option>
          <option value="inactive" ${c.status === 'inactive' ? 'selected' : ''}>Inactive (Hidden from public website)</option>
        </select>
      </div>
    </form>
  `;
  const footer = `
    <button class="hero-secondary-btn" onclick="closeAdminModal()">Cancel</button>
    <button class="hero-primary-btn" onclick="saveCourse('${c.id}')">Update Course</button>
  `;
  openAdminModal('Edit Course: ' + c.title, body, footer);
}

async function saveCourse(editId) {
  const payload = {
    title: document.getElementById('c-title').value.trim(),
    slug: document.getElementById('c-slug').value.trim(),
    displayOrder: parseInt(document.getElementById('c-order').value, 10) || 1,
    category: document.getElementById('c-category').value,
    duration: document.getElementById('c-duration').value.trim(),
    level: document.getElementById('c-level').value.trim(),
    mode: document.getElementById('c-mode').value.trim(),
    shortDescription: document.getElementById('c-short').value.trim(),
    description: document.getElementById('c-desc').value.trim(),
    highlights: document.getElementById('c-highlights').value.split('\n').map(s => s.trim()).filter(Boolean),
    image: document.getElementById('c-image').value.trim(),
    status: document.getElementById('c-status').value
  };

  const method = editId ? 'PUT' : 'POST';
  const url = editId ? `/api/courses/${editId}` : '/api/courses';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}`
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    closeAdminModal();
    showAdminToast(editId ? 'Course updated' : 'Course created');
    loadCourses();
  } else {
    alert('Failed to save course');
  }
}

async function deleteCourse(id) {
  if (!confirm('Are you sure you want to delete this course?')) return;
  await fetch(`/api/courses/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${currentToken}` }
  });
  showAdminToast('Course deleted');
  loadCourses();
}

// -------------------------------------------------------------
// 2.5 EVENTS & WORKSHOPS CRUD
// -------------------------------------------------------------
let currentEventPhotos = [];

function renderEventPhotosPreview() {
  const container = document.getElementById('event-photos-preview-grid');
  if (!container) return;
  if (!currentEventPhotos || currentEventPhotos.length === 0) {
    container.innerHTML = '<div style="font-size: 12px; color: #94a3b8; font-style: italic; padding: 4px;">No dedicated page photos added yet. (Card cover image will be used by default)</div>';
    return;
  }
  container.innerHTML = currentEventPhotos.map((url, idx) => `
    <div style="position: relative; width: 72px; height: 54px; border-radius: 6px; overflow: hidden; border: 1px solid #cbd5e1; background: #f8fafc; flex-shrink: 0;">
      <img src="${url}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/assets/events_hero.jpg'">
      <button type="button" onclick="removeEventPhoto(${idx})" style="position: absolute; top: 2px; right: 2px; background: rgba(239,68,68,0.9); color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;">&times;</button>
    </div>
  `).join('');
}

function removeEventPhoto(idx) {
  currentEventPhotos.splice(idx, 1);
  renderEventPhotosPreview();
}

function addEventPhotoFromInput() {
  const input = document.getElementById('ev-photo-url-input');
  if (!input) return;
  const val = input.value.trim();
  if (val) {
    currentEventPhotos.push(val);
    input.value = '';
    renderEventPhotosPreview();
  }
}

async function handleEventMultiPhotoUpload(fileInput) {
  const files = fileInput.files;
  if (!files || files.length === 0) return;

  showAdminToast(`Uploading ${files.length} photo(s)...`);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ imageBase64: e.target.result, filename: file.name })
          });
          const data = await res.json();
          if (data.url) {
            currentEventPhotos.push(data.url);
          }
        } catch (err) {
          console.error('Multi upload err:', err);
        }
        resolve();
      };
      reader.readAsDataURL(file);
    });
  }
  fileInput.value = '';
  renderEventPhotosPreview();
  showAdminToast('Dedicated page photos updated!');
}

async function loadAdminEvents() {
  try {
    const res = await fetch('/api/events?all=true');
    adminState.events = await res.json();
    renderAdminEventsTable();
  } catch (e) {
    console.error('Error loading events:', e);
  }
}

function renderAdminEventsTable() {
  const container = document.getElementById('admin-events-list');
  if (!container) return;

  if (!adminState.events || adminState.events.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 32px; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">No events created yet. Click "+ Add New Event" to get started.</div>';
    return;
  }

  container.innerHTML = adminState.events.map(ev => {
    const photoCount = (ev.photos && ev.photos.length) || 0;
    const isUpcoming = ev.type === 'upcoming';

    return `
      <div class="modern-row-card">
        <div class="modern-row-left">
          <img class="modern-row-thumb" src="${ev.image || '/assets/events_hero.jpg'}" alt="${ev.title}" onerror="this.src='/assets/events_hero.jpg'">
          <div class="modern-row-info">
            <div class="modern-row-title">${ev.title}</div>
            <div class="modern-row-meta">
              <span class="meta-pill">${ev.category || 'Workshop'}</span>
              <span>•</span>
              <span>📅 ${ev.date || 'TBD'}</span>
              <span>•</span>
              <span>⏰ ${ev.timings || '8:30 AM to 5:30 PM'}</span>
              <span>•</span>
              <span>📸 ${photoCount} Photo(s)</span>
            </div>
          </div>
        </div>
        <div class="modern-row-right">
          <span class="modern-status-badge ${isUpcoming ? 'upcoming' : 'past'}">${isUpcoming ? '📅 Upcoming' : '🏁 Past Event'}</span>
          <span class="modern-status-badge ${ev.status === 'active' ? 'active' : 'past'}">${ev.status === 'active' ? '● Active' : '○ Inactive'}</span>
          <div class="modern-actions-group">
            <button class="modern-btn-edit" onclick="openEditEventModal('${ev.id}')">✏️ Edit</button>
            <button class="modern-btn-delete" onclick="deleteEvent('${ev.id}')" title="Delete Event">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openAddEventModal() {
  currentEventPhotos = [];
  const body = `
    <form id="modal-event-form">
      <div class="form-group">
        <label class="form-label">Event Title *</label>
        <input type="text" id="ev-title" class="form-control" required placeholder="e.g. Free Hands-on Robotics & AI Workshop" oninput="if(!document.getElementById('ev-slug').dataset.touched) document.getElementById('ev-slug').value = this.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')">
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
        <div class="form-group">
          <label class="form-label">Dedicated Page URL Slug *</label>
          <input type="text" id="ev-slug" class="form-control" placeholder="free-hands-on-robotics-ai-workshop" oninput="this.dataset.touched = 'true'">
        </div>
        <div class="form-group">
          <label class="form-label">Display Order</label>
          <input type="number" id="ev-order" class="form-control" value="${(adminState.events?.length || 0) + 1}" min="1">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label class="form-label">Category *</label>
          <select id="ev-category" class="form-control">
            <option value="Workshops">Workshops</option>
            <option value="Competitions">Competitions & Robowars</option>
            <option value="Masterclasses">Masterclasses</option>
            <option value="Tech Fests">Tech Fests & Exhibitions</option>
            <option value="School Programs">School & College Programs</option>
            <option value="Boot Camps">Hands-on Boot Camps</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Event Type *</label>
          <select id="ev-type" class="form-control">
            <option value="upcoming">Upcoming Event (Accepting Registrations)</option>
            <option value="past">Past / Completed Event (Photo Showcase)</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label class="form-label">Event Date</label>
          <input type="text" id="ev-date" class="form-control" placeholder="e.g. March 28, 2026">
        </div>
        <div class="form-group">
          <label class="form-label">Timings</label>
          <input type="text" id="ev-timings" class="form-control" value="8:30 AM to 5:30 PM">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Location / Venue</label>
        <input type="text" id="ev-location" class="form-control" value="Edueme Research Labs / Partner Campus">
      </div>

      <!-- MAIN CARD IMAGE (1 IMAGE FOR CARD GRID) -->
      <div class="form-group" style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <label class="form-label" style="display: flex; align-items: center; justify-content: space-between;">
          <span><strong>1. Main Card Image</strong> (Displayed on main Events grid)</span>
          <span style="font-size: 11px; color: #64748b;">1 Image</span>
        </label>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="text" id="ev-image" class="form-control" value="/assets/events_hero.jpg" onchange="document.getElementById('ev-img-prev').src = this.value">
          <input type="file" id="ev-image-file" accept="image/*" style="display: none;" onchange="handleAdminImageUpload(this, 'ev-image', 'ev-img-prev')">
          <button type="button" class="action-btn action-btn-call" style="white-space: nowrap;" onclick="document.getElementById('ev-image-file').click()">📁 Upload</button>
        </div>
        <div style="margin-top: 8px;">
          <img id="ev-img-prev" src="/assets/events_hero.jpg" style="height: 65px; border-radius: 6px; object-fit: cover; border: 1px solid #cbd5e1;">
        </div>
      </div>

      <!-- DEDICATED PAGE MULTIPLE IMAGES -->
      <div class="form-group" style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <label class="form-label" style="display: flex; align-items: center; justify-content: space-between;">
          <span><strong>2. Dedicated Page Photo Gallery</strong> (Multiple photos shown on detail page)</span>
          <span style="font-size: 11px; color: var(--accent-blue);">Multi-Upload</span>
        </label>
        
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
          <input type="file" id="ev-multi-files" accept="image/*" multiple style="display: none;" onchange="handleEventMultiPhotoUpload(this)">
          <button type="button" class="hero-primary-btn" style="padding: 6px 14px; font-size: 13px;" onclick="document.getElementById('ev-multi-files').click()">+ Upload Photos From Device</button>
        </div>

        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px;">
          <input type="text" id="ev-photo-url-input" class="form-control" placeholder="Or paste image URL (e.g. /assets/brochure/img_7.jpg)">
          <button type="button" class="action-btn action-btn-call" style="white-space: nowrap;" onclick="addEventPhotoFromInput()">+ Add URL</button>
        </div>

        <div id="event-photos-preview-grid" style="display: flex; gap: 8px; flex-wrap: wrap; max-height: 120px; overflow-y: auto; padding: 4px; background: #fff; border-radius: 6px; border: 1px dashed #cbd5e1;"></div>
      </div>

      <!-- DEDICATED PAGE DESCRIPTION -->
      <div class="form-group">
        <label class="form-label">Dedicated Page Description (Simple and clear)</label>
        <textarea id="ev-desc" class="form-control" rows="5" placeholder="Enter complete details, schedule, highlights, kit requirements, or summary of the event..."></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="ev-status" class="form-control">
          <option value="active">Active (Visible)</option>
          <option value="inactive">Inactive (Draft / Hidden)</option>
        </select>
      </div>
    </form>
  `;
  const footer = `
    <button class="hero-secondary-btn" onclick="closeAdminModal()">Cancel</button>
    <button class="hero-primary-btn" onclick="saveEvent(null)">Create Event</button>
  `;
  openAdminModal('Add New Event / Workshop', body, footer);
  renderEventPhotosPreview();
}

function openEditEventModal(id) {
  const ev = (adminState.events || []).find(item => item.id === id);
  if (!ev) return;

  currentEventPhotos = Array.isArray(ev.photos) ? [...ev.photos] : [];

  const body = `
    <form id="modal-event-form">
      <input type="hidden" id="ev-id" value="${ev.id}">
      <div class="form-group">
        <label class="form-label">Event Title *</label>
        <input type="text" id="ev-title" class="form-control" value="${ev.title || ''}" required>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
        <div class="form-group">
          <label class="form-label">Dedicated Page URL Slug *</label>
          <input type="text" id="ev-slug" class="form-control" value="${ev.slug || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Display Order</label>
          <input type="number" id="ev-order" class="form-control" value="${ev.displayOrder || 1}" min="1">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label class="form-label">Category *</label>
          <select id="ev-category" class="form-control">
            <option value="Workshops" ${ev.category === 'Workshops' ? 'selected' : ''}>Workshops</option>
            <option value="Competitions" ${ev.category === 'Competitions' ? 'selected' : ''}>Competitions & Robowars</option>
            <option value="Masterclasses" ${ev.category === 'Masterclasses' ? 'selected' : ''}>Masterclasses</option>
            <option value="Tech Fests" ${ev.category === 'Tech Fests' ? 'selected' : ''}>Tech Fests & Exhibitions</option>
            <option value="School Programs" ${ev.category === 'School Programs' ? 'selected' : ''}>School & College Programs</option>
            <option value="Boot Camps" ${ev.category === 'Boot Camps' ? 'selected' : ''}>Hands-on Boot Camps</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Event Type *</label>
          <select id="ev-type" class="form-control">
            <option value="upcoming" ${ev.type === 'upcoming' ? 'selected' : ''}>Upcoming Event (Accepting Registrations)</option>
            <option value="past" ${ev.type === 'past' ? 'selected' : ''}>Past / Completed Event (Photo Showcase)</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label class="form-label">Event Date</label>
          <input type="text" id="ev-date" class="form-control" value="${ev.date || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Timings</label>
          <input type="text" id="ev-timings" class="form-control" value="${ev.timings || '8:30 AM to 5:30 PM'}">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Location / Venue</label>
        <input type="text" id="ev-location" class="form-control" value="${ev.location || 'Edueme Research Labs / Partner Campus'}">
      </div>

      <!-- MAIN CARD IMAGE (1 IMAGE FOR CARD GRID) -->
      <div class="form-group" style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <label class="form-label" style="display: flex; align-items: center; justify-content: space-between;">
          <span><strong>1. Main Card Image</strong> (Displayed on main Events grid)</span>
          <span style="font-size: 11px; color: #64748b;">1 Image</span>
        </label>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="text" id="ev-image" class="form-control" value="${ev.image || '/assets/events_hero.jpg'}" onchange="document.getElementById('ev-img-prev').src = this.value">
          <input type="file" id="ev-image-file" accept="image/*" style="display: none;" onchange="handleAdminImageUpload(this, 'ev-image', 'ev-img-prev')">
          <button type="button" class="action-btn action-btn-call" style="white-space: nowrap;" onclick="document.getElementById('ev-image-file').click()">📁 Upload</button>
        </div>
        <div style="margin-top: 8px;">
          <img id="ev-img-prev" src="${ev.image || '/assets/events_hero.jpg'}" style="height: 65px; border-radius: 6px; object-fit: cover; border: 1px solid #cbd5e1;">
        </div>
      </div>

      <!-- DEDICATED PAGE MULTIPLE IMAGES -->
      <div class="form-group" style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <label class="form-label" style="display: flex; align-items: center; justify-content: space-between;">
          <span><strong>2. Dedicated Page Photo Gallery</strong> (Multiple photos shown on detail page)</span>
          <span style="font-size: 11px; color: var(--accent-blue);">Multi-Upload</span>
        </label>
        
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
          <input type="file" id="ev-multi-files" accept="image/*" multiple style="display: none;" onchange="handleEventMultiPhotoUpload(this)">
          <button type="button" class="hero-primary-btn" style="padding: 6px 14px; font-size: 13px;" onclick="document.getElementById('ev-multi-files').click()">+ Upload Photos From Device</button>
        </div>

        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px;">
          <input type="text" id="ev-photo-url-input" class="form-control" placeholder="Or paste image URL (e.g. /assets/brochure/img_7.jpg)">
          <button type="button" class="action-btn action-btn-call" style="white-space: nowrap;" onclick="addEventPhotoFromInput()">+ Add URL</button>
        </div>

        <div id="event-photos-preview-grid" style="display: flex; gap: 8px; flex-wrap: wrap; max-height: 120px; overflow-y: auto; padding: 4px; background: #fff; border-radius: 6px; border: 1px dashed #cbd5e1;"></div>
      </div>

      <!-- DEDICATED PAGE DESCRIPTION -->
      <div class="form-group">
        <label class="form-label">Dedicated Page Description (Simple and clear)</label>
        <textarea id="ev-desc" class="form-control" rows="5">${ev.description || ''}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="ev-status" class="form-control">
          <option value="active" ${ev.status === 'active' ? 'selected' : ''}>Active (Visible)</option>
          <option value="inactive" ${ev.status === 'inactive' ? 'selected' : ''}>Inactive (Draft / Hidden)</option>
        </select>
      </div>
    </form>
  `;
  const footer = `
    <button class="hero-secondary-btn" onclick="closeAdminModal()">Cancel</button>
    <button class="hero-primary-btn" onclick="saveEvent('${ev.id}')">Update Event</button>
  `;
  openAdminModal('Edit Event: ' + ev.title, body, footer);
  renderEventPhotosPreview();
}

async function saveEvent(editId) {
  const title = document.getElementById('ev-title').value.trim();
  const slug = document.getElementById('ev-slug').value.trim();
  if (!title) {
    alert('Please enter an event title');
    return;
  }

  const payload = {
    title,
    slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    displayOrder: parseInt(document.getElementById('ev-order').value, 10) || 1,
    category: document.getElementById('ev-category').value,
    type: document.getElementById('ev-type').value,
    date: document.getElementById('ev-date').value.trim(),
    timings: document.getElementById('ev-timings').value.trim(),
    location: document.getElementById('ev-location').value.trim(),
    image: document.getElementById('ev-image').value.trim() || '/assets/events_hero.jpg',
    photos: currentEventPhotos,
    description: document.getElementById('ev-desc').value.trim(),
    status: document.getElementById('ev-status').value
  };

  const method = editId ? 'PUT' : 'POST';
  const url = editId ? `/api/events/${editId}` : '/api/events';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}`
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    closeAdminModal();
    showAdminToast(editId ? 'Event updated successfully' : 'Event created successfully');
    loadAdminEvents();
  } else {
    alert('Failed to save event');
  }
}

async function deleteEvent(id) {
  if (!confirm('Are you sure you want to delete this event?')) return;
  await fetch(`/api/events/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${currentToken}` }
  });
  showAdminToast('Event deleted');
  loadAdminEvents();
}

// -------------------------------------------------------------
// 3. SERVICES & SUB-SERVICES CRUD (Screen 16 & Correction 1)
// -------------------------------------------------------------
async function loadServices() {
  try {
    const res = await fetch('/api/services?all=true');
    adminState.services = await res.json();
    renderServicesTable();
  } catch (e) {}
}

function renderServicesTable() {
  const container = document.getElementById('admin-services-list');
  if (!container) return;

  if (adminState.services.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 32px; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">No services found. Click "+ Add New Service" to add one.</div>';
    return;
  }

  container.innerHTML = adminState.services.map(s => `
    <div class="modern-row-card">
      <div class="modern-row-left">
        <img class="modern-row-thumb" src="${s.image || '/assets/crop_service_ref.jpg'}" alt="${s.title}" onerror="this.src='/assets/crop_service_ref.jpg'">
        <div class="modern-row-info">
          <div class="modern-row-title">${s.title}</div>
          <div class="modern-row-meta">
            <span>⏱️ ${s.duration}</span>
            <span>•</span>
            <span style="font-weight: 700; color: var(--accent-blue);">📦 ${s.subServices?.length || 0} Sub-Services</span>
            <span>•</span>
            <span>Order #${s.displayOrder || 1}</span>
          </div>
        </div>
      </div>
      <div class="modern-row-right">
        <button class="action-btn action-btn-wa" onclick="openManageSubServicesModal('${s.id}')">⚙️ Manage Sub-Services (${s.subServices?.length || 0})</button>
        <span class="modern-status-badge ${s.status === 'active' ? 'active' : 'past'}">${s.status === 'active' ? '● Active' : '○ Inactive'}</span>
        <div class="modern-actions-group">
          <button class="modern-btn-edit" onclick="openEditServiceModal('${s.id}')">✏️ Edit</button>
          <button class="modern-btn-delete" onclick="deleteService('${s.id}')">🗑️ Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openAddServiceModal() {
  const body = `
    <form id="modal-service-form">
      <div class="form-group">
        <label class="form-label">Service Title *</label>
        <input type="text" id="s-title" class="form-control" required placeholder="e.g. Workshops" oninput="if(!document.getElementById('s-slug').dataset.touched) document.getElementById('s-slug').value = this.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')">
      </div>
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
        <div class="form-group">
          <label class="form-label">URL Slug *</label>
          <input type="text" id="s-slug" class="form-control" placeholder="workshops" oninput="this.dataset.touched = 'true'">
        </div>
        <div class="form-group">
          <label class="form-label">Display Order</label>
          <input type="number" id="s-order" class="form-control" value="${adminState.services.length + 1}" min="1">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Duration</label>
        <input type="text" id="s-duration" class="form-control" value="1 Week – 2 Weeks">
      </div>
      <div class="form-group">
        <label class="form-label">Short Summary</label>
        <input type="text" id="s-short" class="form-control" placeholder="Hands-on technology workshops introducing electronics...">
      </div>
      <div class="form-group">
        <label class="form-label">Full Description</label>
        <textarea id="s-desc" class="form-control" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">What School/Student Receives (one benefit per line)</label>
        <textarea id="s-benefits" class="form-control" rows="3" placeholder="Comprehensive Curriculum\nHardware Kits & Software\nCertifications"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Service Image (Upload or specify Asset Path / URL)</label>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="text" id="s-image" class="form-control" value="/assets/crop_service_ref.jpg" onchange="document.getElementById('s-img-prev').src = this.value">
          <input type="file" id="s-image-file" accept="image/*" style="display: none;" onchange="handleAdminImageUpload(this, 's-image', 's-img-prev')">
          <button type="button" class="action-btn action-btn-call" style="white-space: nowrap;" onclick="document.getElementById('s-image-file').click()">📁 Upload</button>
        </div>
        <div style="margin-top: 8px;">
          <img id="s-img-prev" src="/assets/crop_service_ref.jpg" style="height: 70px; border-radius: 6px; object-fit: cover; border: 1px solid #e2e8f0;" onerror="this.src='/assets/crop_service_ref.jpg'">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="s-status" class="form-control">
          <option value="active">Active (Visible on public website)</option>
          <option value="inactive">Inactive (Hidden from public website)</option>
        </select>
      </div>
    </form>
  `;
  const footer = `
    <button class="hero-secondary-btn" onclick="closeAdminModal()">Cancel</button>
    <button class="hero-primary-btn" onclick="saveService()">Save Service</button>
  `;
  openAdminModal('Add New Service', body, footer);
}

function openEditServiceModal(id) {
  const s = adminState.services.find(item => item.id === id);
  if (!s) return;

  const body = `
    <form id="modal-service-form">
      <div class="form-group">
        <label class="form-label">Service Title *</label>
        <input type="text" id="s-title" class="form-control" value="${s.title}" required>
      </div>
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
        <div class="form-group">
          <label class="form-label">URL Slug *</label>
          <input type="text" id="s-slug" class="form-control" value="${s.slug || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Display Order</label>
          <input type="number" id="s-order" class="form-control" value="${s.displayOrder || 1}" min="1">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Duration</label>
        <input type="text" id="s-duration" class="form-control" value="${s.duration}">
      </div>
      <div class="form-group">
        <label class="form-label">Short Summary</label>
        <input type="text" id="s-short" class="form-control" value="${s.shortDescription || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Full Description</label>
        <textarea id="s-desc" class="form-control" rows="3">${s.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">What School/Student Receives (one per line)</label>
        <textarea id="s-benefits" class="form-control" rows="3">${(s.benefits || []).join('\n')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Service Image (Upload or specify Asset Path / URL)</label>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="text" id="s-image" class="form-control" value="${s.image || '/assets/crop_service_ref.jpg'}" onchange="document.getElementById('s-img-prev').src = this.value">
          <input type="file" id="s-image-file" accept="image/*" style="display: none;" onchange="handleAdminImageUpload(this, 's-image', 's-img-prev')">
          <button type="button" class="action-btn action-btn-call" style="white-space: nowrap;" onclick="document.getElementById('s-image-file').click()">📁 Upload</button>
        </div>
        <div style="margin-top: 8px;">
          <img id="s-img-prev" src="${s.image || '/assets/crop_service_ref.jpg'}" style="height: 70px; border-radius: 6px; object-fit: cover; border: 1px solid #e2e8f0;" onerror="this.src='/assets/crop_service_ref.jpg'">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="s-status" class="form-control">
          <option value="active" ${s.status === 'active' ? 'selected' : ''}>Active (Visible on public website)</option>
          <option value="inactive" ${s.status === 'inactive' ? 'selected' : ''}>Inactive (Hidden from public website)</option>
        </select>
      </div>
    </form>
  `;
  const footer = `
    <button class="hero-secondary-btn" onclick="closeAdminModal()">Cancel</button>
    <button class="hero-primary-btn" onclick="saveService('${s.id}')">Update Service</button>
  `;
  openAdminModal('Edit Service: ' + s.title, body, footer);
}

async function saveService(editId) {
  const payload = {
    title: document.getElementById('s-title').value.trim(),
    slug: document.getElementById('s-slug').value.trim(),
    displayOrder: parseInt(document.getElementById('s-order').value, 10) || 1,
    duration: document.getElementById('s-duration').value.trim(),
    shortDescription: document.getElementById('s-short').value.trim(),
    description: document.getElementById('s-desc').value.trim(),
    benefits: document.getElementById('s-benefits').value.split('\n').map(s => s.trim()).filter(Boolean),
    image: document.getElementById('s-image').value.trim(),
    status: document.getElementById('s-status').value
  };

  const method = editId ? 'PUT' : 'POST';
  const url = editId ? `/api/services/${editId}` : '/api/services';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}`
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    closeAdminModal();
    showAdminToast(editId ? 'Service updated' : 'Service created');
    loadServices();
  }
}

async function deleteService(id) {
  if (!confirm('Are you sure? This will remove this service.')) return;
  await fetch(`/api/services/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${currentToken}` }
  });
  showAdminToast('Service deleted');
  loadServices();
}

// Sub-Services Modal per Service
function openManageSubServicesModal(serviceId) {
  const service = adminState.services.find(s => s.id === serviceId);
  if (!service) return;

  const subs = service.subServices || [];
  const body = `
    <div style="margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 13px; color: var(--text-muted);">${subs.length} sub-services configured for <strong>${service.title}</strong></span>
      <button class="action-btn action-btn-wa" onclick="openAddSubServiceModal('${service.id}')">+ Add New Sub-Service</button>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      ${subs.length === 0 ? '<div style="color: #94a3b8; text-align: center; padding: 20px;">No sub-services yet.</div>' : ''}
      ${subs.map(sub => `
        <div style="padding: 10px 12px; background: #f8fafc; border: 1px solid var(--border-color); border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-weight: 700; font-size: 13px; color: var(--primary-navy);">${sub.title}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${sub.slug} — ${sub.modules ? sub.modules.length : 0} modules</div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="action-btn action-btn-call" onclick="openEditSubServiceModal('${sub.id}')">✏️</button>
            <button class="action-btn" style="color: #ef4444;" onclick="deleteSubService('${sub.id}')">🗑️</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  const footer = `<button class="hero-primary-btn" onclick="closeAdminModal()">Done</button>`;
  openAdminModal(`Sub-Services of ${service.title}`, body, footer);
}

function openAddSubServiceModal(preSelectedServiceId) {
  const body = `
    <form id="modal-sub-form">
      <div class="form-group">
        <label class="form-label">Parent Service *</label>
        <select id="sub-parent" class="form-control" required>
          ${adminState.services.map(s => `
            <option value="${s.id}" ${preSelectedServiceId === s.id ? 'selected' : ''}>${s.title}</option>
          `).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Sub-Service Title *</label>
        <input type="text" id="sub-title" class="form-control" required placeholder="e.g. Component-Based Robotics Lab">
      </div>
      <div class="form-group">
        <label class="form-label">Short Summary</label>
        <input type="text" id="sub-desc" class="form-control">
      </div>
      <div class="form-group">
        <label class="form-label">Detailed In-Depth Overview</label>
        <textarea id="sub-overview" class="form-control" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Modules / Deliverables (one per line)</label>
        <textarea id="sub-modules" class="form-control" rows="3" placeholder="Full Workstation Setup\nComponent Organizers\nChassis Prototyping"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Image URL / Asset Path</label>
        <input type="text" id="sub-image" class="form-control" value="/assets/brochure/img_10.jpg">
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="sub-status" class="form-control">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </form>
  `;
  const footer = `
    <button class="hero-secondary-btn" onclick="closeAdminModal()">Cancel</button>
    <button class="hero-primary-btn" onclick="saveSubService()">Save Sub-Service</button>
  `;
  openAdminModal('Add New Sub-Service', body, footer);
}

function openEditSubServiceModal(id) {
  let foundSub = null;
  adminState.services.forEach(s => {
    (s.subServices || []).forEach(sub => {
      if (sub.id === id) foundSub = sub;
    });
  });
  if (!foundSub) return;

  const body = `
    <form id="modal-sub-form">
      <div class="form-group">
        <label class="form-label">Parent Service</label>
        <select id="sub-parent" class="form-control" required>
          ${adminState.services.map(s => `
            <option value="${s.id}" ${foundSub.serviceId === s.id ? 'selected' : ''}>${s.title}</option>
          `).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Sub-Service Title *</label>
        <input type="text" id="sub-title" class="form-control" value="${foundSub.title}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Short Summary</label>
        <input type="text" id="sub-desc" class="form-control" value="${foundSub.description || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Detailed In-Depth Overview</label>
        <textarea id="sub-overview" class="form-control" rows="3">${foundSub.detailedOverview || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Modules / Deliverables (one per line)</label>
        <textarea id="sub-modules" class="form-control" rows="3">${(foundSub.modules || []).join('\n')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Image URL / Asset Path</label>
        <input type="text" id="sub-image" class="form-control" value="${foundSub.image}">
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="sub-status" class="form-control">
          <option value="active" ${foundSub.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="inactive" ${foundSub.status === 'inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
    </form>
  `;
  const footer = `
    <button class="hero-secondary-btn" onclick="closeAdminModal()">Cancel</button>
    <button class="hero-primary-btn" onclick="saveSubService('${foundSub.id}')">Update Sub-Service</button>
  `;
  openAdminModal('Edit Sub-Service', body, footer);
}

async function saveSubService(editId) {
  const payload = {
    serviceId: document.getElementById('sub-parent').value,
    title: document.getElementById('sub-title').value.trim(),
    description: document.getElementById('sub-desc').value.trim(),
    detailedOverview: document.getElementById('sub-overview').value.trim(),
    modules: document.getElementById('sub-modules').value.split('\n').map(m => m.trim()).filter(Boolean),
    image: document.getElementById('sub-image').value.trim(),
    status: document.getElementById('sub-status').value
  };

  const method = editId ? 'PUT' : 'POST';
  const url = editId ? `/api/sub-services/${editId}` : '/api/sub-services';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}`
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    closeAdminModal();
    showAdminToast('Sub-service saved');
    loadServices();
  }
}

async function deleteSubService(id) {
  if (!confirm('Are you sure you want to delete this sub-service?')) return;
  await fetch(`/api/sub-services/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${currentToken}` }
  });
  showAdminToast('Sub-service deleted');
  closeAdminModal();
  loadServices();
}

// -------------------------------------------------------------
// 4. GALLERY MANAGEMENT (Correction 2 Approved)
// -------------------------------------------------------------
async function loadGallery() {
  try {
    const res = await fetch('/api/gallery?all=true');
    adminState.gallery = await res.json();
    renderGalleryTable();
  } catch (e) {}
}

function renderGalleryTable() {
  const container = document.getElementById('admin-gallery-list');
  if (!container) return;

  if (adminState.gallery.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 32px; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">No gallery photos yet. Click "+ Add Gallery Photo" to add one.</div>';
    return;
  }

  container.innerHTML = adminState.gallery.map(g => `
    <div class="modern-row-card">
      <div class="modern-row-left">
        <img class="modern-row-thumb" src="${g.imageUrl}" alt="${g.title}" onerror="this.src='/assets/brochure/img_7.jpg'">
        <div class="modern-row-info">
          <div class="modern-row-title">${g.title}</div>
          <div class="modern-row-meta">
            <span class="meta-pill">${g.category}</span>
            <span>•</span>
            <span>Order #${g.displayOrder || 1}</span>
          </div>
        </div>
      </div>
      <div class="modern-row-right">
        <span class="modern-status-badge ${g.status === 'active' ? 'active' : 'past'}">${g.status === 'active' ? '● Active' : '○ Inactive'}</span>
        <div class="modern-actions-group">
          <button class="modern-btn-edit" onclick="openEditGalleryModal('${g.id}')">✏️ Edit</button>
          <button class="modern-btn-delete" onclick="deleteGalleryItem('${g.id}')">🗑️ Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openAddGalleryModal() {
  const body = `
    <form id="modal-gal-form">
      <div class="form-group">
        <label class="form-label">Photo Title *</label>
        <input type="text" id="g-title" class="form-control" required placeholder="e.g. Robot Assembly Workshop">
      </div>
      <div class="form-group">
        <label class="form-label">Category *</label>
        <select id="g-category" class="form-control">
          <option value="Workshops">Workshops</option>
          <option value="Competitions">Competitions</option>
          <option value="Tech Tours">Tech Tours</option>
          <option value="Tech Labs">Tech Labs</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Image URL / Path *</label>
        <input type="text" id="g-url" class="form-control" value="/assets/brochure/img_7.jpg" required>
      </div>
      <div class="form-group">
        <label class="form-label">Display Order</label>
        <input type="number" id="g-order" class="form-control" value="${adminState.gallery.length + 1}">
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="g-status" class="form-control">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </form>
  `;
  const footer = `
    <button class="hero-secondary-btn" onclick="closeAdminModal()">Cancel</button>
    <button class="hero-primary-btn" onclick="saveGalleryItem()">Save Photo</button>
  `;
  openAdminModal('Add Gallery Photo', body, footer);
}

function openEditGalleryModal(id) {
  const g = adminState.gallery.find(i => i.id === id);
  if (!g) return;

  const body = `
    <form id="modal-gal-form">
      <div class="form-group">
        <label class="form-label">Photo Title *</label>
        <input type="text" id="g-title" class="form-control" value="${g.title}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Category *</label>
        <select id="g-category" class="form-control">
          <option value="Workshops" ${g.category === 'Workshops' ? 'selected' : ''}>Workshops</option>
          <option value="Competitions" ${g.category === 'Competitions' ? 'selected' : ''}>Competitions</option>
          <option value="Tech Tours" ${g.category === 'Tech Tours' ? 'selected' : ''}>Tech Tours</option>
          <option value="Tech Labs" ${g.category === 'Tech Labs' ? 'selected' : ''}>Tech Labs</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Image URL / Path *</label>
        <input type="text" id="g-url" class="form-control" value="${g.imageUrl}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Display Order</label>
        <input type="number" id="g-order" class="form-control" value="${g.displayOrder || 1}">
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="g-status" class="form-control">
          <option value="active" ${g.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="inactive" ${g.status === 'inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
    </form>
  `;
  const footer = `
    <button class="hero-secondary-btn" onclick="closeAdminModal()">Cancel</button>
    <button class="hero-primary-btn" onclick="saveGalleryItem('${g.id}')">Update Photo</button>
  `;
  openAdminModal('Edit Gallery Photo', body, footer);
}

async function saveGalleryItem(editId) {
  const payload = {
    title: document.getElementById('g-title').value.trim(),
    category: document.getElementById('g-category').value,
    imageUrl: document.getElementById('g-url').value.trim(),
    displayOrder: parseInt(document.getElementById('g-order').value, 10) || 1,
    status: document.getElementById('g-status').value
  };

  const method = editId ? 'PUT' : 'POST';
  const url = editId ? `/api/gallery/${editId}` : '/api/gallery';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}`
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    closeAdminModal();
    showAdminToast('Gallery photo saved');
    loadGallery();
  }
}

async function deleteGalleryItem(id) {
  if (!confirm('Delete this photo?')) return;
  await fetch(`/api/gallery/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${currentToken}` }
  });
  showAdminToast('Photo deleted');
  loadGallery();
}

// -------------------------------------------------------------
// 5. TEAM MANAGEMENT (Correction 3 Approved)
// -------------------------------------------------------------
async function loadTeam() {
  try {
    const res = await fetch('/api/team?all=true');
    adminState.team = await res.json();
    renderTeamTable();
  } catch (e) {}
}

function renderTeamTable() {
  const container = document.getElementById('admin-team-list');
  if (!container) return;

  if (adminState.team.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 32px; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">No team members found. Click "+ Add Team Member" to add one.</div>';
    return;
  }

  container.innerHTML = adminState.team.map(t => `
    <div class="modern-row-card">
      <div class="modern-row-left">
        <img class="modern-row-avatar" src="${t.image}" alt="${t.name}" onerror="this.src='/assets/brochure/img_11.jpg'">
        <div class="modern-row-info">
          <div class="modern-row-title">${t.name}</div>
          <div class="modern-row-meta">
            <span style="color: var(--accent-blue); font-weight: 700;">${t.role}</span>
            ${t.bio ? `<span>•</span><span style="max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.bio}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="modern-row-right">
        <span class="modern-status-badge ${t.status === 'active' ? 'active' : 'past'}">${t.status === 'active' ? '● Active' : '○ Inactive'}</span>
        <div class="modern-actions-group">
          <button class="modern-btn-edit" onclick="openEditTeamModal('${t.id}')">✏️ Edit</button>
          <button class="modern-btn-delete" onclick="deleteTeamMember('${t.id}')">🗑️ Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openAddTeamModal() {
  const body = `
    <form id="modal-team-form">
      <div class="form-group">
        <label class="form-label">Full Name *</label>
        <input type="text" id="tm-name" class="form-control" required placeholder="e.g. Dr. K. Srinivas">
      </div>
      <div class="form-group">
        <label class="form-label">Role / Designation *</label>
        <input type="text" id="tm-role" class="form-control" required placeholder="e.g. Lead Robotics & Embedded Scientist">
      </div>
      <div class="form-group">
        <label class="form-label">Bio / Expertise</label>
        <textarea id="tm-bio" class="form-control" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Photo URL / Path</label>
        <input type="text" id="tm-image" class="form-control" value="/assets/brochure/img_11.jpg">
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="tm-status" class="form-control">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </form>
  `;
  const footer = `
    <button class="hero-secondary-btn" onclick="closeAdminModal()">Cancel</button>
    <button class="hero-primary-btn" onclick="saveTeamMember()">Save Member</button>
  `;
  openAdminModal('Add Team Member', body, footer);
}

function openEditTeamModal(id) {
  const t = adminState.team.find(i => i.id === id);
  if (!t) return;

  const body = `
    <form id="modal-team-form">
      <div class="form-group">
        <label class="form-label">Full Name *</label>
        <input type="text" id="tm-name" class="form-control" value="${t.name}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Role / Designation *</label>
        <input type="text" id="tm-role" class="form-control" value="${t.role}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Bio / Expertise</label>
        <textarea id="tm-bio" class="form-control" rows="3">${t.bio || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Photo URL / Path</label>
        <input type="text" id="tm-image" class="form-control" value="${t.image}">
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="tm-status" class="form-control">
          <option value="active" ${t.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="inactive" ${t.status === 'inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
    </form>
  `;
  const footer = `
    <button class="hero-secondary-btn" onclick="closeAdminModal()">Cancel</button>
    <button class="hero-primary-btn" onclick="saveTeamMember('${t.id}')">Update Member</button>
  `;
  openAdminModal('Edit Team Member: ' + t.name, body, footer);
}

async function saveTeamMember(editId) {
  const payload = {
    name: document.getElementById('tm-name').value.trim(),
    role: document.getElementById('tm-role').value.trim(),
    bio: document.getElementById('tm-bio').value.trim(),
    image: document.getElementById('tm-image').value.trim(),
    status: document.getElementById('tm-status').value
  };

  const method = editId ? 'PUT' : 'POST';
  const url = editId ? `/api/team/${editId}` : '/api/team';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}`
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    closeAdminModal();
    showAdminToast('Team member saved');
    loadTeam();
  }
}

async function deleteTeamMember(id) {
  if (!confirm('Delete this team member?')) return;
  await fetch(`/api/team/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${currentToken}` }
  });
  showAdminToast('Team member deleted');
  loadTeam();
}

// -------------------------------------------------------------
// 6. HOME BANNERS CRUD (Correction 4 Approved)
// -------------------------------------------------------------
async function loadBanners() {
  try {
    const res = await fetch('/api/banners?all=true');
    adminState.banners = await res.json();
    renderBannersTable();
  } catch (e) {}
}

function renderBannersTable() {
  const container = document.getElementById('admin-banners-list');
  if (!container) return;

  if (adminState.banners.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 32px; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">No banners found. Click "+ Add Hero Banner" to add one.</div>';
    return;
  }

  container.innerHTML = adminState.banners.map(b => `
    <div class="modern-row-card">
      <div class="modern-row-left">
        <img class="modern-row-thumb" style="width: 100px; height: 56px;" src="${b.imageUrl}" alt="${b.title}" onerror="this.src='/assets/brochure/img_7.jpg'">
        <div class="modern-row-info">
          <div class="modern-row-title">${b.title}</div>
          <div class="modern-row-meta">
            ${b.badge ? `<span class="section-badge" style="font-size: 10.5px; padding: 2px 8px;">${b.badge}</span><span>•</span>` : ''}
            <span>CTA: <strong>${b.ctaText || 'Explore'}</strong> &rarr; ${b.ctaLink || '/'}</span>
          </div>
        </div>
      </div>
      <div class="modern-row-right">
        <span class="modern-status-badge ${b.status === 'active' ? 'active' : 'past'}">${b.status === 'active' ? '● Active' : '○ Inactive'}</span>
        <div class="modern-actions-group">
          <button class="modern-btn-edit" onclick="openEditBannerModal('${b.id}')">✏️ Edit</button>
          <button class="modern-btn-delete" onclick="deleteBanner('${b.id}')">🗑️ Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openAddBannerModal() {
  const body = `
    <form id="modal-banner-form">
      <div class="form-group">
        <label class="form-label">Badge Text</label>
        <input type="text" id="b-badge" class="form-control" value="Future-Ready Skills">
      </div>
      <div class="form-group">
        <label class="form-label">Headline Title *</label>
        <input type="text" id="b-title" class="form-control" required placeholder="e.g. Future-Ready Skills for a Brighter Tomorrow">
      </div>
      <div class="form-group">
        <label class="form-label">Subtitle / Description</label>
        <textarea id="b-sub" class="form-control" rows="2"></textarea>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label class="form-label">CTA Text</label>
          <input type="text" id="b-cta-text" class="form-control" value="Explore Programs">
        </div>
        <div class="form-group">
          <label class="form-label">CTA Link</label>
          <input type="text" id="b-cta-link" class="form-control" value="/courses">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Banner Image URL / Path</label>
        <input type="text" id="b-image" class="form-control" value="/assets/brochure/img_7.jpg">
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="b-status" class="form-control">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </form>
  `;
  const footer = `
    <button class="hero-secondary-btn" onclick="closeAdminModal()">Cancel</button>
    <button class="hero-primary-btn" onclick="saveBanner()">Save Banner</button>
  `;
  openAdminModal('Add Home Banner', body, footer);
}

function openEditBannerModal(id) {
  const b = adminState.banners.find(i => i.id === id);
  if (!b) return;

  const body = `
    <form id="modal-banner-form">
      <div class="form-group">
        <label class="form-label">Badge Text</label>
        <input type="text" id="b-badge" class="form-control" value="${b.badge || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Headline Title *</label>
        <input type="text" id="b-title" class="form-control" value="${b.title}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Subtitle / Description</label>
        <textarea id="b-sub" class="form-control" rows="2">${b.subtitle || ''}</textarea>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label class="form-label">CTA Text</label>
          <input type="text" id="b-cta-text" class="form-control" value="${b.ctaText || 'Explore Programs'}">
        </div>
        <div class="form-group">
          <label class="form-label">CTA Link</label>
          <input type="text" id="b-cta-link" class="form-control" value="${b.ctaLink || '/courses'}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Banner Image URL / Path</label>
        <input type="text" id="b-image" class="form-control" value="${b.imageUrl}">
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="b-status" class="form-control">
          <option value="active" ${b.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="inactive" ${b.status === 'inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
    </form>
  `;
  const footer = `
    <button class="hero-secondary-btn" onclick="closeAdminModal()">Cancel</button>
    <button class="hero-primary-btn" onclick="saveBanner('${b.id}')">Update Banner</button>
  `;
  openAdminModal('Edit Banner', body, footer);
}

async function saveBanner(editId) {
  const payload = {
    badge: document.getElementById('b-badge').value.trim(),
    title: document.getElementById('b-title').value.trim(),
    subtitle: document.getElementById('b-sub').value.trim(),
    ctaText: document.getElementById('b-cta-text').value.trim(),
    ctaLink: document.getElementById('b-cta-link').value.trim(),
    imageUrl: document.getElementById('b-image').value.trim(),
    status: document.getElementById('b-status').value
  };

  const method = editId ? 'PUT' : 'POST';
  const url = editId ? `/api/banners/${editId}` : '/api/banners';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}`
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    closeAdminModal();
    showAdminToast('Banner saved');
    loadBanners();
  }
}

async function deleteBanner(id) {
  if (!confirm('Delete this banner?')) return;
  await fetch(`/api/banners/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${currentToken}` }
  });
  showAdminToast('Banner deleted');
  loadBanners();
}

// -------------------------------------------------------------
// 7. SITE SETTINGS & SEO
// -------------------------------------------------------------
async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const s = await res.json();
    adminState.settings = s;

    document.getElementById('set-phone').value = s.phone || '';
    document.getElementById('set-mobile').value = s.mobile || '';
    document.getElementById('set-wa').value = s.whatsappNumber || '';
    document.getElementById('set-alert-wa').value = s.alertWhatsApp || '';
    document.getElementById('set-alert-email').value = s.alertEmail || '';
    document.getElementById('set-hours').value = s.workingHours || '';
    document.getElementById('set-address').value = s.address || '';

    document.getElementById('stat-students').value = s.stats?.studentsTrained || '5000+';
    document.getElementById('stat-workshops').value = s.stats?.workshops || '200+';
    document.getElementById('stat-schools').value = s.stats?.schools || '50+';
    document.getElementById('stat-years').value = s.stats?.yearsExp || '10+';
  } catch (e) {}
}

document.getElementById('settings-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    phone: document.getElementById('set-phone').value.trim(),
    mobile: document.getElementById('set-mobile').value.trim(),
    whatsappNumber: document.getElementById('set-wa').value.trim(),
    alertWhatsApp: document.getElementById('set-alert-wa').value.trim(),
    alertEmail: document.getElementById('set-alert-email').value.trim(),
    workingHours: document.getElementById('set-hours').value.trim(),
    address: document.getElementById('set-address').value.trim(),
    stats: {
      studentsTrained: document.getElementById('stat-students').value.trim(),
      workshops: document.getElementById('stat-workshops').value.trim(),
      schools: document.getElementById('stat-schools').value.trim(),
      yearsExp: document.getElementById('stat-years').value.trim()
    }
  };

  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}`
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    showAdminToast('Site settings updated');
  } else {
    alert('Failed to update settings');
  }
});


// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  switchAdminTab(hash);
});
