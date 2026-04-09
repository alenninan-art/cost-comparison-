const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('prices').select('*').limit(1);
  if (error) {
    console.error('Error fetching prices:', error);
  } else {
    console.log('Prices columns:', Object.keys(data[0] || {}));
  }

  const { data: metrics, error: metricsError } = await supabase.from('eco_metrics').select('*').limit(1);
  if (metricsError) {
    console.error('Error fetching metrics:', metricsError);
  } else {
    console.log('Metrics columns:', Object.keys(metrics[0] || {}));
  }
}
check();
