// src/supabase.ts
import dotenv from 'dotenv';
dotenv.config();            // ← load .env BEFORE reading process.env

import { createClient } from '@supabase/supabase-js';


// … existing imports …
console.log(
  'Supabase service-role key (first 10 chars):',
  process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10)
);

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Public client (for front-end calls, limited permissions)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client (server-side, full permissions)
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);
