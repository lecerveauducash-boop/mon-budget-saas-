import Stripe from 'stripe';
import { createServerSupabase } from '../../lib/supabaseServer';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // 1. Vérifie que l'utilisateur est bien connecté
    const supabase = createServerSupabase(req, res);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: 'Non connecté' });
    }

    // 2. Récupère son stripe_customer_id enregistré par le webhook
    const { data: sub, error: subErr } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (subErr || !sub?.stripe_customer_id) {
      return res.status(404).json({ error: 'Aucun abonnement Stripe associé à ce compte' });
    }

    // 3. Crée une session du portail client Stripe et renvoie l'URL
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    });

    res.status(200).json({ url: portalSession.url });
  } catch (err) {
    console.error('Erreur création session portail Stripe:', err);
    res.status(500).json({ error: 'Erreur interne' });
  }
}
