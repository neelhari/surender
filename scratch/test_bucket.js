require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function initStorage() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets && buckets.some(b => b.name === 'edueme_uploads');
    if (!exists) {
      console.log('Creating public storage bucket "edueme_uploads"...');
      const { data, error } = await supabase.storage.createBucket('edueme_uploads', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif']
      });
      if (error) {
        console.log('Bucket creation info:', error.message);
      } else {
        console.log('✅ Bucket "edueme_uploads" created successfully!');
      }
    } else {
      console.log('✅ Bucket "edueme_uploads" already exists!');
    }
  } catch (err) {
    console.error('Bucket init error:', err);
  }
}

initStorage();
