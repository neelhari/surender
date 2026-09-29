require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ugrqfovafzrwefkdjmhm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
let isConnected = false;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    isConnected = true;
    console.log('⚡ Supabase Client initialized successfully for project:', SUPABASE_URL);
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.warn('⚠️ Supabase credentials not found in environment variables.');
}

/**
 * Upload an image buffer directly to Supabase Storage bucket 'edueme_uploads'
 */
async function uploadToSupabaseStorage(buffer, fileName, mimeType = 'image/jpeg') {
  if (!supabase) return null;
  try {
    const bucketName = 'edueme_uploads';
    const filePath = `images/${Date.now()}_${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.warn('Supabase storage upload error:', error.message);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicData ? publicData.publicUrl : null;
  } catch (err) {
    console.error('Supabase upload exception:', err.message);
    return null;
  }
}

// -------------------------------------------------------------
// CLOUD COURSES CRUD
// -------------------------------------------------------------
async function getCoursesFromCloud() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error || !data) return null;
    return data.map(c => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      category: c.category,
      shortDescription: c.short_description || '',
      description: c.description || '',
      duration: c.duration || '',
      level: c.level || '',
      mode: c.mode || '',
      image: c.image || '',
      highlights: Array.isArray(c.highlights) ? c.highlights : [],
      status: c.status || 'active',
      displayOrder: c.display_order || 0,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }));
  } catch (e) {
    return null;
  }
}

async function upsertCourseInCloud(c) {
  if (!supabase) return false;
  try {
    const row = {
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
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('courses').upsert(row);
    return !error;
  } catch (e) {
    return false;
  }
}

async function deleteCourseInCloud(id) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    return !error;
  } catch (e) {
    return false;
  }
}

// -------------------------------------------------------------
// CLOUD SERVICES CRUD
// -------------------------------------------------------------
async function getServicesFromCloud() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error || !data) return null;
    return data.map(s => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      tagline: s.tagline || '',
      description: s.description || '',
      icon: s.icon || '',
      image: s.image || '',
      features: s.features || [],
      status: s.status || 'active',
      displayOrder: s.display_order || 0,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }));
  } catch (e) {
    return null;
  }
}

async function upsertServiceInCloud(s) {
  if (!supabase) return false;
  try {
    const row = {
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
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('services').upsert(row);
    return !error;
  } catch (e) {
    return false;
  }
}

async function deleteServiceInCloud(id) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('services').delete().eq('id', id);
    return !error;
  } catch (e) {
    return false;
  }
}

// -------------------------------------------------------------
// CLOUD SUB-SERVICES CRUD
// -------------------------------------------------------------
async function getSubServicesFromCloud() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('sub_services')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error || !data) return null;
    return data.map(sub => ({
      id: sub.id,
      serviceId: sub.service_id,
      serviceSlug: sub.service_slug,
      title: sub.title,
      slug: sub.slug,
      description: sub.description || '',
      detailedOverview: sub.detailed_overview || '',
      modules: Array.isArray(sub.modules) ? sub.modules : [],
      image: sub.image || '',
      status: sub.status || 'active',
      displayOrder: sub.display_order || 0,
      createdAt: sub.created_at,
      updatedAt: sub.updated_at
    }));
  } catch (e) {
    return null;
  }
}

async function upsertSubServiceInCloud(sub) {
  if (!supabase) return false;
  try {
    const row = {
      id: sub.id,
      service_id: sub.serviceId || sub.service_id,
      service_slug: sub.serviceSlug || sub.service_slug,
      title: sub.title,
      slug: sub.slug,
      description: sub.description || '',
      detailed_overview: sub.detailedOverview || sub.detailed_overview || '',
      modules: Array.isArray(sub.modules) ? sub.modules : [],
      image: sub.image || '',
      status: sub.status || 'active',
      display_order: sub.displayOrder || sub.display_order || 0,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('sub_services').upsert(row);
    return !error;
  } catch (e) {
    return false;
  }
}

async function deleteSubServiceInCloud(id) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('sub_services').delete().eq('id', id);
    return !error;
  } catch (e) {
    return false;
  }
}

// -------------------------------------------------------------
// CLOUD EVENTS CRUD
// -------------------------------------------------------------
async function getEventsFromCloud() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error || !data) return null;
    return data.map(ev => ({
      id: ev.id,
      title: ev.title,
      slug: ev.slug,
      category: ev.category || '',
      type: ev.type || 'past',
      date: ev.date || '',
      timings: ev.timings || '',
      location: ev.location || '',
      shortDescription: ev.short_description || '',
      description: ev.description || '',
      image: ev.image || '',
      photos: ev.photos || [],
      highlights: ev.highlights || [],
      status: ev.status || 'active',
      displayOrder: ev.display_order || 0,
      createdAt: ev.created_at,
      updatedAt: ev.updated_at
    }));
  } catch (e) {
    return null;
  }
}

async function upsertEventInCloud(ev) {
  if (!supabase) return false;
  try {
    const row = {
      id: ev.id,
      title: ev.title,
      slug: ev.slug,
      category: ev.category || '',
      type: ev.type || 'past',
      date: ev.date || '',
      timings: ev.timings || '',
      location: ev.location || '',
      short_description: ev.shortDescription || '',
      description: ev.description || '',
      image: ev.image || '',
      photos: ev.photos || [],
      status: ev.status || 'active',
      display_order: ev.displayOrder || 0,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('events').upsert(row);
    return !error;
  } catch (e) {
    return false;
  }
}

async function deleteEventInCloud(id) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('events').delete().eq('id', id);
    return !error;
  } catch (e) {
    return false;
  }
}

// -------------------------------------------------------------
// CLOUD HOME BANNERS CRUD
// -------------------------------------------------------------
async function getBannersFromCloud() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('home_banners')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error || !data) return null;
    return data.map(b => ({
      id: b.id,
      badge: b.badge || '',
      title: b.title || '',
      subtitle: b.subtitle || '',
      ctaText: b.cta_text || '',
      ctaLink: b.cta_link || '',
      imageUrl: b.image_url || '',
      displayOrder: b.display_order || 0,
      status: b.status || 'active',
      createdAt: b.created_at
    }));
  } catch (e) {
    return null;
  }
}

async function upsertBannerInCloud(b) {
  if (!supabase) return false;
  try {
    const row = {
      id: b.id,
      badge: b.badge || '',
      title: b.title,
      subtitle: b.subtitle || '',
      cta_text: b.ctaText || b.cta_text || '',
      cta_link: b.ctaLink || b.cta_link || '',
      image_url: b.imageUrl || b.image_url || '',
      display_order: b.displayOrder || b.display_order || 0,
      status: b.status || 'active'
    };
    const { error } = await supabase.from('home_banners').upsert(row);
    return !error;
  } catch (e) {
    return false;
  }
}

async function deleteBannerInCloud(id) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('home_banners').delete().eq('id', id);
    return !error;
  } catch (e) {
    return false;
  }
}

// -------------------------------------------------------------
// CLOUD SETTINGS CRUD (Synced via edueme_store)
// -------------------------------------------------------------
async function getSettingsFromCloud() {
  if (!supabase) return null;
  try {
    const data = await fetchFromSupabase('settings');
    return data || null;
  } catch (e) {
    return null;
  }
}

async function updateSettingsInCloud(settings) {
  if (!supabase) return false;
  try {
    return await syncToSupabase('settings', settings);
  } catch (e) {
    return false;
  }
}

// -------------------------------------------------------------
// CLOUD LEADS CRUD
// -------------------------------------------------------------
async function getLeadsFromCloud() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error || !data) return null;
    return data.map(l => ({
      id: l.id,
      fullName: l.full_name,
      phone: l.phone,
      email: l.email,
      sourceType: l.source_type,
      courseName: l.course_name,
      serviceName: l.service_name,
      subServiceName: l.sub_service_name,
      message: l.message,
      status: l.status || 'new',
      priority: l.priority || 'Medium',
      createdAt: l.created_at,
      updatedAt: l.updated_at
    }));
  } catch (e) {
    return null;
  }
}

async function insertLeadToSupabase(lead) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('leads')
      .insert([{
        id: lead.id,
        full_name: lead.fullName,
        phone: lead.phone,
        email: lead.email,
        source_type: lead.sourceType,
        course_name: lead.courseName || null,
        service_name: lead.serviceName || null,
        sub_service_name: lead.subServiceName || null,
        message: lead.message || null,
        status: lead.status || 'new',
        priority: lead.priority || 'Medium',
        created_at: lead.createdAt || new Date().toISOString()
      }]);
    return !error;
  } catch (err) {
    return false;
  }
}

async function updateLeadStatusInCloud(id, newStatus) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  } catch (e) {
    return false;
  }
}

async function deleteLeadInCloud(id) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    return !error;
  } catch (e) {
    return false;
  }
}

// -------------------------------------------------------------
// GENERIC SYNC & FETCH
// -------------------------------------------------------------
async function syncToSupabase(key, data) {
  if (!supabase) return false;
  try {
    await supabase
      .from('edueme_store')
      .upsert({ key, data, updated_at: new Date().toISOString() });
    return true;
  } catch (err) {
    return false;
  }
}

async function fetchFromSupabase(key) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('edueme_store')
      .select('data')
      .eq('key', key)
      .single();

    if (error || !data) return null;
    return data.data;
  } catch (err) {
    return null;
  }
}

module.exports = {
  supabase,
  isConnected,
  uploadToSupabaseStorage,
  getCoursesFromCloud,
  upsertCourseInCloud,
  deleteCourseInCloud,
  getServicesFromCloud,
  upsertServiceInCloud,
  deleteServiceInCloud,
  getSubServicesFromCloud,
  upsertSubServiceInCloud,
  deleteSubServiceInCloud,
  getEventsFromCloud,
  upsertEventInCloud,
  deleteEventInCloud,
  getBannersFromCloud,
  upsertBannerInCloud,
  deleteBannerInCloud,
  getSettingsFromCloud,
  updateSettingsInCloud,
  getLeadsFromCloud,
  insertLeadToSupabase,
  updateLeadStatusInCloud,
  deleteLeadInCloud,
  syncToSupabase,
  fetchFromSupabase
};
