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
  console.warn('⚠️ Supabase credentials not found in environment variables. Falling back to local db.');
}

/**
 * Upload an image buffer directly to Supabase Storage bucket 'edueme_uploads'
 * @param {Buffer} buffer - Binary file buffer
 * @param {string} fileName - Destination filename
 * @param {string} mimeType - Mime type of file
 * @returns {Promise<string|null>} - Public URL or null
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

/**
 * Save / sync a collection to Supabase store
 */
async function syncToSupabase(key, data) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('edueme_store')
      .upsert({ key, data, updated_at: new Date().toISOString() });
    
    if (error) {
      // Table might not be created yet in SQL editor
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Fetch a collection from Supabase store
 */
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

/**
 * Record a lead directly in Supabase
 */
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
        status: lead.status || 'New',
        priority: lead.priority || 'Medium',
        created_at: lead.createdAt || new Date().toISOString()
      }]);

    if (!error) {
      console.log(`✅ Lead ${lead.id} synced directly to Supabase "leads" table`);
      return true;
    }
  } catch (err) {}
  return false;
}

module.exports = {
  supabase,
  isConnected,
  uploadToSupabaseStorage,
  syncToSupabase,
  fetchFromSupabase,
  insertLeadToSupabase
};
