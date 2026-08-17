import { createServerSupabase } from '../../../lib/supabaseServer';

// Cette route reçoit le "code" que Supabase ajoute à l'URL après avoir
// validé le lien de connexion envoyé par email. Elle échange ce code
// contre une vraie session (cookies), puis redirige vers le dashboard.
// Sans cette étape, le lien de connexion ne sert à rien : le code reste
// dans l'URL et personne n'est jamais réellement connecté.
export default async function handler(req, res) {
  const { code, next = '/dashboard' } = req.query;

  if (code) {
    const supabase = createServerSupabase(req, res);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      res.redirect(`/login?error=${encodeURIComponent(error.message)}`);
      return;
    }
  }

  res.redirect(next);
}
