/**
 * EDUEME RESEARCH LABS — CLIENT SPA ROUTER & VIEW ENGINE
 * Powered by dynamic REST APIs and mobile-first UX standards
 */

let appState = {
  settings: null,
  banners: [],
  courses: [],
  services: [],
  team: [],
  gallery: [],
  currentRoute: window.location.pathname
};

// --------------------------------------------------------------------------
// NOTIFICATION TOAST
// --------------------------------------------------------------------------
function showToast(message, duration = 3500) {
  const toast = document.getElementById('toast-msg');
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
}

// --------------------------------------------------------------------------
// PERSISTENT BOOKMARK SYSTEM
// --------------------------------------------------------------------------
let savedBookmarks = new Set();
try {
  const stored = localStorage.getItem('edueme_saved_items');
  if (stored) savedBookmarks = new Set(JSON.parse(stored));
} catch (e) {}

function toggleCardBookmark(event, id, type, title) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const key = `${type}:${id}`;
  const btn = event?.currentTarget;
  if (savedBookmarks.has(key)) {
    savedBookmarks.delete(key);
    if (btn) {
      btn.classList.remove('saved');
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', 'none');
    }
    showToast(`Removed "${title}" from saved items`);
  } else {
    savedBookmarks.add(key);
    if (btn) {
      btn.classList.add('saved');
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', 'currentColor');
    }
    showToast(`Saved "${title}" to your reading list!`);
  }
  try {
    localStorage.setItem('edueme_saved_items', JSON.stringify(Array.from(savedBookmarks)));
  } catch (e) {}
}

// --------------------------------------------------------------------------
// REUSABLE PREMIUM CARD RENDERERS (Exact Reference Match: 60% Image / 40% Content)
// --------------------------------------------------------------------------
function renderCourseCard(course) {
  const isSaved = savedBookmarks.has(`course:${course.id}`);
  const isRefImg = course.image && (course.image.includes('crop_course_ref') || course.image.includes('course_robotics_ref'));
  const fallbackImg = '/assets/crop_course_ref.jpg';
  const imgUrl = course.image || fallbackImg;
  const safeTitle = (course.title || 'Course').replace(/'/g, "\\'");

  return `
    <article class="edueme-card course-card-item" data-id="${course.id}" data-category="${course.category || ''}">
      <!-- Dominant 60% Image Section -->
      <div class="edueme-card-media-wrap">
        <img src="${imgUrl}" alt="${course.title}" class="edueme-card-img" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';">
        <div class="edueme-card-scrim"></div>
        
        ${!isRefImg ? `
          <div class="edueme-card-overlay-top">
            <div class="edueme-course-kicker">
              <div class="kicker-accent-bar"></div>
              <div class="kicker-content">
                <span class="kicker-type">COURSE</span>
                <span class="kicker-heading">${course.category || 'Tech'}</span>
              </div>
            </div>
            <div class="edueme-course-keywords">
              <span>Build</span>
              <span>Program</span>
              <span>Innovate</span>
            </div>
          </div>
          <div class="edueme-card-overlay-bottom">
            <span class="edueme-script-tag">Curiosity to Creation</span>
          </div>
        ` : ''}
      </div>

      <!-- Clean 40% Content Section -->
      <div class="edueme-card-body">
        <h3 class="edueme-card-title">${course.title}</h3>
        <p class="edueme-card-desc">${course.shortDescription || course.description || ''}</p>
        
        <!-- 3-Column Metadata Row (Icons, Values, Labels) -->
        <div class="edueme-meta-grid meta-grid-3">
          <div class="edueme-meta-col">
            <div class="edueme-meta-icon-wrap icon-blue">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div class="edueme-meta-data">
              <span class="edueme-meta-val" title="${course.duration || '3 – 6 Months'}">${course.duration || '3 – 6 Months'}</span>
              <span class="edueme-meta-lbl">Duration</span>
            </div>
          </div>

          <div class="edueme-meta-col">
            <div class="edueme-meta-icon-wrap icon-green">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <div class="edueme-meta-data">
              <span class="edueme-meta-val" title="${course.level || 'Beginner to Advanced'}">${course.level || 'Beginner to Advanced'}</span>
              <span class="edueme-meta-lbl">Level</span>
            </div>
          </div>

          <div class="edueme-meta-col">
            <div class="edueme-meta-icon-wrap icon-purple">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <div class="edueme-meta-data">
              <span class="edueme-meta-val" title="${course.mode || 'Offline / Online'}">${course.mode || 'Offline / Online'}</span>
              <span class="edueme-meta-lbl">Mode</span>
            </div>
          </div>
        </div>

        <!-- Action Row: View Course CTA + Bookmark -->
        <div class="edueme-card-actions">
          <a href="/courses/${course.slug}" class="edueme-action-btn btn-course" onclick="navigate(event, '/courses/${course.slug}')">
            <span>View Course</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
          <button type="button" class="edueme-bookmark-btn bookmark-course ${isSaved ? 'saved' : ''}" onclick="toggleCardBookmark(event, '${course.id}', 'course', '${safeTitle}')" aria-label="Save Course" title="Save Course">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderServiceCard(service) {
  const isSaved = savedBookmarks.has(`service:${service.id}`);
  const isRefImg = service.image && (service.image.includes('crop_service_ref') || service.image.includes('srv_workshops_ref'));
  const fallbackImg = '/assets/crop_service_ref.jpg';
  const imgUrl = service.image || fallbackImg;
  const safeTitle = (service.title || 'Program').replace(/'/g, "\\'");
  const subCount = service.subServices ? service.subServices.length : 0;

  return `
    <article class="edueme-card service-card-item" data-id="${service.id}">
      <!-- Dominant 60% Image Section -->
      <div class="edueme-card-media-wrap">
        <img src="${imgUrl}" alt="${service.title}" class="edueme-card-img" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';">
        <div class="edueme-card-scrim"></div>
        
        ${!isRefImg ? `
          <div class="edueme-card-overlay-top">
            <div class="edueme-service-kicker">
              <div class="service-kicker-header">
                <span class="service-dash">—</span>
                <span class="service-kicker-type">SERVICE</span>
              </div>
              <span class="service-kicker-heading">${service.title}</span>
              <span class="service-kicker-tagline">Hands-on Learning for Real-World Impact</span>
            </div>
          </div>
          <div class="edueme-card-overlay-top-right">
            <div class="service-stamp-words">
              <span>LEARN</span>
              <span>EXPLORE</span>
              <span>SOLVE</span>
              <span>TOGETHER</span>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Clean 40% Content Section -->
      <div class="edueme-card-body">
        <h3 class="edueme-card-title">${service.title}</h3>
        <p class="edueme-card-desc">${service.shortDescription || service.description || ''}</p>
        
        <!-- 2-Column Metadata Row (Dynamic sub-services count!) -->
        <div class="edueme-meta-grid meta-grid-2">
          <div class="edueme-meta-col service-meta-col">
            <div class="service-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div class="edueme-meta-data">
              <span class="edueme-meta-val" title="${service.duration || '1 Week – 2 Weeks'}">${service.duration || '1 Week – 2 Weeks'}</span>
              <span class="edueme-meta-lbl">Typical Duration</span>
            </div>
          </div>

          <div class="edueme-meta-col service-meta-col">
            <div class="service-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="edueme-meta-data">
              <span class="edueme-meta-val">${subCount} Sub-Services</span>
              <span class="edueme-meta-lbl">Programs Available</span>
            </div>
          </div>
        </div>

        <!-- Action Row: Explore Program CTA + Bookmark -->
        <div class="edueme-card-actions">
          <a href="/services/${service.slug}" class="edueme-action-btn btn-service" onclick="navigate(event, '/services/${service.slug}')">
            <span>Explore Program</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
          <button type="button" class="edueme-bookmark-btn bookmark-service ${isSaved ? 'saved' : ''}" onclick="toggleCardBookmark(event, '${service.id}', 'service', '${safeTitle}')" aria-label="Save Program" title="Save Program">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

// --------------------------------------------------------------------------
// REUSABLE IMAGE-LED INNER-PAGE HERO SYSTEM
// --------------------------------------------------------------------------
function renderInnerHero({
  kicker = '',
  title = '',
  subtitle = '',
  breadcrumbs = [],
  imageUrl = '/assets/hero_robotics.jpg',
  objectPosition = 'center 30%',
  fallbackImage = '/assets/hero_robotics.jpg'
}) {
  const breadcrumbsHtml = (breadcrumbs && breadcrumbs.length > 0) ? `
    <nav class="inner-hero-breadcrumb" aria-label="Breadcrumb">
      ${breadcrumbs.map((b, i) => {
        const isLast = i === breadcrumbs.length - 1;
        if (isLast) {
          return `<span class="breadcrumb-current" aria-current="page">${b.label}</span>`;
        }
        return `
          <a href="${b.url || '/'}" onclick="navigate(event, '${b.url || '/'}')">${b.label}</a>
          <span class="breadcrumb-sep">/</span>
        `;
      }).join('')}
    </nav>
  ` : '';

  return `
    <header class="inner-page-hero">
      <div class="inner-hero-media">
        <img src="${imageUrl || fallbackImage}" 
             alt="${title}" 
             class="inner-hero-img" 
             loading="eager"
             style="object-position: ${objectPosition};"
             onerror="this.onerror=null; this.src='${fallbackImage}';">
        <div class="inner-hero-scrim"></div>
      </div>
      <div class="inner-hero-content">
        <div class="inner-hero-top">
          ${breadcrumbsHtml}
        </div>
        <div class="inner-hero-bottom">
          ${kicker ? `<div class="inner-hero-kicker">${kicker}</div>` : ''}
          <h1 class="inner-hero-title">${title}</h1>
          ${subtitle ? `<p class="inner-hero-subtitle">${subtitle}</p>` : ''}
        </div>
      </div>
    </header>
  `;
}

// --------------------------------------------------------------------------
// LIGHTBOX VIEWER
// --------------------------------------------------------------------------
function openLightbox(imgUrl, caption) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-caption');
  if (modal && img) {
    img.src = imgUrl;
    cap.textContent = caption || '';
    modal.classList.add('open');
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) modal.classList.remove('open');
}

// --------------------------------------------------------------------------
// MOBILE DRAWER CONTROLS
// --------------------------------------------------------------------------
const drawer = document.getElementById('mobile-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const drawerToggle = document.getElementById('drawer-toggle');
const drawerClose = document.getElementById('drawer-close');

function toggleDrawer(open) {
  if (open) {
    drawer.classList.add('open');
    drawerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  } else {
    drawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

if (drawerToggle) drawerToggle.addEventListener('click', () => toggleDrawer(true));
if (drawerClose) drawerClose.addEventListener('click', () => toggleDrawer(false));
if (drawerOverlay) drawerOverlay.addEventListener('click', () => toggleDrawer(false));

function closeDrawerAndNav(event, path) {
  toggleDrawer(false);
  navigate(event, path);
}

// --------------------------------------------------------------------------
// ROUTER & NAVIGATION
// --------------------------------------------------------------------------
function navigate(event, path) {
  if (event) event.preventDefault();
  window.history.pushState({}, '', path);
  handleRouting();
}

window.addEventListener('popstate', handleRouting);

function updateActiveNav(path) {
  // Update desktop nav items
  document.querySelectorAll('.desktop-nav .nav-item').forEach(el => {
    const href = el.getAttribute('href');
    if (href === path || (href !== '/' && path.startsWith(href))) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // Update mobile bottom nav
  document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));
  if (path === '/') {
    const b = document.getElementById('bnav-home');
    if (b) b.classList.add('active');
  } else if (path.startsWith('/courses')) {
    const b = document.getElementById('bnav-courses');
    if (b) b.classList.add('active');
  } else if (path.startsWith('/services')) {
    const b = document.getElementById('bnav-services');
    if (b) b.classList.add('active');
  } else if (path.startsWith('/gallery')) {
    const b = document.getElementById('bnav-gallery');
    if (b) b.classList.add('active');
  } else if (path.startsWith('/contact')) {
    const b = document.getElementById('bnav-contact');
    if (b) b.classList.add('active');
  }
}

async function updateSEO(path) {
  try {
    const res = await fetch(`/api/seo?route=${encodeURIComponent(path)}`);
    if (res.ok) {
      const seo = await res.json();
      if (seo && seo.metaTitle) {
        document.title = seo.metaTitle;
        const metaDesc = document.getElementById('meta-desc');
        const metaKey = document.getElementById('meta-keywords');
        if (metaDesc) metaDesc.content = seo.metaDescription || '';
        if (metaKey) metaKey.content = seo.keywords || '';
      }
    }
  } catch (e) {
    console.error('Failed to load SEO', e);
  }
}

async function handleRouting() {
  const pathname = window.location.pathname;
  appState.currentRoute = pathname;
  window.scrollTo(0, 0);
  updateActiveNav(pathname);
  updateSEO(pathname);

  const root = document.getElementById('app-root');
  root.innerHTML = `<div style="text-align: center; padding: 60px 20px;"><div style="display: inline-block; width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #f5a623; border-radius: 50%; animation: spin 0.8s linear infinite;"></div></div>`;

  // Route: Home
  if (pathname === '/' || pathname === '') {
    await renderHomeView();
  }
  // Route: About Us
  else if (pathname === '/about') {
    await renderAboutView();
  }
  // Route: Courses Listing
  else if (pathname === '/courses') {
    await renderCoursesView();
  }
  // Route: Course Detail (/courses/:slug)
  else if (pathname.startsWith('/courses/')) {
    const slug = pathname.replace('/courses/', '').split('/')[0];
    await renderCourseDetailView(slug);
  }
  // Route: Sub-Service Detail (/services/:serviceSlug/:subServiceSlug) [Correction 1!]
  else if (pathname.startsWith('/services/') && pathname.split('/').filter(Boolean).length === 3) {
    const parts = pathname.split('/').filter(Boolean);
    const serviceSlug = parts[1];
    const subServiceSlug = parts[2];
    await renderSubServiceDetailView(serviceSlug, subServiceSlug);
  }
  // Route: Service Detail (/services/:slug)
  else if (pathname.startsWith('/services/')) {
    const slug = pathname.replace('/services/', '').split('/')[0];
    await renderServiceDetailView(slug);
  }
  // Route: Services Listing
  else if (pathname === '/services') {
    await renderServicesView();
  }
  // Route: Gallery
  else if (pathname === '/gallery') {
    await renderGalleryView();
  }
  // Route: Contact & Unified Enquiry
  else if (pathname === '/contact') {
    await renderContactView();
  }
  // Fallback 404
  else {
    render404View();
  }
}

// --------------------------------------------------------------------------
// API FETCH HELPERS
// --------------------------------------------------------------------------
async function fetchSettings() {
  if (!appState.settings) {
    try {
      const res = await fetch('/api/settings');
      appState.settings = await res.json();
    } catch (e) {
      console.error(e);
    }
  }
  return appState.settings;
}

// --------------------------------------------------------------------------
// 1. HOME VIEW (Screen 1 Reference)
// --------------------------------------------------------------------------
async function renderHomeView() {
  const root = document.getElementById('app-root');

  const [banners, courses, services, settings] = await Promise.all([
    fetch('/api/banners').then(r => r.json()).catch(() => []),
    fetch('/api/courses').then(r => r.json()).catch(() => []),
    fetch('/api/services').then(r => r.json()).catch(() => []),
    fetchSettings()
  ]);

  const activeBanner = banners.length > 0 ? banners[0] : {
    badge: "Future-Ready Skills",
    title: "Future-Ready Skills for a Brighter Tomorrow",
    subtitle: "Robotics | AI | IoT | STEM for Curious Minds. First in India to introduce component-based robotics from 3rd standard.",
    ctaText: "Explore Programs",
    ctaLink: "/courses",
    imageUrl: "/assets/hero_robotics.jpg"
  };

  const popularCourses = courses.slice(0, 3);
  const featuredServices = services.slice(0, 4);

  root.innerHTML = `
    <div class="app-container">
      <!-- TRUE IMAGE-LED HERO BANNER (Image dominates, text overlays image) -->
      <section class="hero-section">
        <div class="hero-image-backdrop">
          <img src="${activeBanner.imageUrl || '/assets/hero_robotics.jpg'}" alt="${activeBanner.title}" class="hero-bg-img" loading="eager">
          <div class="hero-gradient-overlay"></div>
        </div>
        <div class="hero-overlay-content">
          <div class="hero-badge">
            <span>🚀</span> ${activeBanner.badge || 'FUTURE-READY SKILLS'}
          </div>
          <h1 class="hero-title">${activeBanner.title}</h1>
          <p class="hero-subtitle">${activeBanner.subtitle}</p>
          <div class="hero-actions">
            <a href="${activeBanner.ctaLink || '/courses'}" class="hero-primary-btn" onclick="navigate(event, '${activeBanner.ctaLink || '/courses'}')">
              <span>${activeBanner.ctaText || 'Explore Programs'}</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="/contact" class="hero-secondary-btn" onclick="navigate(event, '/contact')">
              <span>Enquire Now</span>
            </a>
          </div>
        </div>
      </section>

      <!-- 4 VALUE PILLARS: MINIMALIST TRANSPARENT MICRO-GRID (OPTION B) -->
      <section class="value-pillars-microgrid">
        <div class="value-pillar-item">
          <div class="value-pillar-icon">🤖</div>
          <div class="value-pillar-label">Hands-on<br>Learning</div>
        </div>
        <div class="value-pillar-item">
          <div class="value-pillar-icon">👨‍🏫</div>
          <div class="value-pillar-label">Expert<br>Mentors</div>
        </div>
        <div class="value-pillar-item">
          <div class="value-pillar-icon">⚡</div>
          <div class="value-pillar-label">Future<br>Ready</div>
        </div>
        <div class="value-pillar-item">
          <div class="value-pillar-icon">🎯</div>
          <div class="value-pillar-label">For All<br>Age Groups</div>
        </div>
      </section>

      <!-- PARTNER SCHOOLS SPOTLIGHT CAROUSEL (Image 2 Round Logos + Image 3 Spotlight Animation) -->
      <section class="partner-schools-spotlight-section">
        <div class="partner-schools-header">
          <span class="schools-kicker">Trusted by 20+ Schools</span>
          <h3 class="schools-title">Partner Institutions Across Telangana</h3>
        </div>

        <div class="schools-spotlight-carousel" id="schoolsSpotlightCarousel">
          <div class="school-spotlight-item active" data-index="0" data-name="Samskar The Life School">
            <div class="school-logo-disc">
              <img src="/assets/schools/school_1.png" alt="Samskar The Life School" loading="lazy">
            </div>
          </div>
          <div class="school-spotlight-item" data-index="1" data-name="Arka International School">
            <div class="school-logo-disc">
              <img src="/assets/schools/school_2.png" alt="Arka International School" loading="lazy">
            </div>
          </div>
          <div class="school-spotlight-item" data-index="2" data-name="Sri Veda The Universe School">
            <div class="school-logo-disc">
              <img src="/assets/schools/school_3.png" alt="Sri Veda The Universe School" loading="lazy">
            </div>
          </div>
          <div class="school-spotlight-item" data-index="3" data-name="Mount Carmel Global School">
            <div class="school-logo-disc">
              <img src="/assets/schools/school_4.png" alt="Mount Carmel Global School" loading="lazy">
            </div>
          </div>
          <div class="school-spotlight-item" data-index="4" data-name="Samartha School">
            <div class="school-logo-disc">
              <img src="/assets/schools/school_5.png" alt="Samartha School" loading="lazy">
            </div>
          </div>
        </div>

        <!-- Dynamic active school label -->
        <div class="school-active-indicator" id="schoolActiveName">
          <span class="school-active-badge">✓ Samskar The Life School</span>
        </div>
      </section>

      <!-- POPULAR COURSES SECTION (Direct Access - No Quote Banner) -->
      <section class="popular-courses-tinted-wrap">
        <div class="section-header" style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <span class="section-badge" style="background: #e0f2fe; color: #0369a1;">Development</span>
            <h2 class="section-title">Our Popular Courses</h2>
          </div>
          <a href="/courses" style="font-weight: 700; color: var(--accent-blue); font-size: 13px;" onclick="navigate(event, '/courses')">View All &rarr;</a>
        </div>

        ${courses.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">📚</div>
            <div class="empty-state-title">No Courses Listed Yet</div>
            <div class="empty-state-text">Check back soon as new programs are added from Admin.</div>
          </div>
        ` : `
          <div class="cards-grid">
            ${popularCourses.map(renderCourseCard).join('')}
          </div>
        `}
      </section>

      <!-- IMPACT METRICS (Brochure & Screen 3) -->
      <section class="section-spacing" style="background: #ffffff; border-radius: var(--radius-lg); padding: 24px 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
        <div style="text-align: center; margin-bottom: 20px;">
          <span class="section-badge">Demonstrated Impact</span>
          <h2 class="section-title">Inspiring Innovation Across India</h2>
          <p class="section-subtitle" style="margin: 0 auto;">Pioneering component-based robotics and tech labs from 3rd standard.</p>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${settings?.stats?.studentsTrained || '5000+'}</div>
            <div class="stat-label">Students Trained</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${settings?.stats?.workshops || '200+'}</div>
            <div class="stat-label">Workshops Delivered</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${settings?.stats?.schools || '50+'}</div>
            <div class="stat-label">Partner Schools</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${settings?.stats?.yearsExp || '10+'}</div>
            <div class="stat-label">Years of Experience</div>
          </div>
        </div>
      </section>

      <!-- PRINCIPAL TESTIMONIALS CAROUSEL (Real School Endorsements from Old Site) -->
      <section class="testimonials-mobile-section">
        <div class="section-header" style="text-align: center; margin-bottom: 16px;">
          <span class="section-badge">Commendation</span>
          <h2 class="section-title">Success Testimonials</h2>
          <p class="section-subtitle" style="margin: 0 auto;">Trusted by school principals and educational leaders across Telangana.</p>
        </div>

        <div class="testimonials-carousel-wrap">
          <div class="testimonial-card-item">
            <div>
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-quote-text">&ldquo;Robotics instruction from Edueme Research Labs is exceptional. Excellent instructors make complex concepts simple. Students train with actual robots and circuitry.&rdquo;</p>
            </div>
            <div class="testimonial-author-row">
              <div class="testimonial-author-avatar">👨‍🏫</div>
              <div class="testimonial-author-info">
                <h4>Jagadeesh</h4>
                <p>Principal, Mount Carmel Global School</p>
                <span class="testimonial-verified-badge">✓ Verified Partner School</span>
              </div>
            </div>
          </div>

          <div class="testimonial-card-item">
            <div>
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-quote-text">&ldquo;Edueme offers outstanding coaching, practical kits, and a very supportive learning environment. Friendly interactions between mentors and students inspire true innovation.&rdquo;</p>
            </div>
            <div class="testimonial-author-row">
              <div class="testimonial-author-avatar">👨‍🏫</div>
              <div class="testimonial-author-info">
                <h4>Vamshi Mohan</h4>
                <p>Samskar Global School</p>
                <span class="testimonial-verified-badge">✓ Verified Partner School</span>
              </div>
            </div>
          </div>

          <div class="testimonial-card-item">
            <div>
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-quote-text">&ldquo;The Prayogshala lab setup transformed how our students engage with science. Introducing robotics as early as 3rd grade has given our students an immense advantage.&rdquo;</p>
            </div>
            <div class="testimonial-author-row">
              <div class="testimonial-author-avatar">👩‍🏫</div>
              <div class="testimonial-author-info">
                <h4>M. Divya</h4>
                <p>Principal, Arka International School</p>
                <span class="testimonial-verified-badge">✓ Verified Partner School</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CORE PROGRAMS & SERVICES HIGHLIGHT -->
      <section class="section-spacing">
        <div class="section-header">
          <span class="section-badge">School & College Solutions</span>
          <h2 class="section-title">Our Programs & Services</h2>
          <p class="section-subtitle">Turnkey innovation labs, teacher training, and university tech tours.</p>
        </div>

        <div class="cards-grid">
          ${featuredServices.map(renderServiceCard).join('')}
        </div>
      </section>

      <!-- NURTURED SKILLS (Brochure Page 3) -->
      <section class="section-spacing" style="background: var(--bg-card); border-radius: var(--radius-lg); padding: 24px 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
        <div class="section-header">
          <span class="section-badge">Holistic Development</span>
          <h2 class="section-title">Nurtured Skills</h2>
          <p class="section-subtitle">Real life competencies students gain through experiential robotics.</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
          <div style="padding: 14px; background: var(--bg-main); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <div style="font-weight: 700; color: var(--primary-navy); margin-bottom: 4px;">🌟 Build Confidence</div>
            <div style="font-size: 13px; color: var(--text-muted);">Children learn to bring their ideas to light, realize their power to invent, and believe in themselves.</div>
          </div>
          <div style="padding: 14px; background: var(--bg-main); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <div style="font-weight: 700; color: var(--primary-navy); margin-bottom: 4px;">💪 Encourage Perseverance</div>
            <div style="font-size: 13px; color: var(--text-muted);">Robotics projects rarely work on the first try. Students develop tenacity and never give up.</div>
          </div>
          <div style="padding: 14px; background: var(--bg-main); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <div style="font-weight: 700; color: var(--primary-navy); margin-bottom: 4px;">🤝 Accept Criticism & Teamwork</div>
            <div style="font-size: 13px; color: var(--text-muted);">Learning to embrace feedback and collaborate productively with peer teammates for collective success.</div>
          </div>
          <div style="padding: 14px; background: var(--bg-main); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <div style="font-weight: 700; color: var(--primary-navy); margin-bottom: 4px;">💻 Programming & Logic</div>
            <div style="font-size: 13px; color: var(--text-muted);">Mastering algorithmic thinking, hardware control, and multi-sensor coordination.</div>
          </div>
        </div>
      </section>

      <!-- SCREEN 12 MOBILE CTA BANNER -->
      <section class="section-spacing">
        <div style="background: linear-gradient(135deg, #0e1628 0%, #1e293b 100%); border-radius: var(--radius-lg); padding: 28px 20px; color: #ffffff; text-align: center; border: 1px solid rgba(245,166,35,0.3);">
          <span style="background: rgba(245,166,35,0.2); color: var(--accent-gold); font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 999px; display: inline-block; margin-bottom: 10px;">Think . Create . Innovate</span>
          <h2 style="font-family: var(--font-heading); font-size: 24px; font-weight: 800; margin-bottom: 8px;">Small Learners. Big Innovators.</h2>
          <p style="font-size: 14px; color: #cbd5e1; max-width: 450px; margin: 0 auto 18px;">Join the next generation of robotics creators, AI architects, and tech leaders.</p>
          <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
            <a href="/contact" class="header-cta-btn" style="padding: 11px 24px; font-size: 14px;" onclick="navigate(event, '/contact')">Get Started Today →</a>
            <a href="tel:04035988650" class="hero-secondary-btn" style="padding: 11px 20px; font-size: 14px;">Call Us Directly</a>
          </div>
        </div>
      </section>
    </div>
  `;

  initSchoolsSpotlight();
}

// --------------------------------------------------------------------------
// 2. ABOUT US VIEW (Screen 3 & Real Brochure Data)
// --------------------------------------------------------------------------
async function renderAboutView() {
  const root = document.getElementById('app-root');
  const [settings, team] = await Promise.all([
    fetchSettings(),
    fetch('/api/team').then(r => r.json()).catch(() => [])
  ]);

  root.innerHTML = `
    <div class="app-container" style="padding-top: 0;">
      ${renderInnerHero({
        kicker: 'OUR LEGACY & MISSION',
        title: 'About Edueme Research Labs',
        subtitle: 'Inspiring Innovation. Building Future. — Learn . Practice . Achieve',
        breadcrumbs: [
          { label: 'Home', url: '/' },
          { label: 'About Us' }
        ],
        imageUrl: '/assets/about_hero.jpg',
        objectPosition: 'center 40%'
      })}

      <!-- ABOUT STORY HIGHLIGHT CARD -->
      <div class="detail-card" style="margin-top: 4px; margin-bottom: 20px;">
        <h3 class="detail-card-title">🔬 Inspiring 21st Century Innovators</h3>
        <p style="font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-line;">
          ${settings?.aboutStory || ''}
        </p>
      </div>

      <!-- STATS COUNTER CARDS (Screen 3 Reference) -->
      <div class="stats-grid" style="margin-bottom: 24px;">
        <div class="stat-card">
          <div class="stat-number">${settings?.stats?.studentsTrained || '5000+'}</div>
          <div class="stat-label">Students Trained</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${settings?.stats?.workshops || '200+'}</div>
          <div class="stat-label">Workshops</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${settings?.stats?.schools || '50+'}</div>
          <div class="stat-label">Schools</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${settings?.stats?.yearsExp || '10+'}</div>
          <div class="stat-label">Years Experience</div>
        </div>
      </div>

      <!-- PARTNER INSTITUTIONS SPOTLIGHT CAROUSEL (Also in About Us) -->
      <section class="partner-schools-spotlight-section" style="border-radius: var(--radius-md); margin-bottom: 24px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
        <div class="partner-schools-header">
          <span class="schools-kicker">Trusted by 20+ Schools</span>
          <h3 class="schools-title">Partner Institutions Across Telangana</h3>
        </div>

        <div class="schools-spotlight-carousel" id="aboutSchoolsSpotlightCarousel">
          <div class="school-spotlight-item active" data-index="0" data-name="Samskar The Life School">
            <div class="school-logo-disc">
              <img src="/assets/schools/school_1.png" alt="Samskar The Life School" loading="lazy">
            </div>
          </div>
          <div class="school-spotlight-item" data-index="1" data-name="Arka International School">
            <div class="school-logo-disc">
              <img src="/assets/schools/school_2.png" alt="Arka International School" loading="lazy">
            </div>
          </div>
          <div class="school-spotlight-item" data-index="2" data-name="Sri Veda The Universe School">
            <div class="school-logo-disc">
              <img src="/assets/schools/school_3.png" alt="Sri Veda The Universe School" loading="lazy">
            </div>
          </div>
          <div class="school-spotlight-item" data-index="3" data-name="Mount Carmel Global School">
            <div class="school-logo-disc">
              <img src="/assets/schools/school_4.png" alt="Mount Carmel Global School" loading="lazy">
            </div>
          </div>
          <div class="school-spotlight-item" data-index="4" data-name="Samartha School">
            <div class="school-logo-disc">
              <img src="/assets/schools/school_5.png" alt="Samartha School" loading="lazy">
            </div>
          </div>
        </div>

        <!-- Dynamic active school label -->
        <div class="school-active-indicator" id="aboutSchoolActiveName">
          <span class="school-active-badge">✓ Samskar The Life School</span>
        </div>
      </section>

      <!-- MISSION CARD -->
      <div class="detail-card">
        <h3 class="detail-card-title">🎯 Our Mission</h3>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">
          ${settings?.mission || 'To provide high-quality, practical and industry-focused education in emerging technologies.'}
        </p>
      </div>

      <!-- PUBLICATIONS & BOOKS (Brochure Pages 12 & 13) -->
      <div class="detail-card">
        <h3 class="detail-card-title">📖 Our Robotics & AI Textbooks</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">Standardized STEM & Robotics curriculum books designed for grades II through X:</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
          <div style="padding: 12px; background: var(--bg-main); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <div style="font-weight: 700; color: var(--primary-navy);">Learning Robotics with Electronics</div>
            <div style="font-size: 12px; color: var(--accent-blue); margin-top: 2px;">Grade II, Grade V, Grade VIII, Grade X</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Comprehensive hardware guides, circuit diagrams, and assembly steps.</div>
          </div>
          <div style="padding: 12px; background: var(--bg-main); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <div style="font-weight: 700; color: var(--primary-navy);">AI Ready with Robotics</div>
            <div style="font-size: 12px; color: var(--accent-blue); margin-top: 2px;">Grade VI, Grade VIII, Grade X</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Python programming, intelligent decision trees, and computer vision.</div>
          </div>
        </div>
      </div>

      <!-- DYNAMIC TEAM MEMBERS (Correction 3 Approved) -->
      <section class="section-spacing">
        <div class="section-header">
          <span class="section-badge">Leadership & Mentors</span>
          <h2 class="section-title">Our Scientific & Academic Team</h2>
          <p class="section-subtitle">Research scientists, innovators, and physicists driving experiential education.</p>
        </div>

        ${team.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">👥</div>
            <div class="empty-state-title">No Team Members Listed</div>
          </div>
        ` : `
          <div class="team-grid">
            ${team.map(m => `
              <div class="team-card">
                <img src="${m.image || '/assets/brochure/img_11.jpg'}" alt="${m.name}" class="team-avatar">
                <h4 class="team-name">${m.name}</h4>
                <div class="team-role">${m.role}</div>
                <p class="team-bio">${m.bio}</p>
              </div>
            `).join('')}
          </div>
        `}
      </section>
    </div>
  `;

  initSchoolsSpotlight('aboutSchoolsSpotlightCarousel', 'aboutSchoolActiveName');
}

// --------------------------------------------------------------------------
// 3. COURSES LISTING VIEW (Screen 4 Reference)
// --------------------------------------------------------------------------
let activeCourseCategory = 'All';
let courseSearchQuery = '';

async function renderCoursesView() {
  const root = document.getElementById('app-root');
  const courses = await fetch('/api/courses').then(r => r.json()).catch(() => []);

  const categories = ['All', 'Robotics', 'AI', 'IoT'];

  function getFilteredCourses() {
    return courses.filter(c => {
      const matchCat = activeCourseCategory === 'All' || c.category.toLowerCase() === activeCourseCategory.toLowerCase();
      const matchSearch = !courseSearchQuery || c.title.toLowerCase().includes(courseSearchQuery.toLowerCase()) || c.description.toLowerCase().includes(courseSearchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }

  function renderList() {
    const listContainer = document.getElementById('courses-cards-container');
    if (!listContainer) return;

    const filtered = getFilteredCourses();
    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-title">No Courses Found</div>
          <div class="empty-state-text">Try adjusting your search terms or category filter.</div>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(renderCourseCard).join('');
  }

  root.innerHTML = `
    <div class="app-container" style="padding-top: 0;">
      ${renderInnerHero({
        kicker: 'SKILL-FIRST PROGRAMS',
        title: 'Our Courses',
        subtitle: "Gain future-ready skills through Edueme's industry-relevant STEM programs.",
        breadcrumbs: [
          { label: 'Home', url: '/' },
          { label: 'Our Courses' }
        ],
        imageUrl: '/assets/hero_robotics.jpg',
        objectPosition: 'center 35%'
      })}

      <!-- SEARCH INPUT -->
      <div class="search-input-wrap" style="margin-top: 4px;">
        <span class="search-icon">🔍</span>
        <input type="text" id="course-search-input" class="search-input" placeholder="Search courses (e.g. Robotics, Python, IoT)..." value="${courseSearchQuery}">
      </div>

      <!-- FILTER PILLS -->
      <div class="filter-pills" id="course-filter-pills">
        ${categories.map(cat => `
          <button class="filter-pill ${cat === activeCourseCategory ? 'active' : ''}" data-cat="${cat}">
            ${cat}
          </button>
        `).join('')}
      </div>

      <!-- CARDS CONTAINER -->
      <div class="cards-grid" id="courses-cards-container"></div>
    </div>
  `;

  renderList();

  // Attach event listeners
  const searchInput = document.getElementById('course-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      courseSearchQuery = e.target.value.trim();
      renderList();
    });
  }

  const pillBtns = document.querySelectorAll('#course-filter-pills .filter-pill');
  pillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCourseCategory = btn.getAttribute('data-cat');
      renderList();
    });
  });
}

// --------------------------------------------------------------------------
// 4. COURSE DETAIL VIEW (Screen 5 Reference)
// --------------------------------------------------------------------------
async function renderCourseDetailView(slug) {
  const root = document.getElementById('app-root');
  const course = await fetch(`/api/courses/${slug}`).then(r => r.json()).catch(() => null);

  if (!course || course.error) {
    render404View('Course Not Found', 'The requested course does not exist or has been removed.');
    return;
  }

  root.innerHTML = `
    <div class="app-container" style="padding-top: 0;">
      ${renderInnerHero({
        kicker: `${(course.category || 'STEM').toUpperCase()} PROGRAM`,
        title: course.title,
        subtitle: course.shortDescription || 'Build . Program . Innovate',
        breadcrumbs: [
          { label: 'Home', url: '/' },
          { label: 'Courses', url: '/courses' },
          { label: course.title }
        ],
        imageUrl: course.image || '/assets/hero_robotics.jpg',
        objectPosition: 'center 35%'
      })}

      <!-- QUICK ACTION STRIP (Metadata & Direct CTA) -->
      <div class="detail-action-bar">
        <div class="detail-pills-row">
          <span class="detail-info-pill">⏱️ ${course.duration || '3 – 6 Months'}</span>
          <span class="detail-info-pill">📊 ${course.level || 'Beginner to Advanced'}</span>
          <span class="detail-info-pill">📍 ${course.mode || 'Offline / Online'}</span>
        </div>

        <a href="/contact?type=course&id=${course.id}" class="detail-primary-cta" onclick="navigate(event, '/contact?type=course&id=${course.id}')">
          <span>Enroll Now</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>

      <div class="detail-card">
        <h3 class="detail-card-title">📖 About This Course</h3>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">${course.description}</p>
      </div>

      <div class="detail-card">
        <h3 class="detail-card-title">🎯 What You'll Learn</h3>
        <ul class="checklist">
          ${(course.highlights || []).map(hl => `
            <li class="checklist-item">
              <span class="check-icon">✔</span>
              <span>${hl}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="/contact?type=course&id=${course.id}" class="submit-btn" style="max-width: 280px; margin: 0 auto;" onclick="navigate(event, '/contact?type=course&id=${course.id}')">
          Enquire for ${course.title} →
        </a>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 5. SERVICES LISTING VIEW (Screen 6 Reference)
// --------------------------------------------------------------------------
async function renderServicesView() {
  const root = document.getElementById('app-root');
  const services = await fetch('/api/services').then(r => r.json()).catch(() => []);

  root.innerHTML = `
    <div class="app-container" style="padding-top: 0;">
      ${renderInnerHero({
        kicker: 'INSTITUTIONAL & STUDENT SOLUTIONS',
        title: 'Workshops & Programs',
        subtitle: 'Hands-on technology workshops, Prayogshala tech labs, and immersion tours for schools and colleges.',
        breadcrumbs: [
          { label: 'Home', url: '/' },
          { label: 'Services & Programs' }
        ],
        imageUrl: '/assets/services_hero.jpg',
        objectPosition: 'center 35%'
      })}

      ${services.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">🔬</div>
          <div class="empty-state-title">No Services Available</div>
        </div>
      ` : `
        <div class="cards-grid">
          ${services.map(renderServiceCard).join('')}
        </div>
      `}
    </div>
  `;
}

// --------------------------------------------------------------------------
// 6. SERVICE DETAIL VIEW (Screen 7 Reference)
// --------------------------------------------------------------------------
async function renderServiceDetailView(slug) {
  const root = document.getElementById('app-root');
  const service = await fetch(`/api/services/${slug}`).then(r => r.json()).catch(() => null);

  if (!service || service.error) {
    render404View('Program Not Found', 'The requested service does not exist.');
    return;
  }

  root.innerHTML = `
    <div class="app-container" style="padding-top: 0;">
      ${renderInnerHero({
        kicker: 'PROGRAM OFFERING',
        title: service.title,
        subtitle: service.shortDescription || `Comprehensive STEM, robotics and experiential curriculum for institutions.`,
        breadcrumbs: [
          { label: 'Home', url: '/' },
          { label: 'Services', url: '/services' },
          { label: service.title }
        ],
        imageUrl: service.image || '/assets/services_hero.jpg',
        objectPosition: 'center 35%'
      })}

      <!-- QUICK ACTION STRIP -->
      <div class="detail-action-bar">
        <div class="detail-pills-row">
          <span class="detail-info-pill">⏱️ Typical Duration: ${service.duration || 'Flexible'}</span>
          ${service.subServices && service.subServices.length > 0 ? `<span class="detail-info-pill">📦 ${service.subServices.length} Specialized Sub-Modules</span>` : ''}
        </div>

        <a href="/contact?type=service&id=${service.id}" class="detail-primary-cta" onclick="navigate(event, '/contact?type=service&id=${service.id}')">
          <span>Enquire Now</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>

      <div class="detail-card">
        <h3 class="detail-card-title">📖 Program Overview</h3>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">${service.description}</p>
      </div>

      <!-- KEY BENEFITS / WHAT A SCHOOL OR STUDENT WILL RECEIVE -->
      <div class="detail-card">
        <h3 class="detail-card-title">🎁 What a School / Student Will Receive from Edueme</h3>
        <ul class="checklist">
          ${(service.benefits || []).map(b => `
            <li class="checklist-item">
              <span class="check-icon">✔</span>
              <span>${b}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- DEDICATED SUB-SERVICES LIST (Correction 1 Required) -->
      ${service.subServices && service.subServices.length > 0 ? `
        <div class="section-header" style="margin-top: 32px;">
          <span class="section-badge">Modular Offerings</span>
          <h2 class="section-title">Specialized Sub-Services (${service.subServices.length})</h2>
          <p class="section-subtitle">Click into any sub-service to inspect syllabus, modules, and dedicated enquiry.</p>
        </div>

        <div class="cards-grid">
          ${service.subServices.map(sub => `
            <div class="item-card">
              <div class="card-img-wrap">
                <img src="${sub.image || service.image || '/assets/brochure/img_8.jpg'}" alt="${sub.title}" class="card-img" loading="lazy">
              </div>
              <div class="card-body">
                <h3 class="card-title">${sub.title}</h3>
                <p class="card-desc">${sub.description}</p>
                <a href="/services/${service.slug}/${sub.slug}" class="card-btn" onclick="navigate(event, '/services/${service.slug}/${sub.slug}')">
                  <span>Sub-Service Details &rarr;</span>
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

// --------------------------------------------------------------------------
// 7. DEDICATED SUB-SERVICE DETAIL VIEW (Correction 1 Approved)
// Route: /services/:serviceSlug/:subServiceSlug
// --------------------------------------------------------------------------
async function renderSubServiceDetailView(serviceSlug, subServiceSlug) {
  const root = document.getElementById('app-root');
  const res = await fetch(`/api/sub-services/${serviceSlug}/${subServiceSlug}`).then(r => r.json()).catch(() => null);

  if (!res || res.error || !res.subService) {
    render404View('Sub-Service Not Found', 'The requested sub-service does not exist.');
    return;
  }

  const { subService, parentService } = res;

  root.innerHTML = `
    <div class="app-container" style="padding-top: 0;">
      ${renderInnerHero({
        kicker: `${(parentService.title || 'Service').toUpperCase()} SUB-MODULE`,
        title: subService.title,
        subtitle: subService.description,
        breadcrumbs: [
          { label: 'Home', url: '/' },
          { label: 'Services', url: '/services' },
          { label: parentService.title, url: `/services/${parentService.slug}` },
          { label: subService.title }
        ],
        imageUrl: subService.image || parentService.image || '/assets/services_hero.jpg',
        objectPosition: 'center 35%'
      })}

      <!-- QUICK ACTION STRIP -->
      <div class="detail-action-bar">
        <div class="detail-pills-row">
          <span class="detail-info-pill">🔬 ${parentService.title}</span>
          ${subService.modules && subService.modules.length > 0 ? `<span class="detail-info-pill">🛠️ ${subService.modules.length} Included Activities</span>` : ''}
        </div>

        <a href="/contact?type=sub-service&id=${subService.id}" class="detail-primary-cta" onclick="navigate(event, '/contact?type=sub-service&id=${subService.id}')">
          <span>Enquire for ${subService.title}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>

      <div class="detail-card">
        <h3 class="detail-card-title">📖 In-Depth Overview</h3>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">${subService.detailedOverview || subService.description}</p>
      </div>

      ${subService.modules && subService.modules.length > 0 ? `
        <div class="detail-card">
          <h3 class="detail-card-title">🛠️ Included Modules & Practical Activities</h3>
          <ul class="checklist">
            ${subService.modules.map(mod => `
              <li class="checklist-item">
                <span class="check-icon">✔</span>
                <span>${mod}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <div style="text-align: center; margin-top: 24px;">
        <a href="/contact?type=sub-service&id=${subService.id}" class="submit-btn" style="max-width: 320px; margin: 0 auto;" onclick="navigate(event, '/contact?type=sub-service&id=${subService.id}')">
          Submit Enquiry for This Sub-Service →
        </a>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 8. GALLERY VIEW (Screen 10 Reference & Dynamic Gallery)
// --------------------------------------------------------------------------
let activeGalleryCategory = 'All';

async function renderGalleryView() {
  const root = document.getElementById('app-root');
  const items = await fetch('/api/gallery').then(r => r.json()).catch(() => []);

  const categories = ['All', 'Workshops', 'Competitions', 'Tech Tours', 'Tech Labs'];

  function renderGrid() {
    const grid = document.getElementById('gallery-grid-container');
    if (!grid) return;

    const filtered = activeGalleryCategory === 'All'
      ? items
      : items.filter(i => i.category.toLowerCase() === activeGalleryCategory.toLowerCase());

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">📸</div>
          <div class="empty-state-title">No Photos Found</div>
          <div class="empty-state-text">No moments found under this category.</div>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(item => `
      <div class="gallery-card" onclick="openLightbox('${item.imageUrl}', '${item.title}')">
        <img src="${item.imageUrl}" alt="${item.title}" loading="lazy">
        <div class="gallery-caption">${item.title}</div>
      </div>
    `).join('');
  }

  root.innerHTML = `
    <div class="app-container" style="padding-top: 0;">
      ${renderInnerHero({
        kicker: 'PHOTO SHOWCASE',
        title: 'Moments of Learning',
        subtitle: 'Hands-on experiments, robotics championships, and school tech labs in action.',
        breadcrumbs: [
          { label: 'Home', url: '/' },
          { label: 'Gallery' }
        ],
        imageUrl: '/assets/gallery_hero.jpg',
        objectPosition: 'center 40%'
      })}

      <div class="filter-pills" id="gallery-filter-pills" style="margin-top: 4px;">
        ${categories.map(cat => `
          <button class="filter-pill ${cat === activeGalleryCategory ? 'active' : ''}" data-cat="${cat}">
            ${cat}
          </button>
        `).join('')}
      </div>

      <div class="gallery-grid" id="gallery-grid-container"></div>
    </div>
  `;

  renderGrid();

  const pillBtns = document.querySelectorAll('#gallery-filter-pills .filter-pill');
  pillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeGalleryCategory = btn.getAttribute('data-cat');
      renderGrid();
    });
  });
}

// --------------------------------------------------------------------------
// 9. CONTACT & UNIFIED ENQUIRY VIEW (Screen 8 & 9 Reference)
// --------------------------------------------------------------------------
async function renderContactView() {
  const root = document.getElementById('app-root');
  const urlParams = new URLSearchParams(window.location.search);
  const paramType = urlParams.get('type') || 'course';
  const paramId = urlParams.get('id');

  const [courses, services, settings] = await Promise.all([
    fetch('/api/courses').then(r => r.json()).catch(() => []),
    fetch('/api/services').then(r => r.json()).catch(() => []),
    fetchSettings()
  ]);

  let currentTab = (paramType === 'service' || paramType === 'sub-service') ? 'service' : 'course';

  root.innerHTML = `
    <div class="app-container" style="padding-top: 0;">
      ${renderInnerHero({
        kicker: 'GET IN TOUCH',
        title: 'Contact & Enquiry',
        subtitle: 'Visit our Madhapur Innovation Lab or speak with our academic counselors.',
        breadcrumbs: [
          { label: 'Home', url: '/' },
          { label: 'Contact Us' }
        ],
        imageUrl: '/assets/contact_hero.jpg',
        objectPosition: 'center 40%'
      })}

      <div class="contact-grid" style="margin-top: 4px;">
        <!-- UNIFIED ENQUIRY CARD (Screen 8) -->
        <div class="enquiry-card">
          <h3 style="font-family: var(--font-heading); font-size: 19px; font-weight: 800; color: var(--primary-navy); margin-bottom: 6px;">Enquiry Form</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Fill in your details and we'll get back to you shortly.</p>

          <!-- TABS: Course Enquiry | Service Enquiry -->
          <div class="enquiry-tabs">
            <button class="enquiry-tab-btn ${currentTab === 'course' ? 'active' : ''}" id="tab-course-btn" type="button">Course Enquiry</button>
            <button class="enquiry-tab-btn ${currentTab === 'service' ? 'active' : ''}" id="tab-service-btn" type="button">Service / Program Enquiry</button>
          </div>

          <form id="enquiry-form">
            <!-- DYNAMIC COURSE / SERVICE SELECTOR -->
            <div class="form-group" id="course-selector-group" style="${currentTab === 'course' ? '' : 'display: none;'}">
              <label class="form-label" for="select-course">Select Course <span class="req">*</span></label>
              <select class="form-control" id="select-course">
                <option value="">-- Choose Course --</option>
                ${courses.map(c => `
                  <option value="${c.id}" ${paramId === c.id || paramId === c.slug ? 'selected' : ''}>${c.title} (${c.duration})</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group" id="service-selector-group" style="${currentTab === 'service' ? '' : 'display: none;'}">
              <label class="form-label" for="select-service">Select Program or Service <span class="req">*</span></label>
              <select class="form-control" id="select-service">
                <option value="">-- Choose Program / Service --</option>
                ${services.map(s => `
                  <option value="${s.id}" ${paramId === s.id || paramId === s.slug ? 'selected' : ''}>${s.title} (${s.duration})</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="full-name">Full Name <span class="req">*</span></label>
              <input type="text" id="full-name" class="form-control" placeholder="Enter your full name" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="phone-number">Phone Number <span class="req">*</span></label>
              <input type="tel" id="phone-number" class="form-control" placeholder="e.g. +91 98765 43210" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="email-address">Email Address <span class="req">*</span></label>
              <input type="email" id="email-address" class="form-control" placeholder="Enter your email address" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="message-body">Message / Remarks</label>
              <textarea id="message-body" class="form-control" placeholder="I am interested in learning more about..."></textarea>
            </div>

            <button type="submit" id="enquiry-submit-btn" class="submit-btn">
              <span>Submit Enquiry</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>

            <div style="font-size: 11px; color: var(--text-light); text-align: center; margin-top: 10px;">
              🔒 Your details are safe with us. We do not spam.
            </div>
          </form>
        </div>

        <!-- CONTACT DETAILS & LOCATION (Screen 9) -->
        <div class="contact-info-card">
          <h3 style="font-family: var(--font-heading); font-size: 19px; font-weight: 800; color: var(--primary-navy); margin-bottom: 6px;">Contact Information</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">We would love to hear from you. Visit our lab or reach out online.</p>

          <div class="contact-info-item">
            <div class="contact-item-icon">📍</div>
            <div>
              <div class="contact-item-label">Our Office & Innovation Lab</div>
              <div class="contact-item-val">${settings?.address || '1-98/11/62, Arunodaya Colony, Sri Sai Nagar, Madhapur, Hyderabad, Telangana - 500081'}</div>
            </div>
          </div>

          <div class="contact-info-item">
            <div class="contact-item-icon">📞</div>
            <div>
              <div class="contact-item-label">Call Us Directly</div>
              <div class="contact-item-val">
                <a href="tel:+919059508050">${settings?.phone || '+91 90595 08050'}</a>
              </div>
            </div>
          </div>

          <div class="contact-info-item">
            <div class="contact-item-icon">💬</div>
            <div>
              <div class="contact-item-label">WhatsApp Official</div>
              <div class="contact-item-val">
                <a href="https://wa.me/919059508050" target="_blank">${settings?.whatsappNumber || '+91 9059508050'}</a>
              </div>
            </div>
          </div>

          <div class="contact-info-item">
            <div class="contact-item-icon">✉️</div>
            <div>
              <div class="contact-item-label">Email Us</div>
              <div class="contact-item-val">
                <a href="mailto:${settings?.alertEmail || 'Info@eduemeresearchlabs.com'}">${settings?.alertEmail || 'Info@eduemeresearchlabs.com'}</a>
              </div>
            </div>
          </div>

          <div class="contact-info-item">
            <div class="contact-item-icon">⏰</div>
            <div>
              <div class="contact-item-label">Working Hours</div>
              <div class="contact-item-val">${settings?.workingHours || 'Mon - Sat: 9:00 AM - 6:00 PM'}</div>
            </div>
          </div>

          <!-- QUICK ACTION BUTTONS (Call / WhatsApp / Email) -->
          <div class="action-buttons-row">
            <a href="tel:+919059508050" class="action-btn action-btn-call">📞 Call</a>
            <a href="https://wa.me/919059508050" target="_blank" class="action-btn action-btn-wa">💬 WhatsApp</a>
            <a href="mailto:Info@eduemeresearchlabs.com" class="action-btn action-btn-email">✉️ Email</a>
          </div>

          <!-- EMBEDDED LOCATION MAP -->
          <div style="margin-top: 18px; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border-color); height: 180px;">
            <iframe 
              title="Edueme Research Labs Location"
              src="https://maps.google.com/maps?q=Madhapur,%20Hyderabad,%20Telangana&t=&z=13&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style="border:0;" 
              allowfullscreen="" 
              loading="lazy">
            </iframe>
          </div>
        </div>
      </div>
    </div>
  `;

  // Setup Tab Toggle
  const tabCourseBtn = document.getElementById('tab-course-btn');
  const tabServiceBtn = document.getElementById('tab-service-btn');
  const courseGroup = document.getElementById('course-selector-group');
  const serviceGroup = document.getElementById('service-selector-group');

  if (tabCourseBtn && tabServiceBtn) {
    tabCourseBtn.addEventListener('click', () => {
      tabCourseBtn.classList.add('active');
      tabServiceBtn.classList.remove('active');
      courseGroup.style.display = 'block';
      serviceGroup.style.display = 'none';
      currentTab = 'course';
    });

    tabServiceBtn.addEventListener('click', () => {
      tabServiceBtn.classList.add('active');
      tabCourseBtn.classList.remove('active');
      courseGroup.style.display = 'none';
      serviceGroup.style.display = 'block';
      currentTab = 'service';
    });
  }

  // Handle Enquiry Form Submission
  const form = document.getElementById('enquiry-form');
  const submitBtn = document.getElementById('enquiry-submit-btn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fullName = document.getElementById('full-name').value.trim();
      const phone = document.getElementById('phone-number').value.trim();
      const email = document.getElementById('email-address').value.trim();
      const message = document.getElementById('message-body').value.trim();
      const courseId = currentTab === 'course' ? document.getElementById('select-course').value : null;
      const serviceId = currentTab === 'service' ? document.getElementById('select-service').value : null;

      // Validate
      if (!fullName || fullName.length < 2) {
        alert('Please enter your full name.');
        return;
      }

      const digits = phone.replace(/[^0-9]/g, '');
      if (digits.length < 10) {
        alert('Please enter a valid 10-digit phone number.');
        return;
      }

      if (!email.includes('@') || !email.includes('.')) {
        alert('Please enter a valid email address.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Submitting...</span>`;

      try {
        const payload = {
          fullName,
          phone,
          email,
          message,
          sourceType: currentTab,
          courseId,
          serviceId,
          subServiceId: paramType === 'sub-service' ? paramId : null
        };

        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok && data.success) {
          form.innerHTML = `
            <div style="text-align: center; padding: 32px 16px;">
              <div style="width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; color: #166534; font-size: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">✓</div>
              <h3 style="font-family: var(--font-heading); font-size: 20px; font-weight: 800; color: var(--primary-navy); margin-bottom: 8px;">Enquiry Received Successfully!</h3>
              <p style="font-size: 14px; color: var(--text-muted); line-height: 1.5; margin-bottom: 20px;">
                Thank you, <strong>${fullName}</strong>. Our academic team at Edueme Research Labs has received your submission and will contact you via WhatsApp / Phone shortly.
              </p>
              <div style="font-size: 12px; color: #0284c7; background: #e0f2fe; padding: 10px; border-radius: 6px; margin-bottom: 20px;">
                ⚡ Automatic WhatsApp & Email alerts dispatched to our administrative team.
              </div>
              <button class="hero-primary-btn" onclick="navigate(event, '/courses')">Browse More Courses</button>
            </div>
          `;
          showToast('✓ Lead successfully submitted & alerts dispatched!');
        } else {
          alert(data.error || 'Failed to submit enquiry. Please try again.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Submit Enquiry</span>`;
        }
      } catch (err) {
        console.error(err);
        alert('A network error occurred. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Submit Enquiry</span>`;
      }
    });
  }
}

// --------------------------------------------------------------------------
// SCHOOLS SPOTLIGHT CAROUSEL ANIMATION (Image 2 + Image 3 Reference)
// --------------------------------------------------------------------------
let schoolsSpotlightTimer = null;
function initSchoolsSpotlight(carouselId = 'schoolsSpotlightCarousel', labelId = 'schoolActiveName') {
  if (schoolsSpotlightTimer) clearInterval(schoolsSpotlightTimer);
  const container = document.getElementById(carouselId);
  const label = document.getElementById(labelId);
  if (!container) return;
  const items = container.querySelectorAll('.school-spotlight-item');
  if (!items || items.length === 0) return;

  let currentIndex = 0;

  function setSpotlight(idx) {
    currentIndex = (idx + items.length) % items.length;
    items.forEach((it, i) => {
      if (i === currentIndex) {
        it.classList.add('active');
      } else {
        it.classList.remove('active');
      }
    });
    const activeItem = items[currentIndex];
    const name = activeItem ? activeItem.getAttribute('data-name') : '';
    if (label && name) {
      label.innerHTML = `<span class="school-active-badge">✓ ${name}</span>`;
    }
  }

  items.forEach((it, idx) => {
    it.addEventListener('click', () => {
      setSpotlight(idx);
    });
  });

  // Automatically cycle spotlight smoothly
  schoolsSpotlightTimer = setInterval(() => {
    setSpotlight(currentIndex + 1);
  }, 2600);
}

// --------------------------------------------------------------------------
// 404 VIEW
// --------------------------------------------------------------------------
function render404View(title = 'Page Not Found', desc = 'The page you are looking for does not exist.') {
  const root = document.getElementById('app-root');
  root.innerHTML = `
    <div class="app-container section-spacing" style="text-align: center; padding: 60px 20px;">
      <div style="font-size: 50px; margin-bottom: 12px;">🧭</div>
      <h1 style="font-family: var(--font-heading); font-size: 28px; font-weight: 800; color: var(--primary-navy); margin-bottom: 8px;">${title}</h1>
      <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 24px;">${desc}</p>
      <a href="/" class="hero-primary-btn" onclick="navigate(event, '/')">Return to Home</a>
    </div>
  `;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', handleRouting);
