import { createServerSupabase } from '../../lib/supabaseServer';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  const supabase = createServerSupabase(req, res);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    res.status(401).json({ error: 'Non autorisé' });
    return;
  }

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('budget_data')
      .select('data')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = pas encore de ligne, c'est normal
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ data: data?.data || null });
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    // req.body est déjà parsé par Next.js par défaut ici (bodyParser actif)
    const payload = req.body;

    const { error } = await supabaseAdmin
      .from('budget_data')
      .upsert({ user_id: user.id, data: payload, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).end();
}
