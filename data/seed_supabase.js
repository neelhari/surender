require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const db = require('./db');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

async function seed() {
  console.log('🌱 Starting Supabase database seeding from local db.json...');

  const data = db.load();

  // 1. Seed Courses
  if (data.courses && data.courses.length > 0) {
    const formatted = data.courses.map(c => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      category: c.category,
      short_description: c.shortDescription || '',
      description: c.description || '',
      duration: c.duration || '',
      level: c.level || '',
      mode: c.mode || '',
      image: c.image || '',
      highlights: c.highlights || [],
      status: c.status || 'active',
      display_order: c.displayOrder || 0,
      created_at: c.createdAt || new Date().toISOString()
    }));
    const { error } = await supabase.from('courses').upsert(formatted);
    console.log('Courses seed:', error ? `❌ ${error.message}` : `✅ ${formatted.length} courses synced`);
  }

  // 2. Seed Services
  if (data.services && data.services.length > 0) {
    const formatted = data.services.map(s => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      tagline: s.tagline || '',
      description: s.description || '',
      icon: s.icon || '',
      image: s.image || '',
      features: s.features || [],
      status: s.status || 'active',
      display_order: s.displayOrder || 0,
      created_at: s.createdAt || new Date().toISOString()
    }));
    const { error } = await supabase.from('services').upsert(formatted);
    console.log('Services seed:', error ? `❌ ${error.message}` : `✅ ${formatted.length} services synced`);
  }

  // 3. Seed Sub-Services
  if (data.subServices && data.subServices.length > 0) {
    const formatted = data.subServices.map(s => ({
      id: s.id,
      service_id: s.serviceId || '',
      service_slug: s.serviceSlug || '',
      title: s.title,
      slug: s.slug,
      description: s.description || '',
      detailed_overview: s.detailedOverview || '',
      modules: s.modules || [],
      image: s.image || '',
      status: s.status || 'active',
      display_order: s.displayOrder || 0,
      created_at: s.createdAt || new Date().toISOString()
    }));
    const { error } = await supabase.from('sub_services').upsert(formatted);
    console.log('Sub-services seed:', error ? `❌ ${error.message}` : `✅ ${formatted.length} sub-services synced`);
  }

  // 4. Seed Team Members
  if (data.teamMembers && data.teamMembers.length > 0) {
    const formatted = data.teamMembers.map(t => ({
      id: t.id,
      name: t.name,
      role: t.role,
      bio: t.bio || '',
      image: t.image || '',
      display_order: t.displayOrder || 0,
      status: t.status || 'active'
    }));
    const { error } = await supabase.from('team_members').upsert(formatted);
    console.log('Team members seed:', error ? `❌ ${error.message}` : `✅ ${formatted.length} members synced`);
  }

  // 5. Seed Home Banners
  if (data.homeBanners && data.homeBanners.length > 0) {
    const formatted = data.homeBanners.map(b => ({
      id: b.id,
      badge: b.badge || '',
      title: b.title,
      subtitle: b.subtitle || '',
      cta_text: b.ctaText || '',
      cta_link: b.ctaLink || '',
      image_url: b.imageUrl || '',
      display_order: b.displayOrder || 0,
      status: b.status || 'active'
    }));
    const { error } = await supabase.from('home_banners').upsert(formatted);
    console.log('Home banners seed:', error ? `❌ ${error.message}` : `✅ ${formatted.length} banners synced`);
  }

  // 6. Seed Gallery Items
  if (data.galleryItems && data.galleryItems.length > 0) {
    const formatted = data.galleryItems.map(g => ({
      id: g.id,
      title: g.title,
      category: g.category,
      image_url: g.imageUrl,
      display_order: g.displayOrder || 0,
      status: g.status || 'active'
    }));
    const { error } = await supabase.from('gallery_items').upsert(formatted);
    console.log('Gallery items seed:', error ? `❌ ${error.message}` : `✅ ${formatted.length} items synced`);
  }

  // 7. Seed Settings
  if (data.settings) {
    const s = data.settings;
    const formatted = {
      id: 'global_settings',
      site_name: s.siteName || 'Edueme Research Labs',
      alert_whatsapp: s.alertWhatsApp || '',
      alert_email: s.alertEmail || '',
      phone: s.phone || '',
      email: s.email || '',
      address: s.address || '',
      social_links: s.socialLinks || {}
    };
    const { error } = await supabase.from('settings').upsert(formatted);
    console.log('Settings seed:', error ? `❌ ${error.message}` : `✅ Settings synced`);
  }

  // 8. Seed Key-Value Store
  const storeEntries = Object.keys(data).map(key => ({
    key,
    data: data[key],
    updated_at: new Date().toISOString()
  }));
  const { error: storeErr } = await supabase.from('edueme_store').upsert(storeEntries);
  console.log('Store seed:', storeErr ? `❌ ${storeErr.message}` : `✅ Full store synced`);

  console.log('🎉 Seeding process completed!');
}

seed().catch(err => console.error('Seeding fatal error:', err));
