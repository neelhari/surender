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

      <!-- PARTNER SCHOOLS SOCIAL PROOF STRIP (Immediate Credibility from Old Site) -->
      <section class="partner-schools-strip">
        <div class="partner-schools-title">Trusted by 20+ Leading Schools Across Telangana</div>
        <div class="partner-schools-list">
          <div class="partner-school-pill"><span class="icon">🏫</span> Mount Carmel Global School</div>
          <div class="partner-school-pill"><span class="icon">🏫</span> Samskar Global School</div>
          <div class="partner-school-pill"><span class="icon">🏫</span> Phoenix Greens School of Learning</div>
          <div class="partner-school-pill"><span class="icon">🏫</span> Arka International School</div>
          <div class="partner-school-pill"><span class="icon">🏫</span> Srivedha The Universal School</div>
        </div>
      </section>

      <!-- POPULAR COURSES SECTION (Soft-Tinted Depth + Old Site Quote Banner) -->
      <section class="popular-courses-tinted-wrap">
        <div class="section-header" style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 8px;">
          <div>
            <span class="section-badge" style="background: #e0f2fe; color: #0369a1;">Development</span>
            <h2 class="section-title">Our Popular Courses</h2>
          </div>
          <a href="/courses" style="font-weight: 700; color: var(--accent-blue); font-size: 13px;" onclick="navigate(event, '/courses')">View All &rarr;</a>
        </div>

        <div class="courses-quote-banner">
          &ldquo;Unlock your child's inner innovator with our empowering courses! We believe every child has the potential to create something amazing.&rdquo;
          <div style="font-size: 11px; font-weight: 700; color: var(--primary-navy); margin-top: 4px; font-style: normal;">— Edueme Research Labs</div>
        </div>

        ${courses.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">📚</div>
            <div class="empty-state-title">No Courses Listed Yet</div>
            <div class="empty-state-text">Check back soon as new programs are added from Admin.</div>
          </div>
        ` : `
          <div class="cards-grid">
            ${popularCourses.map(course => `
              <div class="item-card" style="box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
                <div class="card-img-wrap">
                  <img src="${course.image || '/assets/hero_robotics.jpg'}" alt="${course.title}" class="card-img" loading="lazy">
                  <span class="card-category-badge">${course.category}</span>
                </div>
                <div class="card-body">
                  <div class="batch-date-badge">
                    <span>📅</span> Next Batch Enrolling
                  </div>
                  <div class="card-meta-row">
                    <span class="meta-pill">⏱️ ${course.duration}</span>
                    <span class="meta-pill">📊 ${course.level}</span>
                  </div>
                  <h3 class="card-title">${course.title}</h3>
                  <p class="card-desc">${course.shortDescription || course.description}</p>
                  <a href="/courses/${course.slug}" class="card-btn" onclick="navigate(event, '/courses/${course.slug}')">
                    <span>View Details</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </a>
                </div>
              </div>
            `).join('')}
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
          ${featuredServices.map(srv => `
            <div class="item-card">
              <div class="card-img-wrap">
                <img src="${srv.image || '/assets/brochure/img_8.jpg'}" alt="${srv.title}" class="card-img" loading="lazy">
                <span class="card-category-badge">${srv.subServices ? srv.subServices.length + ' Sub-Services' : 'Program'}</span>
              </div>
              <div class="card-body">
                <div class="card-meta-row">
                  <span class="meta-pill">⏱️ ${srv.duration}</span>
                </div>
                <h3 class="card-title">${srv.title}</h3>
                <p class="card-desc">${srv.shortDescription}</p>
                <a href="/services/${srv.slug}" class="card-btn" onclick="navigate(event, '/services/${srv.slug}')">
                  <span>Explore Program</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            </div>
          `).join('')}
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
    <div class="app-container section-spacing">
      <div class="breadcrumbs">
        <a href="/" onclick="navigate(event, '/')">Home</a>
        <span>&rsaquo;</span>
        <span>About Us</span>
      </div>

      <div class="detail-hero">
        <div class="detail-img-wrap">
          <img src="/assets/brochure/img_7.jpg" alt="About Edueme Research Labs" class="detail-img">
        </div>
        <div class="detail-header-body">
          <span class="section-badge">Our Legacy & Mission</span>
          <h1 class="detail-title">About Edueme Research Labs</h1>
          <p class="detail-tagline">Inspiring Innovation. Building Future. — Learn . Practice . Achieve</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 16px; white-space: pre-line;">
            ${settings?.aboutStory || ''}
          </p>
        </div>
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

    listContainer.innerHTML = filtered.map(course => `
      <div class="item-card">
        <div class="card-img-wrap">
          <img src="${course.image || '/assets/brochure/img_7.jpg'}" alt="${course.title}" class="card-img" loading="lazy">
          <span class="card-category-badge">${course.category}</span>
        </div>
        <div class="card-body">
          <div class="card-meta-row">
            <span class="meta-pill">⏱️ ${course.duration}</span>
            <span class="meta-pill">📊 ${course.level}</span>
          </div>
          <h3 class="card-title">${course.title}</h3>
          <p class="card-desc">${course.shortDescription || course.description}</p>
          <a href="/courses/${course.slug}" class="card-btn" onclick="navigate(event, '/courses/${course.slug}')">
            <span>View Details</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    `).join('');
  }

  root.innerHTML = `
    <div class="app-container section-spacing">
      <div class="breadcrumbs">
        <a href="/" onclick="navigate(event, '/')">Home</a>
        <span>&rsaquo;</span>
        <span>Our Courses</span>
      </div>

      <div class="section-header">
        <span class="section-badge">Skill-First Programs</span>
        <h1 class="section-title">Our Courses</h1>
        <p class="section-subtitle">Gain future-ready skills with our industry-relevant STEM programs.</p>
      </div>

      <!-- SEARCH INPUT -->
      <div class="search-input-wrap">
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
    <div class="app-container section-spacing">
      <div class="breadcrumbs">
        <a href="/" onclick="navigate(event, '/')">Home</a>
        <span>&rsaquo;</span>
        <a href="/courses" onclick="navigate(event, '/courses')">Courses</a>
        <span>&rsaquo;</span>
        <span>${course.title}</span>
      </div>

      <div class="detail-hero">
        <div class="detail-img-wrap">
          <img src="${course.image || '/assets/brochure/img_7.jpg'}" alt="${course.title}" class="detail-img">
        </div>
        <div class="detail-header-body">
          <span class="section-badge">${course.category}</span>
          <h1 class="detail-title">${course.title}</h1>
          <p class="detail-tagline">Build . Program . Innovate</p>

          <div class="detail-badges">
            <span class="detail-badge-pill">⏱️ ${course.duration}</span>
            <span class="detail-badge-pill">📊 ${course.level}</span>
            <span class="detail-badge-pill">📍 ${course.mode}</span>
          </div>

          <!-- ENROLL NOW CTA -> Unified Enquiry Form with Pre-Tagged Course -->
          <a href="/contact?type=course&id=${course.id}" class="detail-cta-btn" onclick="navigate(event, '/contact?type=course&id=${course.id}')">
            <span>Enroll Now</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
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
    <div class="app-container section-spacing">
      <div class="breadcrumbs">
        <a href="/" onclick="navigate(event, '/')">Home</a>
        <span>&rsaquo;</span>
        <span>Services & Programs</span>
      </div>

      <div class="section-header">
        <span class="section-badge">Institutional & Student Solutions</span>
        <h1 class="section-title">Workshops & Programs</h1>
        <p class="section-subtitle">Hands-on technology workshops, Prayogshala tech labs, and immersion tours for schools and colleges.</p>
      </div>

      ${services.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">🔬</div>
          <div class="empty-state-title">No Services Available</div>
        </div>
      ` : `
        <div class="cards-grid">
          ${services.map(srv => `
            <div class="item-card">
              <div class="card-img-wrap">
                <img src="${srv.image || '/assets/brochure/img_8.jpg'}" alt="${srv.title}" class="card-img" loading="lazy">
                <span class="card-category-badge">${srv.subServices?.length || 0} Sub-Services</span>
              </div>
              <div class="card-body">
                <div class="card-meta-row">
                  <span class="meta-pill">⏱️ ${srv.duration}</span>
                </div>
                <h3 class="card-title">${srv.title}</h3>
                <p class="card-desc">${srv.shortDescription}</p>
                <a href="/services/${srv.slug}" class="card-btn" onclick="navigate(event, '/services/${srv.slug}')">
                  <span>View Details & Sub-Services</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            </div>
          `).join('')}
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
    <div class="app-container section-spacing">
      <div class="breadcrumbs">
        <a href="/" onclick="navigate(event, '/')">Home</a>
        <span>&rsaquo;</span>
        <a href="/services" onclick="navigate(event, '/services')">Services</a>
        <span>&rsaquo;</span>
        <span>${service.title}</span>
      </div>

      <div class="detail-hero">
        <div class="detail-img-wrap">
          <img src="${service.image || '/assets/brochure/img_8.jpg'}" alt="${service.title}" class="detail-img">
        </div>
        <div class="detail-header-body">
          <span class="section-badge">Program Offering</span>
          <h1 class="detail-title">${service.title}</h1>
          <p class="detail-tagline">⏱️ Typical Duration: ${service.duration}</p>

          <a href="/contact?type=service&id=${service.id}" class="detail-cta-btn" onclick="navigate(event, '/contact?type=service&id=${service.id}')">
            <span>Enquire Now</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
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
    <div class="app-container section-spacing">
      <div class="breadcrumbs">
        <a href="/" onclick="navigate(event, '/')">Home</a>
        <span>&rsaquo;</span>
        <a href="/services" onclick="navigate(event, '/services')">Services</a>
        <span>&rsaquo;</span>
        <a href="/services/${parentService.slug}" onclick="navigate(event, '/services/${parentService.slug}')">${parentService.title}</a>
        <span>&rsaquo;</span>
        <span>${subService.title}</span>
      </div>

      <div class="detail-hero">
        <div class="detail-img-wrap">
          <img src="${subService.image || '/assets/brochure/img_8.jpg'}" alt="${subService.title}" class="detail-img">
        </div>
        <div class="detail-header-body">
          <span class="section-badge">${parentService.title} Sub-Module</span>
          <h1 class="detail-title">${subService.title}</h1>
          <p class="detail-tagline">${subService.description}</p>

          <!-- DEDICATED ENQUIRY CTA PRE-TAGGED WITH SUB-SERVICE -->
          <a href="/contact?type=sub-service&id=${subService.id}" class="detail-cta-btn" onclick="navigate(event, '/contact?type=sub-service&id=${subService.id}')">
            <span>Enquire for ${subService.title}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
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
    <div class="app-container section-spacing">
      <div class="breadcrumbs">
        <a href="/" onclick="navigate(event, '/')">Home</a>
        <span>&rsaquo;</span>
        <span>Moments of Learning</span>
      </div>

      <div class="section-header">
        <span class="section-badge">Photo Showcase</span>
        <h1 class="section-title">Gallery</h1>
        <p class="section-subtitle">Moments of Learning, Innovation and Fun across school labs and university tours.</p>
      </div>

      <div class="filter-pills" id="gallery-filter-pills">
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
    <div class="app-container section-spacing">
      <div class="breadcrumbs">
        <a href="/" onclick="navigate(event, '/')">Home</a>
        <span>&rsaquo;</span>
        <span>Contact Us</span>
      </div>

      <div class="section-header">
        <span class="section-badge">Get In Touch</span>
        <h1 class="section-title">Contact & Enquiry</h1>
        <p class="section-subtitle">Send us a message and our team will get back to you immediately.</p>
      </div>

      <div class="contact-grid">
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
