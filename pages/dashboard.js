import { useState } from 'react';
import { createServerSupabase } from '../lib/supabaseServer';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export async function getServerSideProps({ req, res }) {
  const supabase = createServerSupabase(req, res);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .single();

  if (!sub || sub.status !== 'active') {
    return { redirect: { destination: '/abonnement-inactif', permanent: false } };
  }

  return { props: { email: user.email } };
}

export default function Dashboard({ email }) {
  const [loadingPortal, setLoadingPortal] = useState(false);

  async function handleManageSubscription() {
    setLoadingPortal(true);
    try {
      const res = await fetch('/api/create-portal-session', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Impossible d'ouvrir la gestion de l'abonnement pour le moment.");
        setLoadingPortal(false);
      }
    } catch {
      alert("Une erreur est survenue.");
      setLoadingPortal(false);
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 20px', background: '#1F3350', color: '#fff', fontFamily: 'sans-serif', fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Connecté en tant que {email}</span>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button
            onClick={handleManageSubscription}
            disabled={loadingPortal}
            style={{ background: 'none', border: '1px solid #fff', color: '#fff', borderRadius: 4, padding: '4px 10px', fontSize: 13, cursor: 'pointer' }}
          >
            {loadingPortal ? 'Chargement...' : 'Gérer mon abonnement'}
          </button>
          <a href="/mot-de-passe" style={{ color: '#fff' }}>Mot de passe</a>
          <a href="/api/logout" style={{ color: '#fff' }}>Se déconnecter</a>
        </div>
      </div>
      {/* L'app budget est servie par une route API qui vérifie elle-même
          l'authentification et l'abonnement — même en copiant l'URL de
          l'iframe, personne d'autre ne peut y accéder sans être connecté. */}
      <iframe
        src="/api/budget-app"
        title="Mon Budget"
        style={{ flex: 1, border: 'none', width: '100%' }}
      />
    </div>
  );
}
