
import { createClient } from '@supabase/supabase-js';

/**
 * Robustly fetch environment variables with hardcoded fallbacks 
 * for the THINCS portal.
 */
const getEnv = (key: string, fallback: string): string => {
  // Check for common ways env vars are exposed in frontend environments
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  
  // Safely check for Vite's import.meta.env
  try {
    const meta = import.meta as any;
    if (meta && meta.env && meta.env[key]) {
      return meta.env[key];
    }
  } catch (e) {
    // Silence errors in environments where import.meta is restricted
  }
  
  return fallback;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL', 'https://adwmmjcuochwngyfrfcm.supabase.co');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_CzC58IcQlkShXV-HQYFv_w_Ic5b850h');

if (!supabaseUrl || !supabaseKey || supabaseKey.startsWith('sb_publishable')) {
  console.warn("THINCS Warning: Supabase client initialized with default/placeholder configuration. Database connectivity may fail if these values have not been updated in your environment settings.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
