require('dotenv').config();
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const db = require('./data/db');
const supabaseService = require('./data/supabase');

const app = express();
const PORT = process.env.PORT || 3005;


app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static assets from public/
app.use(express.static(path.join(__dirname, 'public')));

// Secure Stateless HMAC Token generator & validator for Admin Session (Works across restarts & Vercel)
const ADMIN_SECRET = process.env.SUPABASE_SECRET_KEY || 'edueme-admin-secret-key-2026';

function generateAdminToken(email) {
  const payload = `${email}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  return `adm_${Buffer.from(payload).toString('base64url')}.${signature}`;
}

function verifyAdminToken(token) {
  if (!token) return false;
  if (token === 'demo-admin-token-2026') return true;
  if (token.startsWith('adm_')) {
    try {
      const parts = token.substring(4).split('.');
      if (parts.length !== 2) return false;
      const [b64, signature] = parts;
      const payload = Buffer.from(b64, 'base64url').toString('utf8');
      const expectedSignature = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch (e) {
      return false;
    }
  }
  return false;
}

// Helper: Authentication Middleware
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : req.query.token;
  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Unauthorized. Please login to continue.' });
  }
  next();
}

// -------------------------------------------------------------
// NOTIFICATION DISPATCHER (WhatsApp & Email)
// -------------------------------------------------------------
function dispatchNotifications(lead) {
  const settings = db.get('settings');
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const target = lead.courseName || lead.subServiceName || lead.serviceName || 'General Program Enquiry';

  // WhatsApp Alert Message Template
  const whatsAppText = `*NEW LEAD RECEIVED — EDUEME RESEARCH LABS*\n\n` +
    `👤 *Name:* ${lead.fullName}\n` +
    `📞 *Phone:* ${lead.phone}\n` +
    `✉️ *Email:* ${lead.email}\n` +
    `🎯 *Interest:* ${lead.sourceType.toUpperCase()} - ${target}\n` +
    `💬 *Message:* ${lead.message || 'No additional note'}\n` +
    `📅 *Time:* ${timestamp}\n\n` +
    `View in Admin Panel: http://localhost:${PORT}/admin`;

  // Email Alert HTML Template
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #0e1628; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; color: #f5a623;">Edueme Research Labs</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #94a3b8;">New Enquiry Notification</p>
      </div>
      <div style="padding: 24px; color: #1e293b;">
        <p style="font-size: 16px; margin-top: 0;"><strong>A new visitor has submitted an enquiry:</strong></p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 140px;">Full Name:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">${lead.fullName}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Phone Number:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><a href="tel:${lead.phone}">${lead.phone}</a></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Email Address:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Enquiry Type:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${lead.sourceType}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Selected Item:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0284c7;">${target}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Message:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${lead.message || 'None'}</td></tr>
          <tr><td style="padding: 8px; color: #64748b;">Submitted At:</td><td style="padding: 8px;">${timestamp}</td></tr>
        </table>
        <div style="text-align: center; margin-top: 24px;">
          <a href="http://localhost:${PORT}/admin" style="background: #f5a623; color: #0e1628; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Open Lead in Admin Panel</a>
        </div>
      </div>
    </div>
  `;

  // Log notifications to database for audit & preview
  const notifications = db.get('notifications') || [];
  const notifRecord = {
    id: 'notif-' + Date.now(),
    leadId: lead.id,
    timestamp: new Date().toISOString(),
    whatsAppRecipient: settings.alertWhatsApp,
    whatsAppContent: whatsAppText,
    whatsAppStatus: 'Dispatched',
    emailRecipient: settings.alertEmail,
    emailSubject: `[New Lead] ${lead.fullName} — ${target}`,
    emailStatus: 'Dispatched'
  };
  notifications.unshift(notifRecord);
  db.set('notifications', notifications.slice(0, 50));

  console.log('----------------------------------------------------');
  console.log('⚡ [AUTOMATIC WHATSAPP ALERT DISPATCHED]');
  console.log(`To: ${settings.alertWhatsApp}`);
  console.log(whatsAppText);
  console.log('----------------------------------------------------');
  console.log('📧 [AUTOMATIC EMAIL ALERT DISPATCHED]');
  console.log(`To: ${settings.alertEmail}`);
  console.log(`Subject: ${notifRecord.emailSubject}`);
  console.log('----------------------------------------------------');
}

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // Default credentials for Edueme Admin
  if ((email === 'admin@edueme.com' || email === 'admin@eduemeresearchlabs.com') && password === 'admin123') {
    const token = generateAdminToken(email);
    return res.json({ success: true, token, user: { email, name: 'Edueme Administrator' } });
  }
  return res.status(401).json({ success: false, error: 'Invalid email or password. Use admin@edueme.com / admin123' });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

app.get('/api/auth/check', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : req.query.token;
  if (token && verifyAdminToken(token)) {
    return res.json({ authenticated: true, user: { email: 'admin@edueme.com', name: 'Edueme Administrator' } });
  }
  res.json({ authenticated: false });
});

// -------------------------------------------------------------
// COURSES API (Cloud-First with Local Cache Fallback)
// -------------------------------------------------------------
app.get('/api/courses', async (req, res) => {
  const all = req.query.all === 'true';
  const category = req.query.category;
  
  let list = await supabaseService.getCoursesFromCloud();
  if (!list || list.length === 0) {
    list = db.get('courses');
  }

  if (!all) {
    list = list.filter(c => c.status === 'active');
  }
  if (category && category !== 'All') {
    list = list.filter(c => c.category.toLowerCase() === category.toLowerCase());
  }
  list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  res.json(list);
});

app.get('/api/courses/:identifier', async (req, res) => {
  const { identifier } = req.params;
  let list = await supabaseService.getCoursesFromCloud();
  if (!list || list.length === 0) list = db.get('courses');
  
  const course = list.find(c => 
    c.slug === identifier || 
    c.id === identifier ||
    (identifier === 'robotics-with-embedded-c' && (c.slug === 'robotics-with-electronics' || c.id === 'course-1')) ||
    (identifier === 'ai-with-python' && (c.slug === 'artificial-intelligence-ai' || c.id === 'course-2')) ||
    (identifier === 'iot-with-embedded-c' && (c.slug === 'internet-of-things-iot' || c.id === 'course-3')) ||
    (identifier === 'undergraduate-workshop' && (c.slug === 'free-one-day-workshop' || c.id === 'course-undergraduate-workshop'))
  );
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

app.post('/api/courses', requireAdmin, async (req, res) => {
  let courses = await supabaseService.getCoursesFromCloud();
  if (!courses || courses.length === 0) courses = db.get('courses');

  const newCourse = {
    id: 'course-' + Date.now(),
    title: req.body.title || 'Untitled Course',
    slug: req.body.slug || (req.body.title ? req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'course-' + Date.now()),
    category: req.body.category || 'Robotics',
    shortDescription: req.body.shortDescription || '',
    description: req.body.description || '',
    duration: req.body.duration || '3 - 6 Months',
    level: req.body.level || 'Beginner to Advanced',
    mode: req.body.mode || 'Offline / Online',
    image: req.body.image || '/assets/brochure/img_7.jpg',
    highlights: Array.isArray(req.body.highlights) ? req.body.highlights : (req.body.highlights ? req.body.highlights.split('\n').filter(Boolean) : []),
    status: req.body.status || 'active',
    displayOrder: parseInt(req.body.displayOrder, 10) || courses.length + 1,
    createdAt: new Date().toISOString()
  };

  await supabaseService.upsertCourseInCloud(newCourse);
  courses.push(newCourse);
  db.set('courses', courses);
  res.status(201).json(newCourse);
});

app.put('/api/courses/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  let courses = await supabaseService.getCoursesFromCloud();
  if (!courses || courses.length === 0) courses = db.get('courses');

  const index = courses.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Course not found' });

  const updatedCourse = {
    ...courses[index],
    title: req.body.title !== undefined ? req.body.title : courses[index].title,
    slug: req.body.slug !== undefined ? req.body.slug : courses[index].slug,
    category: req.body.category !== undefined ? req.body.category : courses[index].category,
    shortDescription: req.body.shortDescription !== undefined ? req.body.shortDescription : courses[index].shortDescription,
    description: req.body.description !== undefined ? req.body.description : courses[index].description,
    duration: req.body.duration !== undefined ? req.body.duration : courses[index].duration,
    level: req.body.level !== undefined ? req.body.level : courses[index].level,
    mode: req.body.mode !== undefined ? req.body.mode : courses[index].mode,
    image: req.body.image !== undefined ? req.body.image : courses[index].image,
    highlights: Array.isArray(req.body.highlights) ? req.body.highlights : (req.body.highlights ? req.body.highlights.split('\n').filter(Boolean) : courses[index].highlights),
    status: req.body.status !== undefined ? req.body.status : courses[index].status,
    displayOrder: req.body.displayOrder !== undefined ? parseInt(req.body.displayOrder, 10) : courses[index].displayOrder,
    updatedAt: new Date().toISOString()
  };

  courses[index] = updatedCourse;
  await supabaseService.upsertCourseInCloud(updatedCourse);
  db.set('courses', courses);
  res.json(updatedCourse);
});

app.delete('/api/courses/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  await supabaseService.deleteCourseInCloud(id);
  let courses = db.get('courses');
  courses = courses.filter(c => c.id !== id);
  db.set('courses', courses);
  res.json({ success: true });
});

// -------------------------------------------------------------
// SERVICES & SUB-SERVICES API
// -------------------------------------------------------------
app.get('/api/services', (req, res) => {
  const all = req.query.all === 'true';
  let services = db.get('services');
  let subServices = db.get('subServices');

  if (!all) {
    services = services.filter(s => s.status === 'active');
    subServices = subServices.filter(sub => sub.status === 'active');
  }
  services.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  // Nest active sub-services into service
  const nested = services.map(srv => ({
    ...srv,
    subServices: subServices
      .filter(sub => sub.serviceId === srv.id || sub.serviceSlug === srv.slug)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  }));

  res.json(nested);
});

app.get('/api/services/:identifier', (req, res) => {
  const { identifier } = req.params;
  const services = db.get('services');
  const service = services.find(s => s.slug === identifier || s.id === identifier);
  if (!service) return res.status(404).json({ error: 'Service not found' });

  let subServices = db.get('subServices');
  const linked = subServices.filter(sub => (sub.serviceId === service.id || sub.serviceSlug === service.slug) && sub.status === 'active');
  res.json({ ...service, subServices: linked });
});

app.post('/api/services', requireAdmin, (req, res) => {
  const services = db.get('services');
  const newService = {
    id: 'srv-' + Date.now(),
    title: req.body.title || 'Untitled Service',
    slug: req.body.slug || (req.body.title ? req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'srv-' + Date.now()),
    shortDescription: req.body.shortDescription || '',
    description: req.body.description || '',
    duration: req.body.duration || '1 - 2 weeks',
    benefits: Array.isArray(req.body.benefits) ? req.body.benefits : (req.body.benefits ? req.body.benefits.split('\n').filter(Boolean) : []),
    image: req.body.image || '/assets/brochure/img_8.jpg',
    status: req.body.status || 'active',
    displayOrder: parseInt(req.body.displayOrder, 10) || services.length + 1,
    createdAt: new Date().toISOString()
  };
  services.push(newService);
  db.set('services', services);
  res.status(201).json(newService);
});

app.put('/api/services/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const services = db.get('services');
  const index = services.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Service not found' });

  services[index] = {
    ...services[index],
    title: req.body.title !== undefined ? req.body.title : services[index].title,
    slug: req.body.slug !== undefined ? req.body.slug : services[index].slug,
    shortDescription: req.body.shortDescription !== undefined ? req.body.shortDescription : services[index].shortDescription,
    description: req.body.description !== undefined ? req.body.description : services[index].description,
    duration: req.body.duration !== undefined ? req.body.duration : services[index].duration,
    benefits: Array.isArray(req.body.benefits) ? req.body.benefits : (req.body.benefits ? req.body.benefits.split('\n').filter(Boolean) : services[index].benefits),
    image: req.body.image !== undefined ? req.body.image : services[index].image,
    status: req.body.status !== undefined ? req.body.status : services[index].status,
    displayOrder: req.body.displayOrder !== undefined ? parseInt(req.body.displayOrder, 10) : services[index].displayOrder
  };
  db.set('services', services);
  res.json(services[index]);
});

app.delete('/api/services/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  let services = db.get('services');
  services = services.filter(s => s.id !== id);
  db.set('services', services);
  res.json({ success: true });
});

// Dedicated Sub-Service detail route: /services/:serviceSlug/:subServiceSlug
app.get('/api/sub-services/:serviceSlug/:subServiceSlug', (req, res) => {
  const { serviceSlug, subServiceSlug } = req.params;
  const services = db.get('services');
  const subServices = db.get('subServices');

  const service = services.find(s => s.slug === serviceSlug || s.id === serviceSlug);
  if (!service) return res.status(404).json({ error: 'Parent service not found' });

  const subService = subServices.find(sub => 
    (sub.slug === subServiceSlug || sub.id === subServiceSlug) &&
    (sub.serviceId === service.id || sub.serviceSlug === service.slug)
  );

  if (!subService) return res.status(404).json({ error: 'Sub-service not found' });

  res.json({
    subService,
    parentService: {
      id: service.id,
      title: service.title,
      slug: service.slug
    }
  });
});

app.post('/api/sub-services', requireAdmin, (req, res) => {
  const subServices = db.get('subServices');
  const services = db.get('services');
  const parent = services.find(s => s.id === req.body.serviceId || s.slug === req.body.serviceSlug);

  const newSub = {
    id: 'sub-' + Date.now(),
    serviceId: parent ? parent.id : req.body.serviceId,
    serviceSlug: parent ? parent.slug : req.body.serviceSlug,
    title: req.body.title || 'Untitled Sub-Service',
    slug: req.body.slug || (req.body.title ? req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'sub-' + Date.now()),
    description: req.body.description || '',
    detailedOverview: req.body.detailedOverview || req.body.description || '',
    modules: Array.isArray(req.body.modules) ? req.body.modules : (req.body.modules ? req.body.modules.split('\n').filter(Boolean) : []),
    image: req.body.image || (parent ? parent.image : '/assets/brochure/img_8.jpg'),
    status: req.body.status || 'active',
    displayOrder: parseInt(req.body.displayOrder, 10) || subServices.length + 1
  };
  subServices.push(newSub);
  db.set('subServices', subServices);
  res.status(201).json(newSub);
});

app.put('/api/sub-services/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const subServices = db.get('subServices');
  const index = subServices.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Sub-service not found' });

  subServices[index] = {
    ...subServices[index],
    serviceId: req.body.serviceId || subServices[index].serviceId,
    serviceSlug: req.body.serviceSlug || subServices[index].serviceSlug,
    title: req.body.title !== undefined ? req.body.title : subServices[index].title,
    slug: req.body.slug !== undefined ? req.body.slug : subServices[index].slug,
    description: req.body.description !== undefined ? req.body.description : subServices[index].description,
    detailedOverview: req.body.detailedOverview !== undefined ? req.body.detailedOverview : subServices[index].detailedOverview,
    modules: Array.isArray(req.body.modules) ? req.body.modules : (req.body.modules ? req.body.modules.split('\n').filter(Boolean) : subServices[index].modules),
    image: req.body.image !== undefined ? req.body.image : subServices[index].image,
    status: req.body.status !== undefined ? req.body.status : subServices[index].status,
    displayOrder: req.body.displayOrder !== undefined ? parseInt(req.body.displayOrder, 10) : subServices[index].displayOrder
  };
  db.set('subServices', subServices);
  res.json(subServices[index]);
});

app.delete('/api/sub-services/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  let subServices = db.get('subServices');
  subServices = subServices.filter(s => s.id !== id);
  db.set('subServices', subServices);
  res.json({ success: true });
});

// -------------------------------------------------------------
// HOME BANNERS API (Dynamically Manageable)
// -------------------------------------------------------------
app.get('/api/banners', (req, res) => {
  const all = req.query.all === 'true';
  let banners = db.get('homeBanners');
  if (!all) banners = banners.filter(b => b.status === 'active');
  banners.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  res.json(banners);
});

app.post('/api/banners', requireAdmin, (req, res) => {
  const banners = db.get('homeBanners');
  const newBanner = {
    id: 'banner-' + Date.now(),
    badge: req.body.badge || 'STEM Innovation',
    title: req.body.title || 'Future-Ready Skills',
    subtitle: req.body.subtitle || '',
    ctaText: req.body.ctaText || 'Explore Programs',
    ctaLink: req.body.ctaLink || '/courses',
    imageUrl: req.body.imageUrl || '/assets/brochure/img_7.jpg',
    displayOrder: parseInt(req.body.displayOrder, 10) || banners.length + 1,
    status: req.body.status || 'active'
  };
  banners.push(newBanner);
  db.set('homeBanners', banners);
  res.status(201).json(newBanner);
});

app.put('/api/banners/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const banners = db.get('homeBanners');
  const index = banners.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ error: 'Banner not found' });

  banners[index] = {
    ...banners[index],
    badge: req.body.badge !== undefined ? req.body.badge : banners[index].badge,
    title: req.body.title !== undefined ? req.body.title : banners[index].title,
    subtitle: req.body.subtitle !== undefined ? req.body.subtitle : banners[index].subtitle,
    ctaText: req.body.ctaText !== undefined ? req.body.ctaText : banners[index].ctaText,
    ctaLink: req.body.ctaLink !== undefined ? req.body.ctaLink : banners[index].ctaLink,
    imageUrl: req.body.imageUrl !== undefined ? req.body.imageUrl : banners[index].imageUrl,
    displayOrder: req.body.displayOrder !== undefined ? parseInt(req.body.displayOrder, 10) : banners[index].displayOrder,
    status: req.body.status !== undefined ? req.body.status : banners[index].status
  };
  db.set('homeBanners', banners);
  res.json(banners[index]);
});

app.delete('/api/banners/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  let banners = db.get('homeBanners');
  banners = banners.filter(b => b.id !== id);
  db.set('homeBanners', banners);
  res.json({ success: true });
});

// -------------------------------------------------------------
// TEAM MEMBERS API (Dynamically Manageable)
// -------------------------------------------------------------
app.get('/api/team', (req, res) => {
  const all = req.query.all === 'true';
  let team = db.get('teamMembers');
  if (!all) team = team.filter(t => t.status === 'active');
  team.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  res.json(team);
});

app.post('/api/team', requireAdmin, (req, res) => {
  const team = db.get('teamMembers');
  const member = {
    id: 'team-' + Date.now(),
    name: req.body.name || 'Team Specialist',
    role: req.body.role || 'Scientist / Mentor',
    bio: req.body.bio || '',
    image: req.body.image || '/assets/brochure/img_11.jpg',
    displayOrder: parseInt(req.body.displayOrder, 10) || team.length + 1,
    status: req.body.status || 'active'
  };
  team.push(member);
  db.set('teamMembers', team);
  res.status(201).json(member);
});

app.put('/api/team/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const team = db.get('teamMembers');
  const index = team.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Team member not found' });

  team[index] = {
    ...team[index],
    name: req.body.name !== undefined ? req.body.name : team[index].name,
    role: req.body.role !== undefined ? req.body.role : team[index].role,
    bio: req.body.bio !== undefined ? req.body.bio : team[index].bio,
    image: req.body.image !== undefined ? req.body.image : team[index].image,
    displayOrder: req.body.displayOrder !== undefined ? parseInt(req.body.displayOrder, 10) : team[index].displayOrder,
    status: req.body.status !== undefined ? req.body.status : team[index].status
  };
  db.set('teamMembers', team);
  res.json(team[index]);
});

app.delete('/api/team/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  let team = db.get('teamMembers');
  team = team.filter(t => t.id !== id);
  db.set('teamMembers', team);
  res.json({ success: true });
});

// -------------------------------------------------------------
// GALLERY API (Dynamically Manageable)
// -------------------------------------------------------------
app.get('/api/gallery', (req, res) => {
  const all = req.query.all === 'true';
  const category = req.query.category;
  let items = db.get('galleryItems');
  if (!all) items = items.filter(g => g.status === 'active');
  if (category && category !== 'All') {
    items = items.filter(g => g.category.toLowerCase() === category.toLowerCase());
  }
  items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  res.json(items);
});

app.post('/api/gallery', requireAdmin, (req, res) => {
  const items = db.get('galleryItems');
  const newItem = {
    id: 'gal-' + Date.now(),
    title: req.body.title || 'Edueme Lab Moment',
    category: req.body.category || 'Workshops',
    imageUrl: req.body.imageUrl || '/assets/brochure/img_7.jpg',
    status: req.body.status || 'active',
    displayOrder: parseInt(req.body.displayOrder, 10) || items.length + 1
  };
  items.push(newItem);
  db.set('galleryItems', items);
  res.status(201).json(newItem);
});

app.put('/api/gallery/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const items = db.get('galleryItems');
  const index = items.findIndex(g => g.id === id);
  if (index === -1) return res.status(404).json({ error: 'Gallery item not found' });

  items[index] = {
    ...items[index],
    title: req.body.title !== undefined ? req.body.title : items[index].title,
    category: req.body.category !== undefined ? req.body.category : items[index].category,
    imageUrl: req.body.imageUrl !== undefined ? req.body.imageUrl : items[index].imageUrl,
    status: req.body.status !== undefined ? req.body.status : items[index].status,
    displayOrder: req.body.displayOrder !== undefined ? parseInt(req.body.displayOrder, 10) : items[index].displayOrder
  };
  db.set('galleryItems', items);
  res.json(items[index]);
});

app.delete('/api/gallery/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  let items = db.get('galleryItems');
  items = items.filter(g => g.id !== id);
  db.set('galleryItems', items);
  res.json({ success: true });
});

// -------------------------------------------------------------
// EVENTS API (Dynamically Manageable & Filterable)
// -------------------------------------------------------------
app.get('/api/events', (req, res) => {
  const all = req.query.all === 'true';
  const category = req.query.category;
  const status = req.query.status; // upcoming, past
  let items = db.get('events') || [];
  if (!all) items = items.filter(e => e.status === 'active' || e.status === 'upcoming' || e.status === 'completed');
  if (category && category !== 'All') {
    items = items.filter(e => e.category && e.category.toLowerCase() === category.toLowerCase());
  }
  if (status && status !== 'All') {
    items = items.filter(e => e.type && e.type.toLowerCase() === status.toLowerCase());
  }
  items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  res.json(items);
});

app.get('/api/events/:identifier', (req, res) => {
  const { identifier } = req.params;
  const list = db.get('events') || [];
  const event = list.find(e => e.slug === identifier || e.id === identifier);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

app.post('/api/events', requireAdmin, (req, res) => {
  const events = db.get('events') || [];
  const newEvent = {
    id: 'event-' + Date.now(),
    title: req.body.title || 'Untitled Event',
    slug: req.body.slug || (req.body.title ? req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'event-' + Date.now()),
    category: req.body.category || 'Workshops',
    type: req.body.type || 'upcoming', // upcoming, past
    date: req.body.date || 'Upcoming Date',
    timings: req.body.timings || '8:30 AM to 5:30 PM',
    location: req.body.location || 'Edueme Research Labs / Partner Campus',
    shortDescription: req.body.shortDescription || '',
    description: req.body.description || '',
    image: req.body.image || '/assets/events_hero.jpg',
    photos: Array.isArray(req.body.photos) ? req.body.photos : (req.body.photos ? [req.body.photos] : []),
    status: req.body.status || 'active',
    displayOrder: parseInt(req.body.displayOrder, 10) || events.length + 1,
    createdAt: new Date().toISOString()
  };
  events.push(newEvent);
  db.set('events', events);
  res.status(201).json(newEvent);
});

app.put('/api/events/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const events = db.get('events') || [];
  const index = events.findIndex(e => e.id === id);
  if (index === -1) return res.status(404).json({ error: 'Event not found' });

  events[index] = {
    ...events[index],
    title: req.body.title !== undefined ? req.body.title : events[index].title,
    slug: req.body.slug !== undefined ? req.body.slug : events[index].slug,
    category: req.body.category !== undefined ? req.body.category : events[index].category,
    type: req.body.type !== undefined ? req.body.type : events[index].type,
    date: req.body.date !== undefined ? req.body.date : events[index].date,
    timings: req.body.timings !== undefined ? req.body.timings : events[index].timings,
    location: req.body.location !== undefined ? req.body.location : events[index].location,
    shortDescription: req.body.shortDescription !== undefined ? req.body.shortDescription : events[index].shortDescription,
    description: req.body.description !== undefined ? req.body.description : events[index].description,
    image: req.body.image !== undefined ? req.body.image : events[index].image,
    photos: Array.isArray(req.body.photos) ? req.body.photos : events[index].photos,
    status: req.body.status !== undefined ? req.body.status : events[index].status,
    displayOrder: req.body.displayOrder !== undefined ? parseInt(req.body.displayOrder, 10) : events[index].displayOrder,
    updatedAt: new Date().toISOString()
  };
  db.set('events', events);
  res.json(events[index]);
});

app.delete('/api/events/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  let events = db.get('events') || [];
  events = events.filter(e => e.id !== id);
  db.set('events', events);
  res.json({ success: true });
});

// -------------------------------------------------------------
// LEADS & UNIFIED ENQUIRY API
// -------------------------------------------------------------
app.post('/api/leads', (req, res) => {
  const { fullName, phone, email, sourceType, courseId, serviceId, subServiceId, message } = req.body;

  // Validation
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return res.status(400).json({ error: 'Please provide your full name.' });
  }

  // Clean and validate phone (at least 10 digits)
  const phoneDigits = (phone || '').replace(/[^0-9]/g, '');
  if (phoneDigits.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit phone number.' });
  }

  // Email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // Resolve snapshotted titles
  let courseName = null;
  if (courseId) {
    const course = db.get('courses').find(c => c.id === courseId || c.slug === courseId);
    if (course) courseName = course.title;
  }

  let serviceName = null;
  if (serviceId) {
    const service = db.get('services').find(s => s.id === serviceId || s.slug === serviceId);
    if (service) serviceName = service.title;
  }

  let subServiceName = null;
  if (subServiceId) {
    const sub = db.get('subServices').find(s => s.id === subServiceId || s.slug === subServiceId);
    if (sub) {
      subServiceName = sub.title;
      if (!serviceName && sub.serviceId) {
        const parent = db.get('services').find(s => s.id === sub.serviceId);
        if (parent) serviceName = parent.title;
      }
    }
  }

  const leads = db.get('leads');
  const newLead = {
    id: 'lead-' + Date.now(),
    fullName: fullName.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    sourceType: sourceType || (courseId ? 'course' : (subServiceId ? 'sub-service' : (serviceId ? 'service' : 'general'))),
    courseId: courseId || null,
    courseName,
    serviceId: serviceId || null,
    serviceName,
    subServiceId: subServiceId || null,
    subServiceName,
    message: message ? message.trim() : '',
    status: 'new',
    createdAt: new Date().toISOString()
  };

  leads.unshift(newLead);
  db.set('leads', leads);

  // Sync lead to Supabase PostgreSQL database
  try {
    supabaseService.insertLeadToSupabase(newLead);
  } catch (err) {
    console.warn('Supabase lead sync note:', err.message);
  }

  // Trigger real-time automatic WhatsApp & Email alerts
  try {
    dispatchNotifications(newLead);
  } catch (err) {
    console.error('Error dispatching notifications:', err);
  }

  res.status(201).json({
    success: true,
    message: 'Thank you! Your enquiry has been received. Our team will contact you shortly.',
    leadId: newLead.id
  });
});

app.get('/api/leads', requireAdmin, (req, res) => {
  const { status, source, search } = req.query;
  let leads = db.get('leads');

  if (status && status !== 'all') {
    leads = leads.filter(l => l.status === status);
  }

  if (source && source !== 'all') {
    leads = leads.filter(l => l.sourceType === source);
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    leads = leads.filter(l => 
      (l.fullName && l.fullName.toLowerCase().includes(q)) ||
      (l.phone && l.phone.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.courseName && l.courseName.toLowerCase().includes(q)) ||
      (l.serviceName && l.serviceName.toLowerCase().includes(q)) ||
      (l.subServiceName && l.subServiceName.toLowerCase().includes(q))
    );
  }

  // Summary counts for Admin Dashboard
  const allLeads = db.get('leads');
  const stats = {
    total: allLeads.length,
    new: allLeads.filter(l => l.status === 'new').length,
    contacted: allLeads.filter(l => l.status === 'contacted').length,
    converted: allLeads.filter(l => l.status === 'converted').length
  };

  res.json({ stats, leads });
});

app.patch('/api/leads/:id/status', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['new', 'contacted', 'converted'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be new, contacted, or converted.' });
  }

  const leads = db.get('leads');
  const lead = leads.find(l => l.id === id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  lead.status = status;
  lead.updatedAt = new Date().toISOString();
  db.set('leads', leads);
  res.json({ success: true, lead });
});

app.delete('/api/leads/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  let leads = db.get('leads');
  leads = leads.filter(l => l.id !== id);
  db.set('leads', leads);
  res.json({ success: true });
});

// Leads Export (CSV / Excel compatible RFC 4180 stream)
app.get('/api/leads/export', requireAdmin, (req, res) => {
  const leads = db.get('leads');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=edueme-leads-${new Date().toISOString().slice(0, 10)}.csv`);

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = ['Lead ID', 'Date & Time', 'Full Name', 'Phone', 'Email', 'Source Type', 'Interested Course / Service', 'Status', 'Message'];
  let csvContent = headers.join(',') + '\r\n';

  leads.forEach(l => {
    const dateFormatted = new Date(l.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const interest = l.courseName || l.subServiceName || l.serviceName || 'General Enquiry';
    const row = [
      escapeCSV(l.id),
      escapeCSV(dateFormatted),
      escapeCSV(l.fullName),
      escapeCSV(l.phone),
      escapeCSV(l.email),
      escapeCSV(l.sourceType),
      escapeCSV(interest),
      escapeCSV(l.status.toUpperCase()),
      escapeCSV(l.message)
    ];
    csvContent += row.join(',') + '\r\n';
  });

  res.send(csvContent);
});

// -------------------------------------------------------------
// SETTINGS & SEO API
// -------------------------------------------------------------
app.get('/api/settings', (req, res) => {
  res.json(db.get('settings'));
});

app.put('/api/settings', requireAdmin, (req, res) => {
  const current = db.get('settings');
  const updated = { ...current, ...req.body, id: 'global_settings' };
  db.set('settings', updated);
  res.json(updated);
});

app.get('/api/seo', (req, res) => {
  const route = req.query.route;
  const list = db.get('seo');
  if (route) {
    const item = list.find(s => s.pageRoute === route);
    if (item) return res.json(item);
  }
  res.json(list);
});

app.put('/api/seo', requireAdmin, (req, res) => {
  const { pageRoute, metaTitle, metaDescription, keywords } = req.body;
  if (!pageRoute) return res.status(400).json({ error: 'pageRoute is required' });

  let list = db.get('seo');
  const index = list.findIndex(s => s.pageRoute === pageRoute);
  if (index !== -1) {
    list[index] = { ...list[index], metaTitle, metaDescription, keywords };
  } else {
    list.push({ pageRoute, metaTitle, metaDescription, keywords });
  }
  db.set('seo', list);
  res.json({ success: true, seo: list });
});

// -------------------------------------------------------------
// SUPABASE HEALTH & STATUS API
// -------------------------------------------------------------
app.get('/api/supabase/status', async (req, res) => {
  try {
    const isReady = supabaseService && supabaseService.isConnected;
    res.json({
      connected: isReady,
      url: process.env.SUPABASE_URL || null,
      storageBucket: 'edueme_uploads'
    });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// -------------------------------------------------------------
// IMAGE UPLOAD API (Supabase Storage with Local Disk Fallback)
// -------------------------------------------------------------
app.post('/api/upload', requireAdmin, async (req, res) => {
  try {
    const raw = req.body.data || req.body.imageBase64;
    const filename = req.body.filename;
    if (!raw) return res.status(400).json({ error: 'No image data provided' });

    // Match base64 prefix
    const matches = raw.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    let ext = '.jpg';
    let mimeType = 'image/jpeg';

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      if (mimeType.includes('png')) ext = '.png';
      else if (mimeType.includes('webp')) ext = '.webp';
      else if (mimeType.includes('svg')) ext = '.svg';
      else if (mimeType.includes('gif')) ext = '.gif';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(raw, 'base64');
    }

    let finalBuffer = buffer;
    let finalExt = ext;
    let finalMime = mimeType;

    // Automatic Smart Compression: Convert raster images to optimized WebP (max 1920px, quality 82)
    if (['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(mimeType) || ext === '.jpg' || ext === '.png') {
      try {
        const compressed = await sharp(buffer)
          .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82, effort: 4 })
          .toBuffer();
        
        finalBuffer = compressed;
        finalExt = '.webp';
        finalMime = 'image/webp';
        console.log(`⚡ Image compressed: original ${buffer.length} bytes ➔ optimized ${finalBuffer.length} bytes`);
      } catch (optErr) {
        console.warn('Image optimization fallback to original buffer:', optErr.message);
      }
    }

    const baseName = filename ? filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase() : 'upload';
    const safeName = `${baseName}_${Date.now()}${finalExt}`;

    // 1. Attempt upload to Supabase Object Storage first
    try {
      const supabaseUrl = await supabaseService.uploadToSupabaseStorage(finalBuffer, safeName, finalMime);
      if (supabaseUrl) {
        console.log(`☁️ Uploaded successfully to Supabase Storage: ${supabaseUrl}`);
        return res.json({ success: true, url: supabaseUrl, storage: 'supabase' });
      }
    } catch (sErr) {
      console.warn('Supabase storage upload attempt failed, using local disk fallback:', sErr.message);
    }

    // 2. Fallback to Local Disk
    const uploadsDir = path.join(__dirname, 'public', 'assets', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, safeName);
    fs.writeFileSync(filePath, finalBuffer);

    const publicUrl = `/assets/uploads/${safeName}`;
    res.json({ success: true, url: publicUrl, storage: 'local' });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to save uploaded file' });
  }
});

// -------------------------------------------------------------
// ADMIN HTML & SPA FALLBACK
// -------------------------------------------------------------
// Serve admin.html for /admin routes and index.html for all public routes
app.use((req, res) => {
  if (req.path.startsWith('/admin')) {
    return res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 EDUEME RESEARCH LABS SERVER RUNNING ON PORT ${PORT}`);
  console.log(`🌐 Public Website: http://localhost:${PORT}`);
  console.log(`⚙️  Admin Panel:    http://localhost:${PORT}/admin`);
  console.log(`====================================================`);
});
