import { createClient } from '@supabase/supabase-js';

// Utilise la clé "service role" : accès total, uniquement utilisée
// dans du code serveur (pages/api/*), jamais côté navigateur.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
