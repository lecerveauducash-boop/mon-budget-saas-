import Stripe from 'stripe';
import { buffer } from 'micro';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe a besoin du corps brut de la requête pour vérifier la signature,
// donc on désactive le parsing automatique de Next.js.
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Signature webhook invalide:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const email = session.customer_details?.email;
        const stripeCustomerId = session.customer;
        const stripeSubscriptionId = session.subscription;

        if (!email) break;

        // 1. Crée le compte utilisateur Supabase (ou récupère l'existant)
        let userId;
        const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
        const found = existing?.users?.find(u => u.email === email);

        if (found) {
          userId = found.id;
        } else {
          const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
          });
          if (createErr) throw createErr;
          userId = created.user.id;
        }

        // 2. Enregistre / met à jour l'abonnement, lié à ce seul compte
        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          email,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          status: 'active',
        }, { onConflict: 'user_id' });

        // 3. Envoie un email au client pour qu'il définisse son mot de passe
        //    et accède à son compte personnel (lien magique à usage unique).
        await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email,
          options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard` },
        });
        // Note : par défaut Supabase envoie cet email automatiquement.
        // Personnalise le modèle dans Supabase > Authentication > Email Templates.

        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const status = sub.status === 'active' ? 'active' : 'inactive';
        await supabaseAdmin
          .from('subscriptions')
          .update({ status })
          .eq('stripe_subscription_id', sub.id);
        break;
      }

      default:
        break; // les autres événements sont ignorés
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Erreur traitement webhook:', err);
    res.status(500).json({ error: 'Erreur interne' });
  }
}
