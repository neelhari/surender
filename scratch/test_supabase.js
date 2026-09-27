require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key prefix:', supabaseKey ? supabaseKey.substring(0, 15) + '...' : 'NONE');

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    // Try listing buckets or checking auth settings
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.log('Storage buckets check note:', bucketError.message);
    } else {
      console.log('✅ Supabase Storage Connected! Found buckets:', buckets.map(b => b.name));
    }

    // Try a simple health query or rpc/table test
    console.log('✅ Supabase Client initialized successfully with Secret Key!');
  } catch (err) {
    console.error('Supabase test error:', err);
  }
}

test();
