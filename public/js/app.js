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
  } else if (path.startsWith('/about')) {
    const b = document.getElementById('bnav-about');
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
  // Route: Gallery (Redirects to About Us Photos Showcase)
  else if (pathname === '/gallery') {
    window.history.replaceState(null, '', '/about');
    await renderAboutView();
  }
  // Route: Contact & Unified Enquiry
  else if (pathname === '/contact') {
    await renderContactView();
  }
  // Fallback 404
  else {
    render404View();
  }

  // Initialize cohesive motion system for the rendered view
  requestAnimationFrame(() => {
    initGlobalMotion();
  });
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

      <!-- POPULAR COURSES SECTION (Style matching reference: pencil-art robot, centered heading, 2-line quote) -->
      <section class="home-courses-section">
        <div class="section-center-group">
          <!-- Pencil-Art Robot Emerging from Behind Content with Waving Hand Animation -->
          <div class="courses-pencil-robot-container">
            <div class="courses-pencil-robot-art">
              <img src="/assets/robot_pencil_body.png" alt="Edueme Mascot Robot" class="pencil-robot-body" loading="lazy">
              <img src="/assets/robot_pencil_hand.png" alt="Edueme Mascot Robot Waving Hand" class="pencil-robot-hand" loading="lazy">
            </div>
          </div>

          <h2 class="section-title">Popular Courses</h2>
          <p class="section-subtitle">Hands-on robotics and STEM programs for learners.</p>
          <p class="section-quote-text">
            &ldquo;Unlock your child&rsquo;s inner innovator with our empowering courses! Developing the skills and mindset to create something amazing.&rdquo;
          </p>
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
          <div style="text-align: center; margin-top: 20px;">
            <a href="/courses" class="header-cta-btn" style="padding: 10px 24px; font-size: 13.5px; display: inline-flex;" onclick="navigate(event, '/courses')">
              <span>View All Courses &rarr;</span>
            </a>
          </div>
        `}
      </section>

      <!-- 2x2 STATISTIC CARDS (Free-standing, unboxed, counting animation) -->
      <section class="edueme-stats-section">
        <div class="edueme-stats-grid">
          <!-- Card 1: 75+ Students Enrolled -->
          <div class="edueme-stat-card">
            <div class="edueme-stat-icon-wrap">
              <svg class="edueme-stat-icon" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Hair (Teal accent) -->
                <path d="M19 19c0-6 4-9 8-9s8 3 8 9c0 1-2 2-3 2-2 0-3-2-5-2s-3 2-5 2c-1 0-3-1-3-2z" fill="#00d4aa" stroke="#1e293b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- Face -->
                <path d="M21 21v3c0 3.3 2.7 6 6 6s6-2.7 6-6v-3" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round"/>
                <!-- Ears -->
                <path d="M21 22c-1 0-2 1-2 2s1 2 2 2M33 22c1 0 2 1 2 2s-1 2-2 2" stroke="#1e293b" stroke-width="2" stroke-linecap="round"/>
                <!-- Collar & Tie (Blue accent) -->
                <path d="M24 30l3 5 3-5" fill="#0284c7" stroke="#1e293b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M27 35v5l-1.5 2 1.5 1 1.5-1-1.5-2" fill="#0284c7" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- Shoulders & Coat -->
                <path d="M18 42c-2-2-5 0-7 2-2 2-2 4-2 4h36s0-2-2-4c-2-2-5-4-7-2l-7-8-7 8z" fill="#ffffff" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- Lapel -->
                <path d="M19 36l5-6M35 36l-5-6" stroke="#1e293b" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="edueme-stat-data">
              <span class="edueme-stat-num" data-target="75" data-suffix="+">75+</span>
              <span class="edueme-stat-label">Students<br>Enrolled</span>
            </div>
          </div>

          <!-- Card 2: 100+ Teachers -->
          <div class="edueme-stat-card">
            <div class="edueme-stat-icon-wrap">
              <svg class="edueme-stat-icon" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Hair & Head -->
                <path d="M23 18c-3 0-5 3-5 7 0 2 1 4 1 6M31 18c3 0 5 3 5 7 0 2-1 4-1 6" stroke="#1e293b" stroke-width="2" stroke-linecap="round"/>
                <circle cx="27" cy="20" r="5" stroke="#1e293b" stroke-width="2.2" fill="#ffffff"/>
                <!-- Face Details -->
                <circle cx="25.5" cy="20" r="0.8" fill="#e11d48"/>
                <circle cx="28.5" cy="20" r="0.8" fill="#e11d48"/>
                <path d="M25.5 22.5c.8.6 2.2.6 3 0" stroke="#1e293b" stroke-width="1.5" stroke-linecap="round"/>
                <!-- Body / Dress -->
                <path d="M24 25l-4 6v13h14V31l-4-6" fill="#ffffff" stroke="#1e293b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- Left Hand Gesturing -->
                <path d="M20 31l-6-2c-1 0-1.5-1-1.5-2s.5-2 1.5-1l4 3" stroke="#1e293b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- Right Arm Holding Teal Book -->
                <path d="M30 31l3 4" stroke="#1e293b" stroke-width="2" stroke-linecap="round"/>
                <!-- Open Book in Teal -->
                <path d="M33 30l4-2 5 2v10l-5-2-4 2V30z" fill="#00d4aa" stroke="#1e293b" stroke-width="2" stroke-linejoin="round"/>
                <line x1="37" y1="28" x2="37" y2="38" stroke="#1e293b" stroke-width="1.8"/>
              </svg>
            </div>
            <div class="edueme-stat-data">
              <span class="edueme-stat-num" data-target="100" data-suffix="+">100+</span>
              <span class="edueme-stat-label">Teachers</span>
            </div>
          </div>

          <!-- Card 3: 50+ Schools Registered -->
          <div class="edueme-stat-card">
            <div class="edueme-stat-icon-wrap">
              <svg class="edueme-stat-icon" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Ground Line -->
                <line x1="8" y1="44" x2="46" y2="44" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round"/>
                <!-- Main Building -->
                <path d="M12 44V20l8-4 8 4v24H12z" fill="#ffffff" stroke="#1e293b" stroke-width="2.2" stroke-linejoin="round"/>
                <!-- Roof Detail -->
                <circle cx="20" cy="18" r="1.5" fill="#00d4aa"/>
                <!-- Windows Matrix on Main Building -->
                <rect x="15" y="24" width="3" height="3" rx="0.5" fill="#1e293b"/>
                <rect x="22" y="24" width="3" height="3" rx="0.5" fill="#1e293b"/>
                <rect x="15" y="30" width="3" height="3" rx="0.5" fill="#1e293b"/>
                <rect x="22" y="30" width="3" height="3" rx="0.5" fill="#1e293b"/>
                <rect x="15" y="36" width="3" height="3" rx="0.5" fill="#1e293b"/>
                <rect x="22" y="36" width="3" height="3" rx="0.5" fill="#1e293b"/>
                <!-- Main Door in Teal/Blue -->
                <rect x="18" y="40" width="4" height="4" fill="#0284c7" stroke="#1e293b" stroke-width="1.5"/>
                <!-- Side Annex Building with Teal Facade -->
                <path d="M28 44V26h14v18H28z" fill="#00d4aa" stroke="#1e293b" stroke-width="2.2" stroke-linejoin="round"/>
                <rect x="31" y="29" width="3" height="3" rx="0.5" fill="#ffffff" stroke="#1e293b" stroke-width="1.2"/>
                <rect x="36" y="29" width="3" height="3" rx="0.5" fill="#ffffff" stroke="#1e293b" stroke-width="1.2"/>
                <rect x="31" y="35" width="3" height="3" rx="0.5" fill="#ffffff" stroke="#1e293b" stroke-width="1.2"/>
                <rect x="36" y="35" width="3" height="3" rx="0.5" fill="#ffffff" stroke="#1e293b" stroke-width="1.2"/>
              </svg>
            </div>
            <div class="edueme-stat-data">
              <span class="edueme-stat-num" data-target="50" data-suffix="+">50+</span>
              <span class="edueme-stat-label">Schools<br>Registered</span>
            </div>
          </div>

          <!-- Card 4: 30+ Courses -->
          <div class="edueme-stat-card">
            <div class="edueme-stat-icon-wrap">
              <svg class="edueme-stat-icon" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Laptop Screen Frame -->
                <rect x="11" y="22" width="32" height="18" rx="3" fill="#ffffff" stroke="#1e293b" stroke-width="2.2"/>
                <!-- Laptop Keyboard Base -->
                <path d="M7 40h40l-3 4H10l-3-4z" fill="#ffffff" stroke="#1e293b" stroke-width="2.2" stroke-linejoin="round"/>
                <line x1="23" y1="41.5" x2="31" y2="41.5" stroke="#1e293b" stroke-width="1.5" stroke-linecap="round"/>
                <!-- Open Book in Teal emerging from Laptop Screen -->
                <path d="M27 16c-3-2-7-2-10 0v14c3-1.5 7-1.5 10 0 3-1.5 7-1.5 10 0V16c-3-2-7-2-10 0z" fill="#00d4aa" stroke="#1e293b" stroke-width="2.2" stroke-linejoin="round"/>
                <line x1="27" y1="16" x2="27" y2="30" stroke="#1e293b" stroke-width="2"/>
                <!-- Book Page Lines -->
                <path d="M20 20c2-.5 4-.5 5 0M20 24c2-.5 4-.5 5 0M34 20c-2-.5-4-.5-5 0M34 24c-2-.5-4-.5-5 0" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="edueme-stat-data">
              <span class="edueme-stat-num" data-target="30" data-suffix="+">30+</span>
              <span class="edueme-stat-label">Courses</span>
            </div>
          </div>
        </div>
      </section>

      <!-- FLOATING LAYERED TESTIMONIALS (Soft Light Blue Gradient + Mascot Animation) -->
      <section class="testimonials-mobile-section" id="testimonialsSection">
        <!-- Floating Mascot Header Row (Cute floating mascot animation) -->
        <div class="testimonials-mascot-row">
          <img src="/assets/robot_nurtured.png" alt="Edueme Mascot" class="testimonials-floating-robot" loading="lazy">
        </div>

        <!-- Shorter, Compact Center-Focused Coverflow Stacked Cards -->
        <div class="testimonials-coverflow-stage" id="testimonialsStage">
          <div class="testimonial-card-item card-active" data-index="0">
            <div class="testimonial-card-header">
              <span class="testimonial-stars">★★★★★</span>
              <span class="testimonial-quote-icon">&ldquo;</span>
            </div>
            <p class="testimonial-quote-text">&ldquo;Edueme’s robotics training is exceptional. Instructors make complex electronics simple with actual robots.&rdquo;</p>
            <div class="testimonial-author-row">
              <div class="testimonial-author-avatar">👨‍🏫</div>
              <div class="testimonial-author-info">
                <h4>Jagadeesh</h4>
                <p>Mount Carmel Global School</p>
              </div>
            </div>
          </div>

          <div class="testimonial-card-item card-next" data-index="1">
            <div class="testimonial-card-header">
              <span class="testimonial-stars">★★★★★</span>
              <span class="testimonial-quote-icon">&ldquo;</span>
            </div>
            <p class="testimonial-quote-text">&ldquo;Outstanding coaching and practical kits. Friendly mentors inspire real hardware innovation.&rdquo;</p>
            <div class="testimonial-author-row">
              <div class="testimonial-author-avatar">👨‍🏫</div>
              <div class="testimonial-author-info">
                <h4>Vamshi Mohan</h4>
                <p>Samskar Global School</p>
              </div>
            </div>
          </div>

          <div class="testimonial-card-item card-prev" data-index="2">
            <div class="testimonial-card-header">
              <span class="testimonial-stars">★★★★★</span>
              <span class="testimonial-quote-icon">&ldquo;</span>
            </div>
            <p class="testimonial-quote-text">&ldquo;The Prayogshala lab setup transformed science learning from 3rd grade onwards.&rdquo;</p>
            <div class="testimonial-author-row">
              <div class="testimonial-author-avatar">👩‍🏫</div>
              <div class="testimonial-author-info">
                <h4>M. Divya</h4>
                <p>Arka International School</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Indicator Dots -->
        <div class="testimonials-dots-wrap" id="testimonialsDots">
          <span class="testimonials-dot active" data-index="0"></span>
          <span class="testimonials-dot" data-index="1"></span>
          <span class="testimonials-dot" data-index="2"></span>
        </div>
      </section>

      <!-- PROGRAMS & SERVICES SECTION (Style matching reference: centered heading, subheading, quote, light tint) -->
      <section class="home-services-section">
        <div class="section-center-group">
          <h2 class="section-title">Programs & Services</h2>
          <p class="section-subtitle">Turnkey labs, teacher training, and university tech tours.</p>
          <p class="section-quote-text">
            &ldquo;Empowering schools and colleges with end-to-end innovation infrastructure, from dedicated Prayogshala tech labs to certified STEM educator mentorship.&rdquo;
            <span class="section-quote-author">— [Edueme Research Labs]</span>
          </p>
        </div>

        <div class="cards-grid">
          ${featuredServices.map(renderServiceCard).join('')}
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <a href="/services" class="header-cta-btn" style="padding: 10px 24px; font-size: 13.5px; display: inline-flex;" onclick="navigate(event, '/services')">
            <span>Explore All Programs &rarr;</span>
          </a>
        </div>
      </section>

      <!-- NURTURED SKILLS (Exact Reference Image 1 Match: Lavender BG, Robot Illustration & Medium White Card) -->
      <section class="nurtured-skills-reference-section">
        <!-- Decorative organic wave SVG in bottom left -->
        <svg class="nurtured-decor-wave" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-30 220C20 180 50 140 10 90C-10 65 30 30 80 50C130 70 170 30 190 -20L-30 -20Z" fill="#ded4fc" opacity="0.45"/>
        </svg>

        <!-- Header Row: Title & Subtitle on left, Robot on right -->
        <div class="nurtured-header-row">
          <div class="nurtured-header-text">
            <span class="nurtured-kicker">Nurtured Skills</span>
            <div class="nurtured-kicker-bar"></div>
            <p class="nurtured-subtitle">Real life competencies students gain through experiential robotics.</p>
          </div>

          <!-- Robot Character with Sparks -->
          <div class="nurtured-robot-wrap">
            <!-- Sparks above robot head -->
            <svg class="nurtured-sparks-robot" viewBox="0 0 32 32" fill="none">
              <line x1="8" y1="24" x2="3" y2="12" stroke="#8b7bc9" stroke-width="2.8" stroke-linecap="round"/>
              <line x1="22" y1="24" x2="22" y2="8" stroke="#8b7bc9" stroke-width="2.8" stroke-linecap="round"/>
            </svg>
            <img src="/assets/robot_nurtured.png" alt="Edueme Robot" class="nurtured-robot-img" loading="lazy">
          </div>
        </div>

        <!-- Single Medium-Sized White Rounded Card -->
        <div class="nurtured-white-card" id="nurturedCard">
          <div class="nurtured-card-top">
            <div class="nurtured-step-counter">
              <span class="nurtured-step-current" id="nurturedStepNum">01</span>
              <span class="nurtured-step-total">/ 04</span>
            </div>
            <!-- Spark accents on top right of white card -->
            <div class="nurtured-card-sparks">
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                <line x1="8" y1="8" x2="3" y2="2" stroke="#a594e0" stroke-width="2.8" stroke-linecap="round"/>
                <line x1="16" y1="12" x2="25" y2="6" stroke="#a594e0" stroke-width="2.8" stroke-linecap="round"/>
                <line x1="20" y1="20" x2="26" y2="22" stroke="#a594e0" stroke-width="2.8" stroke-linecap="round"/>
              </svg>
            </div>
          </div>

          <!-- Skill Icon Pill -->
          <div class="nurtured-icon-box" id="nurturedIconBox">
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="16" y1="3" x2="16" y2="6" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="6" y1="7" x2="8.5" y2="9.5" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="26" y1="7" x2="23.5" y2="9.5" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="2" y1="17" x2="5" y2="17" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="27" y1="17" x2="30" y2="17" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M11 17c0-2.8 2.2-5 5-5s5 2.2 5 5c0 2-1 3.5-2 4.5v1.5h-6V21.5C12 20.5 11 19 11 17z" fill="#f59e0b"/>
              <path d="M14 26h4" stroke="#d97706" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>

          <!-- Skill Title & Description -->
          <h3 class="nurtured-card-title" id="nurturedCardTitle">Build Confidence</h3>
          <p class="nurtured-card-desc" id="nurturedCardDesc">Children learn to bring their ideas to light, realize their power to invent, and believe in themselves.</p>

          <!-- Card Footer Controls -->
          <div class="nurtured-card-footer">
            <div class="nurtured-dots" id="nurturedDots">
              <span class="nurtured-dot active" data-index="0" aria-label="Skill 1"></span>
              <span class="nurtured-dot" data-index="1" aria-label="Skill 2"></span>
              <span class="nurtured-dot" data-index="2" aria-label="Skill 3"></span>
              <span class="nurtured-dot" data-index="3" aria-label="Skill 4"></span>
            </div>
            <button class="nurtured-next-btn" id="nurturedNextBtn" aria-label="Next Skill">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e1065" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
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

  initStatsCounter();
  initNurturedSkills();
  initFloatingTestimonials();
}

// --------------------------------------------------------------------------
// 2. ABOUT US VIEW (Screen 3 & Real Brochure Data)
// --------------------------------------------------------------------------
async function renderAboutView() {
  const root = document.getElementById('app-root');
  const [settings, team, gallery] = await Promise.all([
    fetchSettings(),
    fetch('/api/team').then(r => r.json()).catch(() => []),
    fetch('/api/gallery').then(r => r.json()).catch(() => [])
  ]);

  const displayPhotos = (gallery && gallery.length > 0) ? gallery.slice(0, 6) : [
    { title: 'Autonomous Mobile Robot Assembly', imageUrl: '/assets/hero_robotics.jpg' },
    { title: 'Prayogshala Sensor Workbench', imageUrl: '/assets/srv_prayogshala.jpg' },
    { title: 'Hands-on Hardware Workshops', imageUrl: '/assets/srv_workshop.jpg' },
    { title: 'National Tech Summit Delegation', imageUrl: '/assets/srv_anveshana.jpg' },
    { title: 'Annual Robotics Championship', imageUrl: '/assets/srv_competition.jpg' },
    { title: 'Mechatronics & Drone Testing', imageUrl: '/assets/course_mechatronics.jpg' }
  ];

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

      <!-- ABOUT STORY & PHILOSOPHY (From Edueme Brochure) -->
      <div class="detail-card" style="margin-top: 4px; margin-bottom: 20px;">
        <div class="section-header" style="margin-bottom: 12px;">
          <span class="section-eyebrow">Pioneering STEM Education</span>
          <h2 class="section-title">About Edueme Research Labs</h2>
          <p class="section-subtitle">Bridging the gap between classroom theory and real-world technology.</p>
        </div>
        <p class="section-intro-text" style="margin-bottom: 14px;">The pace of technical development in the modern world is accelerating more quickly than before. Adaptation and the acquisition of new competencies and skills are crucial in this continuously changing world. All citizens—young and old—are impacted by the advancement of digital technology and the digitalization of society.</p>
        <p class="section-intro-text" style="margin-bottom: 14px;">Everyday life is greatly influenced by the use of mobile phones, laptops, tablets, and other technologies that serve both social and entertainment purposes. For everyone to be able to engage the digital generation in the educational process, they must learn to adapt to a changing world and build their digital competencies.</p>
        <p class="section-intro-text" style="margin-bottom: 14px;">Our future generation is now in need to learn about these machines to be future ready, same like in the past where Indian Schools between 1970 and 1990 used to have Occupational Courses for their students to be ready for 21st century. We at Edueme take extensive care of providing Work-Oriented learning opportunities to our students to make them ready for 2nd half of 21st century.</p>
        <p class="section-intro-text" style="margin-bottom: 0;">Our team includes research scientists, innovators, Physicists, who has extensive knowledge and rich experience in the areas of Robotics, Mechanical Design, Machine Learning, Artificial Intelligence. We are the first in India to introduce component based robotics from 3rd standard.</p>
      </div>

      <!-- MISSION CARD -->
      <div class="detail-card" style="margin-bottom: 20px;">
        <div class="section-header" style="margin-bottom: 10px;">
          <span class="section-eyebrow">Purpose & Core Values</span>
          <h2 class="section-title">Our Educational Mission</h2>
          <p class="section-subtitle">Turning curious learners into capable 21st-century inventors.</p>
        </div>
        <p class="section-intro-text" style="margin-bottom: 0;">${settings?.mission || 'To provide high-quality, practical, and industry-focused education in emerging technologies, turning curious students into capable 21st-century inventors and engineers.'}</p>
      </div>

      <!-- STATS COUNTER CARDS (Screen 3 Reference) -->
      <section style="margin-bottom: 24px;">
        <div class="section-header" style="margin-bottom: 12px;">
          <span class="section-eyebrow">Measurable Outcomes</span>
          <h2 class="section-title">Our Journey in Numbers</h2>
          <p class="section-subtitle">Demonstrated reach across schools, students, and educators.</p>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number" data-target="${parseInt(settings?.stats?.studentsTrained) || 5000}" data-suffix="+">${settings?.stats?.studentsTrained || '5000+'}</div>
            <div class="stat-label">Students Trained</div>
          </div>
          <div class="stat-card">
            <div class="stat-number" data-target="${parseInt(settings?.stats?.workshops) || 200}" data-suffix="+">${settings?.stats?.workshops || '200+'}</div>
            <div class="stat-label">Workshops</div>
          </div>
          <div class="stat-card">
            <div class="stat-number" data-target="${parseInt(settings?.stats?.schools) || 50}" data-suffix="+">${settings?.stats?.schools || '50+'}</div>
            <div class="stat-label">Schools</div>
          </div>
          <div class="stat-card">
            <div class="stat-number" data-target="${parseInt(settings?.stats?.yearsExp) || 10}" data-suffix="+">${settings?.stats?.yearsExp || '10+'}</div>
            <div class="stat-label">Years Experience</div>
          </div>
        </div>
      </section>

      <!-- PARTNER INSTITUTIONS SPOTLIGHT CAROUSEL (Also in About Us) -->
      <section class="partner-schools-spotlight-section" style="border-radius: var(--radius-md); margin-bottom: 24px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
        <div class="partner-schools-header">
          <span class="schools-kicker">Trusted by 20+ Institutions</span>
          <h3 class="schools-title">Partner Institutions</h3>
          <p class="schools-subtitle">Leading partner schools and academies across Telangana.</p>
        </div>
        <p class="section-intro-text" style="padding: 0 16px; margin-bottom: 14px;">Recognized by leading educational institutions across Telangana for curriculum excellence, turnkey lab setups, and certified mentor training.</p>

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

      <!-- PUBLICATIONS & BOOKS (Brochure Pages 12 & 13) -->
      <div class="detail-card" style="margin-bottom: 20px;">
        <div class="section-header" style="margin-bottom: 10px;">
          <span class="section-eyebrow">Academic Publications</span>
          <h2 class="section-title">Robotics & AI Textbooks</h2>
          <p class="section-subtitle">Structured grade-wise STEM curriculum designed for grades 2 through 10.</p>
        </div>
        <p class="section-intro-text">Our proprietary curriculum books blend electronic circuitry diagrams, algorithms, and practical hardware assembly into accessible classroom modules.</p>
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
          <span class="section-eyebrow">Leadership & Mentors</span>
          <h2 class="section-title">Scientific & Academic Team</h2>
          <p class="section-subtitle">Researchers and physicists driving experiential learning.</p>
        </div>
        <p class="section-intro-text">Led by research scientists, mechatronics engineers, and STEM educators with deep academic and industry backgrounds, our team ensures every student receives authentic mentorship.</p>

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

      <!-- CAMPUS & LAB MOMENTS (Photos Showcase) -->
      <section class="section-spacing" style="margin-bottom: 28px;">
        <div class="section-header">
          <span class="section-eyebrow">Campus & Lab Moments</span>
          <h2 class="section-title">Moments of Innovation</h2>
          <p class="section-subtitle">Hands-on robotics workshops, tech labs, and student exhibitions.</p>
        </div>
        <p class="section-intro-text">Students at Edueme Research Labs work directly with real electronic components, breadboards, and microcontrollers, turning classroom concepts into working engineering inventions.</p>

        <div class="gallery-grid" style="margin-top: 14px;">
          ${displayPhotos.map(photo => `
            <div class="gallery-card" onclick="openLightbox('${photo.imageUrl}', '${(photo.title || '').replace(/'/g, "\\'")}')" title="Click to view full size">
              <img src="${photo.imageUrl}" alt="${photo.title}" loading="lazy">
              <div class="gallery-caption">${photo.title}</div>
            </div>
          `).join('')}
        </div>
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

  const categories = ['All', ...new Set(courses.map(c => c.category).filter(Boolean))];

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

      <!-- SECTION INTRO FOR COURSES -->
      <div class="section-header" style="margin-top: 6px; margin-bottom: 8px;">
        <span class="section-eyebrow">Component-Based Pedagogy</span>
        <h2 class="section-title">Practical Technology Courses</h2>
        <p class="section-subtitle">From fundamental circuitry to advanced AI and autonomous machines.</p>
      </div>
      <p class="section-intro-text">Every program is structured around hands-on engineering rather than passive screen time. Students work directly with real microcontrollers, sensors, and industry programming languages to build working prototypes.</p>

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
        <div class="section-header" style="margin-bottom: 8px;">
          <span class="section-eyebrow">Curriculum Overview</span>
          <h3 class="section-title">About This Course</h3>
          <p class="section-subtitle">Comprehensive practical training designed for tangible skills.</p>
        </div>
        <p class="section-intro-text" style="margin-bottom: 0;">${course.description}</p>
      </div>

      <div class="detail-card">
        <div class="section-header" style="margin-bottom: 12px;">
          <span class="section-eyebrow">Core Competencies</span>
          <h3 class="section-title">What You Will Learn</h3>
          <p class="section-subtitle">Key technical skills mastered through component-level building.</p>
        </div>
        <ul class="checklist">
          ${(course.highlights || []).map(hl => `
            <li class="checklist-item">
              <span class="check-icon">✔</span>
              <span>${hl}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="detail-card">
        <div class="section-header" style="margin-bottom: 8px;">
          <span class="section-eyebrow">Student Experience</span>
          <h3 class="section-title">Hands-on Hardware & Kits</h3>
          <p class="section-subtitle">Everything you need to build, test, and innovate.</p>
        </div>
        <p class="section-intro-text" style="margin-bottom: 0;">Students receive dedicated hardware components, circuit breadboards, and continuous 1-on-1 mentor guidance. Every course concludes with an autonomous capstone project and verified skill certification.</p>
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

      <!-- SECTION INTRO FOR SERVICES -->
      <div class="section-header" style="margin-top: 6px; margin-bottom: 8px;">
        <span class="section-eyebrow">Turnkey STEM Enablement</span>
        <h2 class="section-title">Institutional Solutions</h2>
        <p class="section-subtitle">Transforming school classrooms into modern innovation labs.</p>
      </div>
      <p class="section-intro-text">Edueme partners with schools to establish complete robotics and maker infrastructure. We provide tailored hardware inventories, year-round curriculum delivery, teacher training, and university tech tours aligned with national STEM standards.</p>

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
        <div class="section-header" style="margin-bottom: 8px;">
          <span class="section-eyebrow">Program Overview</span>
          <h3 class="section-title">Objectives & Scope</h3>
          <p class="section-subtitle">Fostering experiential learning and engineering curiosity.</p>
        </div>
        <p class="section-intro-text" style="margin-bottom: 0;">${service.description}</p>
      </div>

      <!-- KEY BENEFITS / WHAT A SCHOOL OR STUDENT WILL RECEIVE -->
      <div class="detail-card">
        <div class="section-header" style="margin-bottom: 12px;">
          <span class="section-eyebrow">Partner Inclusions</span>
          <h3 class="section-title">What Institutions & Students Receive</h3>
          <p class="section-subtitle">Comprehensive hardware, curriculum, and mentorship support.</p>
        </div>
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
        <div class="section-header" style="margin-top: 32px; margin-bottom: 8px;">
          <span class="section-eyebrow">Modular Offerings</span>
          <h2 class="section-title">Specialized Sub-Services (${service.subServices.length})</h2>
          <p class="section-subtitle">Explore syllabi, modules, and dedicated project tracks.</p>
        </div>
        <p class="section-intro-text">Each modular track targets specific grade bands and technical proficiencies, enabling institutions to tailor learning to their academic calendar.</p>

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
        <div class="section-header" style="margin-bottom: 8px;">
          <span class="section-eyebrow">Module Focus</span>
          <h3 class="section-title">In-Depth Overview</h3>
          <p class="section-subtitle">Detailed roadmap and technical learning objectives.</p>
        </div>
        <p class="section-intro-text" style="margin-bottom: 0;">${subService.detailedOverview || subService.description}</p>
      </div>

      ${subService.modules && subService.modules.length > 0 ? `
        <div class="detail-card">
          <div class="section-header" style="margin-bottom: 12px;">
            <span class="section-eyebrow">Hands-on Syllabus</span>
            <h3 class="section-title">Included Activities & Lab Projects</h3>
            <p class="section-subtitle">Step-by-step engineering exercises from assembly to testing.</p>
          </div>
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

      <!-- SECTION INTRO FOR GALLERY -->
      <div class="section-header" style="margin-top: 6px; margin-bottom: 8px;">
        <span class="section-eyebrow">Experiential Highlights</span>
        <h2 class="section-title">Moments of Innovation</h2>
        <p class="section-subtitle">Real classroom moments, lab builds, and championship arenas.</p>
      </div>
      <p class="section-intro-text">Explore our students and partner schools designing circuits, coding microcontrollers, assembling rovers, and competing in high-energy robotics arenas across India.</p>

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

      <!-- SECTION INTRO FOR CONTACT -->
      <div class="section-header" style="margin-top: 6px; margin-bottom: 8px;">
        <span class="section-eyebrow">Connect With Our Mentors</span>
        <h2 class="section-title">Let's Build the Future Together</h2>
        <p class="section-subtitle">Whether you are a parent, student, or school administrator.</p>
      </div>
      <p class="section-intro-text">Our team is here to assist with course admissions, school lab setups, teacher training workshops, and curriculum inquiries. Reach out directly or fill out the enquiry form below.</p>

      <div class="contact-grid" style="margin-top: 4px;">
        <!-- UNIFIED ENQUIRY CARD (Screen 8) -->
        <div class="enquiry-card">
          <div class="section-header" style="margin-bottom: 14px;">
            <span class="section-eyebrow">Direct Admissions</span>
            <h2 class="section-title" style="font-size: 21px;">Admissions & Enquiries</h2>
            <p class="section-subtitle">Fill in your details and our team will get back shortly.</p>
          </div>

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
          <div class="section-header" style="margin-bottom: 14px;">
            <span class="section-eyebrow">Campus & Labs</span>
            <h2 class="section-title" style="font-size: 21px;">Contact Information</h2>
            <p class="section-subtitle">Visit our Madhapur lab or reach out directly online.</p>
          </div>

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
// IMPACT STATISTIC CARDS COUNTING ANIMATION
// --------------------------------------------------------------------------
function initStatsCounter() {
  const statElements = document.querySelectorAll('.edueme-stat-num[data-target], .stat-number[data-target]');
  if (!statElements || statElements.length === 0) return;

  statElements.forEach(el => {
    if (el.dataset.counterInitialized) return;
    el.dataset.counterInitialized = 'true';

    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const suffix = el.getAttribute('data-suffix') || '+';
    const duration = 1350; // 1.35s
    let hasAnimated = false;

    function runCounter() {
      if (hasAnimated) return;
      hasAnimated = true;
      const startTime = performance.now();

      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Smooth easeOutExpo
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.floor(ease * target);
        el.textContent = `${current}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = `${target}${suffix}`;
        }
      }

      requestAnimationFrame(update);
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            runCounter();
            obs.disconnect();
          }
        });
      }, { threshold: 0.15 });
      observer.observe(el);
    } else {
      runCounter();
    }
  });
}

// --------------------------------------------------------------------------
// COHESIVE GLOBAL MOTION SYSTEM CONTROLLER
// --------------------------------------------------------------------------
function initGlobalMotion() {
  // Respect reduced-motion preferences
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal-item, .reveal-left, .reveal-right, .reveal-img, .courses-pencil-robot-container')
      .forEach(el => el.classList.add('is-revealed'));
    return;
  }

  // 1. Grid Items (Courses, Services, Team, Stats, Gallery, Pillars)
  const gridSelectors = [
    '.cards-grid',
    '.stats-grid',
    '.edueme-stats-grid',
    '.team-grid',
    '.gallery-grid',
    '.value-pillars-microgrid'
  ];

  gridSelectors.forEach(gridSel => {
    document.querySelectorAll(gridSel).forEach(grid => {
      const items = Array.from(grid.children);
      items.forEach((item, index) => {
        if (!item.classList.contains('reveal-item') && !item.classList.contains('reveal-left') && !item.classList.contains('reveal-right')) {
          // Stagger by 80-120ms (index % 4 * 95ms)
          item.style.setProperty('--stagger', index % 4);
          // Alternating left/right entrance or slight upward movement
          if (index % 2 === 0) {
            item.classList.add('reveal-left');
          } else {
            item.classList.add('reveal-right');
          }
        }
      });
    });
  });

  // 2. Images inside cards & gallery
  document.querySelectorAll('.card-img-wrap img, .gallery-card img, .team-avatar').forEach((img, index) => {
    if (!img.classList.contains('reveal-img')) {
      img.classList.add('reveal-img');
      img.style.setProperty('--stagger', (index % 3));
    }
  });

  // 3. Robot mascot container
  const robotContainer = document.querySelector('.courses-pencil-robot-container');
  if (robotContainer && !robotContainer.classList.contains('reveal-item')) {
    robotContainer.classList.add('reveal-item');
  }

  // 4. Observe all revealable elements
  const revealElements = document.querySelectorAll(
    '.reveal-item:not(.is-revealed), .reveal-left:not(.is-revealed), .reveal-right:not(.is-revealed), .reveal-img:not(.is-revealed), .courses-pencil-robot-container:not(.is-revealed)'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }

  // 5. Initialize stats counters
  initStatsCounter();
}

// --------------------------------------------------------------------------
// NURTURED SKILLS REFERENCE CAROUSEL (Image 1 Reference)
// --------------------------------------------------------------------------
const nurturedSkillsData = [
  {
    step: '01',
    title: 'Build Confidence',
    desc: 'Children learn to bring their ideas to light, realize their power to invent, and believe in themselves.',
    iconSvg: `<svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="16" y1="3" x2="16" y2="6" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="6" y1="7" x2="8.5" y2="9.5" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="26" y1="7" x2="23.5" y2="9.5" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="2" y1="17" x2="5" y2="17" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="27" y1="17" x2="30" y2="17" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M11 17c0-2.8 2.2-5 5-5s5 2.2 5 5c0 2-1 3.5-2 4.5v1.5h-6V21.5C12 20.5 11 19 11 17z" fill="#f59e0b"/>
      <path d="M14 26h4" stroke="#d97706" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    iconBg: '#eff3fe'
  },
  {
    step: '02',
    title: 'Encourage Perseverance',
    desc: 'Robotics projects rarely work on the first try. Students develop tenacity and never give up.',
    iconSvg: `<svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4c3 3 7 9 7 15l-3 2-2-2-2 2-2-2-2 2-3-2c0-6 4-12 7-15z" fill="#f97316"/>
      <circle cx="16" cy="13" r="2.5" fill="#ffffff"/>
      <path d="M16 23v5M12 26l4 2 4-2" stroke="#ea580c" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    iconBg: '#fff7ed'
  },
  {
    step: '03',
    title: 'Accept Criticism & Teamwork',
    desc: 'Learning to embrace feedback and collaborate productively with peer teammates for collective success.',
    iconSvg: `<svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 18l5-4 4 3 6-5 5 4-5 5-5-2-4 3-6-4z" fill="#8b5cf6"/>
      <circle cx="11" cy="11" r="3" fill="#ec4899"/>
      <circle cx="21" cy="11" r="3" fill="#6366f1"/>
    </svg>`,
    iconBg: '#faf5ff'
  },
  {
    step: '04',
    title: 'Programming & Logic',
    desc: 'Mastering algorithmic thinking, hardware control, and multi-sensor coordination.',
    iconSvg: `<svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="7" width="18" height="18" rx="4" fill="#0284c7"/>
      <rect x="11" y="11" width="10" height="10" rx="2" fill="#ffffff"/>
      <path d="M4 12h3M4 16h3M4 20h3M25 12h3M25 16h3M25 20h3M12 4v3M16 4v3M20 4v3M12 25v3M16 25v3M20 25v3" stroke="#0369a1" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
    iconBg: '#f0f9ff'
  }
];

let nurturedSkillsTimer = null;
function initNurturedSkills() {
  if (nurturedSkillsTimer) clearInterval(nurturedSkillsTimer);

  const card = document.getElementById('nurturedCard');
  if (!card) return;

  const stepEl = document.getElementById('nurturedStepNum');
  const iconBox = document.getElementById('nurturedIconBox');
  const titleEl = document.getElementById('nurturedCardTitle');
  const descEl = document.getElementById('nurturedCardDesc');
  const dots = document.querySelectorAll('.nurtured-dot');
  const nextBtn = document.getElementById('nurturedNextBtn');

  let currentIndex = 0;

  function setSkill(idx) {
    currentIndex = (idx + nurturedSkillsData.length) % nurturedSkillsData.length;
    const item = nurturedSkillsData[currentIndex];

    if (titleEl && descEl && iconBox) {
      titleEl.classList.remove('nurtured-anim-fade');
      descEl.classList.remove('nurtured-anim-fade');
      iconBox.classList.remove('nurtured-anim-fade');
      void titleEl.offsetWidth; // trigger reflow
      titleEl.textContent = item.title;
      descEl.textContent = item.desc;
      iconBox.innerHTML = item.iconSvg;
      iconBox.style.backgroundColor = item.iconBg;
      titleEl.classList.add('nurtured-anim-fade');
      descEl.classList.add('nurtured-anim-fade');
      iconBox.classList.add('nurtured-anim-fade');
    }

    if (stepEl) {
      stepEl.textContent = item.step;
    }

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      setSkill(currentIndex + 1);
      resetAutoCycle();
    };
  }

  dots.forEach(dot => {
    dot.onclick = () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10) || 0;
      setSkill(idx);
      resetAutoCycle();
    };
  });

  // Mobile touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  card.addEventListener('touchstart', (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      touchStartX = e.changedTouches[0].screenX;
    }
  }, { passive: true });

  card.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 35) {
        if (diff > 0) {
          setSkill(currentIndex + 1);
        } else {
          setSkill(currentIndex - 1);
        }
        resetAutoCycle();
      }
    }
  }, { passive: true });

  function startAutoCycle() {
    nurturedSkillsTimer = setInterval(() => {
      setSkill(currentIndex + 1);
    }, 4500);
  }

  function resetAutoCycle() {
    if (nurturedSkillsTimer) clearInterval(nurturedSkillsTimer);
    startAutoCycle();
  }

  startAutoCycle();
}

// --------------------------------------------------------------------------
// FLOATING LAYERED TESTIMONIALS ANIMATION CONTROLLER (Center-Focused Coverflow)
// --------------------------------------------------------------------------
let testimonialAutoTimer = null;

function initFloatingTestimonials() {
  const section = document.getElementById('testimonialsSection');
  const stage = document.getElementById('testimonialsStage');
  const dots = document.querySelectorAll('#testimonialsDots .testimonials-dot');
  if (!section || !stage) return;

  const cards = Array.from(stage.querySelectorAll('.testimonial-card-item'));
  const totalCards = cards.length;
  if (totalCards === 0) return;

  let currentIndex = 0;

  function updateCoverflow(newIndex) {
    currentIndex = (newIndex + totalCards) % totalCards;

    cards.forEach((card, i) => {
      card.classList.remove('card-active', 'card-prev', 'card-next', 'card-hidden');

      const diff = (i - currentIndex + totalCards) % totalCards;

      if (diff === 0) {
        card.classList.add('card-active');
      } else if (diff === 1 || (totalCards === 2 && diff === 1)) {
        card.classList.add('card-next');
      } else if (diff === totalCards - 1) {
        card.classList.add('card-prev');
      } else {
        card.classList.add('card-hidden');
      }
    });

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  // Initial arrangement
  updateCoverflow(0);

  // Click on side cards to advance/rewind
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      if (card.classList.contains('card-prev')) {
        updateCoverflow(currentIndex - 1);
        resetAutoTimer();
      } else if (card.classList.contains('card-next')) {
        updateCoverflow(currentIndex + 1);
        resetAutoTimer();
      }
    });
  });

  // Dot click navigation
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10) || 0;
      updateCoverflow(idx);
      resetAutoTimer();
    });
  });

  // Mobile Touch Swipe Handling
  let touchStartX = 0;
  let touchStartY = 0;

  stage.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      pauseAutoTimer();
    }
  }, { passive: true });

  stage.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // Ensure horizontal swipe is dominant and exceeds threshold
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 28) {
        if (diffX > 0) {
          // Swipe left -> Next card
          updateCoverflow(currentIndex + 1);
        } else {
          // Swipe right -> Previous card
          updateCoverflow(currentIndex - 1);
        }
      }
      resetAutoTimer();
    }
  }, { passive: true });

  // Auto-Slide Timer (every 4.5s)
  function startAutoTimer() {
    if (testimonialAutoTimer) clearInterval(testimonialAutoTimer);
    testimonialAutoTimer = setInterval(() => {
      updateCoverflow(currentIndex + 1);
    }, 4500);
  }

  function pauseAutoTimer() {
    if (testimonialAutoTimer) clearInterval(testimonialAutoTimer);
  }

  function resetAutoTimer() {
    pauseAutoTimer();
    startAutoTimer();
  }

  stage.addEventListener('mouseenter', pauseAutoTimer);
  stage.addEventListener('mouseleave', startAutoTimer);

  startAutoTimer();

  // Scroll Parallax Effect on Mascot
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.top < windowHeight && rect.bottom > 0) {
          const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
          const parallaxOffset = (progress - 0.5) * 14;
          const mascot = section.querySelector('.testimonials-floating-robot');
          if (mascot) {
            mascot.style.transform = `translateY(${parallaxOffset * -0.6}px)`;
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
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
