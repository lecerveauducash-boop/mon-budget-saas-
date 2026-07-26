import { createServerSupabase } from '../../lib/supabaseServer';

export default async function handler(req, res) {
  const supabase = createServerSupabase(req, res);
  await supabase.auth.signOut();
  res.redirect('/login');
}
