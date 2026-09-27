require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

async function checkTables() {
  const tables = ['courses', 'leads', 'services', 'settings', 'edueme_store'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`Table "${t}": ${error.message}`);
    } else {
      console.log(`Table "${t}": EXISTS, rows = ${data ? data.length : 0}`);
    }
  }
}

checkTables();
