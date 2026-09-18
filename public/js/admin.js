/**
 * EDUEME RESEARCH LABS — ADMIN PANEL CONTROLLER
 * Full CMS and Leads Management Engine
 */

let currentToken = localStorage.getItem('edueme_admin_token') || 'demo-admin-token-2026';
let adminState = {
  stats: {},
  leads: [],
  courses: [],
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
// TAB SWITCHING
// --------------------------------------------------------------------------
function switchAdminTab(tabName) {
  const tabs = ['dashboard', 'leads', 'courses', 'services', 'gallery', 'team', 'banners', 'settings', 'seo'];
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
    gallery: 'Gallery Showcase',
    team: 'Team & Mentors',
    banners: 'Home Banners',
    settings: 'Site Settings',
    seo: 'SEO Metadata'
  };
  document.getElementById('current-tab-title').textContent = titles[tabName] || 'Admin Panel';

  // Close mobile sidebar if open
  document.getElementById('admin-sidebar')?.classList.remove('open');
}

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
    loadGallery(),
    loadTeam(),
    loadBanners(),
    loadSettings(),
    loadSEO()
  ]);
}

// --------------------------------------------------------------------------
// 1. LEADS & DASHBOARD (Screens 14 & 17)
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
  const tbody = document.getElementById('recent-leads-tbody');
  if (!tbody) return;

  const recent = adminState.leads.slice(0, 5);
  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 20px;">No leads received yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = recent.map(l => {
    const target = l.courseName || l.subServiceName || l.serviceName || 'General Enquiry';
    const dateStr = new Date(l.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    return `
      <tr>
        <td><strong>${dateStr}</strong></td>
        <td><strong>${l.fullName}</strong></td>
        <td><span class="meta-pill">${l.sourceType}</span> ${target}</td>
        <td><a href="tel:${l.phone}" style="color: var(--accent-blue);">${l.phone}</a></td>
        <td>
          <span class="status-pill status-${l.status}">${l.status}</span>
        </td>
        <td>
          <button class="action-btn action-btn-call" onclick="switchAdminTab('leads')">Manage</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderAllLeadsTable() {
  const tbody = document.getElementById('all-leads-tbody');
  if (!tbody) return;

  if (adminState.leads.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 30px;">No leads matching search criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = adminState.leads.map(l => {
    const target = l.courseName || l.subServiceName || l.serviceName || 'General Enquiry';
    const dateFormatted = new Date(l.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });

    return `
      <tr>
        <td style="white-space: nowrap; font-size: 12px; color: var(--text-muted);">${dateFormatted}</td>
        <td><strong>${l.fullName}</strong></td>
        <td style="font-size: 12px;">
          <div>📞 <a href="tel:${l.phone}" style="color: var(--accent-blue);">${l.phone}</a></div>
          <div>✉️ <a href="mailto:${l.email}" style="color: var(--text-muted);">${l.email}</a></div>
        </td>
        <td>
          <span class="meta-pill" style="margin-bottom: 2px;">${l.sourceType}</span>
          <div style="font-weight: 600; font-size: 12px; color: var(--primary-navy);">${target}</div>
        </td>
        <td style="font-size: 12px; max-width: 200px;">${l.message || '—'}</td>
        <td>
          <select class="form-control" style="padding: 4px 8px; font-size: 12px; width: 110px;" onchange="updateLeadStatus('${l.id}', this.value)">
            <option value="new" ${l.status === 'new' ? 'selected' : ''}>New</option>
            <option value="contacted" ${l.status === 'contacted' ? 'selected' : ''}>Contacted</option>
            <option value="converted" ${l.status === 'converted' ? 'selected' : ''}>Converted</option>
          </select>
        </td>
        <td>
          <button onclick="deleteLead('${l.id}')" style="background: none; border: none; color: #ef4444; font-size: 16px; cursor: pointer;" title="Delete Lead">🗑️</button>
        </td>
      </tr>
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
  const tbody = document.getElementById('admin-courses-tbody');
  if (!tbody) return;

  tbody.innerHTML = adminState.courses.map(c => `
    <tr>
      <td><img src="${c.image || '/assets/crop_course_ref.jpg'}" style="width: 50px; height: 38px; border-radius: 4px; object-fit: cover;" onerror="this.src='/assets/crop_course_ref.jpg'"></td>
      <td><strong>${c.title}</strong><div style="font-size: 11px; color: #64748b;">${c.slug} (Order: ${c.displayOrder || 1})</div></td>
      <td><span class="meta-pill">${c.category}</span></td>
      <td>${c.duration} <span style="color: #94a3b8;">(${c.level})</span></td>
      <td>
        <span class="status-pill status-${c.status}">${c.status}</span>
      </td>
      <td>
        <button class="action-btn action-btn-call" onclick="openEditCourseModal('${c.id}')">✏️ Edit</button>
        <button class="action-btn" style="color: #ef4444;" onclick="deleteCourse('${c.id}')">🗑️</button>
      </td>
    </tr>
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
  const tbody = document.getElementById('admin-services-tbody');
  if (!tbody) return;

  tbody.innerHTML = adminState.services.map(s => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="${s.image || '/assets/crop_service_ref.jpg'}" style="width: 44px; height: 34px; border-radius: 4px; object-fit: cover;" onerror="this.src='/assets/crop_service_ref.jpg'">
          <div>
            <strong>${s.title}</strong>
            <div style="font-size: 11px; color: #64748b;">${s.slug} (Order: ${s.displayOrder || 1})</div>
          </div>
        </div>
      </td>
      <td>${s.duration}</td>
      <td>
        <span class="meta-pill" style="font-weight: 700;">${s.subServices?.length || 0} Sub-Services</span>
        <button class="action-btn action-btn-wa" style="display: inline-block; margin-left: 6px; padding: 2px 6px; font-size: 11px;" onclick="openManageSubServicesModal('${s.id}')">Manage &rarr;</button>
      </td>
      <td>
        <span class="status-pill status-${s.status}">${s.status}</span>
      </td>
      <td>
        <button class="action-btn action-btn-call" onclick="openEditServiceModal('${s.id}')">✏️ Edit</button>
        <button class="action-btn" style="color: #ef4444;" onclick="deleteService('${s.id}')">🗑️</button>
      </td>
    </tr>
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
  const tbody = document.getElementById('admin-gallery-tbody');
  if (!tbody) return;

  tbody.innerHTML = adminState.gallery.map(g => `
    <tr>
      <td><img src="${g.imageUrl}" style="width: 50px; height: 38px; border-radius: 4px; object-fit: cover;"></td>
      <td><strong>${g.title}</strong></td>
      <td><span class="meta-pill">${g.category}</span></td>
      <td><span class="status-pill status-${g.status}">${g.status}</span></td>
      <td>${g.displayOrder || 1}</td>
      <td>
        <button class="action-btn action-btn-call" onclick="openEditGalleryModal('${g.id}')">✏️</button>
        <button class="action-btn" style="color: #ef4444;" onclick="deleteGalleryItem('${g.id}')">🗑️</button>
      </td>
    </tr>
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
  const tbody = document.getElementById('admin-team-tbody');
  if (!tbody) return;

  tbody.innerHTML = adminState.team.map(t => `
    <tr>
      <td><img src="${t.image}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;"></td>
      <td><strong>${t.name}</strong></td>
      <td><span class="meta-pill" style="color: var(--accent-blue); font-weight: 600;">${t.role}</span></td>
      <td><span class="status-pill status-${t.status}">${t.status}</span></td>
      <td>
        <button class="action-btn action-btn-call" onclick="openEditTeamModal('${t.id}')">✏️</button>
        <button class="action-btn" style="color: #ef4444;" onclick="deleteTeamMember('${t.id}')">🗑️</button>
      </td>
    </tr>
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
  const tbody = document.getElementById('admin-banners-tbody');
  if (!tbody) return;

  tbody.innerHTML = adminState.banners.map(b => `
    <tr>
      <td><img src="${b.imageUrl}" style="width: 70px; height: 42px; border-radius: 4px; object-fit: cover;"></td>
      <td>
        <span class="section-badge" style="font-size: 10px;">${b.badge}</span>
        <div style="font-weight: 700; color: var(--primary-navy);">${b.title}</div>
      </td>
      <td>
        <span class="meta-pill">${b.ctaText} &rarr; ${b.ctaLink}</span>
      </td>
      <td><span class="status-pill status-${b.status}">${b.status}</span></td>
      <td>
        <button class="action-btn action-btn-call" onclick="openEditBannerModal('${b.id}')">✏️</button>
        <button class="action-btn" style="color: #ef4444;" onclick="deleteBanner('${b.id}')">🗑️</button>
      </td>
    </tr>
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

async function loadSEO() {
  try {
    const res = await fetch('/api/seo');
    adminState.seo = await res.json();
    renderSEOTable();
  } catch (e) {}
}

function renderSEOTable() {
  const tbody = document.getElementById('admin-seo-tbody');
  if (!tbody) return;

  tbody.innerHTML = adminState.seo.map(s => `
    <tr>
      <td><strong>${s.pageRoute}</strong></td>
      <td style="max-width: 200px;">${s.metaTitle}</td>
      <td style="max-width: 250px; font-size: 12px; color: var(--text-muted);">${s.metaDescription}</td>
      <td style="font-size: 12px;">${s.keywords || '—'}</td>
      <td>
        <button class="action-btn action-btn-call" onclick="openEditSEOModal('${s.pageRoute}')">✏️ Edit</button>
      </td>
    </tr>
  `).join('');
}

function openEditSEOModal(route) {
  const s = adminState.seo.find(item => item.pageRoute === route);
  if (!s) return;

  const body = `
    <form id="modal-seo-form">
      <div class="form-group">
        <label class="form-label">Page Route</label>
        <input type="text" class="form-control" value="${s.pageRoute}" disabled>
      </div>
      <div class="form-group">
        <label class="form-label">Meta Title *</label>
        <input type="text" id="seo-title" class="form-control" value="${s.metaTitle}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Meta Description</label>
        <textarea id="seo-desc" class="form-control" rows="3">${s.metaDescription || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Keywords (comma separated)</label>
        <input type="text" id="seo-keywords" class="form-control" value="${s.keywords || ''}">
      </div>
    </form>
  `;
  const footer = `
    <button class="hero-secondary-btn" onclick="closeAdminModal()">Cancel</button>
    <button class="hero-primary-btn" onclick="saveSEO('${s.pageRoute}')">Save Metadata</button>
  `;
  openAdminModal('Edit SEO for: ' + s.pageRoute, body, footer);
}

async function saveSEO(pageRoute) {
  const payload = {
    pageRoute,
    metaTitle: document.getElementById('seo-title').value.trim(),
    metaDescription: document.getElementById('seo-desc').value.trim(),
    keywords: document.getElementById('seo-keywords').value.trim()
  };

  const res = await fetch('/api/seo', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}`
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    closeAdminModal();
    showAdminToast('SEO updated');
    loadSEO();
  }
}

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  switchAdminTab(hash);
});
