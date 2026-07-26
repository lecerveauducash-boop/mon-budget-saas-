import fs from 'fs';
import path from 'path';
import { createServerSupabase } from '../../lib/supabaseServer';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  const supabase = createServerSupabase(req, res);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    res.status(401).send('Non autorisé — connecte-toi pour accéder à cette page.');
    return;
  }

  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .single();

  if (!sub || sub.status !== 'active') {
    res.status(403).send('Ton abonnement n\'est pas actif.');
    return;
  }

  // Le fichier HTML de l'application (celui qu'on a construit ensemble)
  // vit dans /private-app/budget.html — un dossier qui n'est PAS servi
  // publiquement par Next.js, uniquement lu ici côté serveur.
  const filePath = path.join(process.cwd(), 'private-app', 'budget.html');
  const html = fs.readFileSync(filePath, 'utf-8');

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
