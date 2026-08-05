import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes('your-supabase')) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Connected to Supabase PostgreSQL Database.');
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    supabase = null;
  }
} else {
  console.log('Supabase credentials not configured. Backend will use local persistent DB store.');
}
