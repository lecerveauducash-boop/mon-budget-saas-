import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '../lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (router.query.error) {
      setError("Le lien de connexion a expiré ou a déjà été utilisé. Demande-en un nouveau ci-dessous.");
    }
  }, [router.query.error]);

  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    const supabase = createClient();

    // Connexion sans mot de passe : Supabase envoie un lien magique ET un
    // code à 6 chiffres dans le même email. Le lien peut être "grillé" par
    // les scanners automatiques de sécurité des boîtes mail (Gmail, etc.)
    // avant même que la personne ne clique dessus ; le code, lui, ne peut
    // pas être consommé par un robot, donc c'est l'option la plus fiable.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard` },
    });

    if (error) setError(error.message);
    else setSent(true);
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    setError('');
    setVerifying(true);
    const supabase = createClient();

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });

    setVerifying(false);
    if (error) {
      setError("Code incorrect ou expiré. Vérifie le code reçu par email, ou redemande-en un nouveau.");
    } else {
      window.location.href = '/dashboard';
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: '80px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Connexion</h1>
      {sent ? (
        <>
          <p>Un email vient d'être envoyé à <strong>{email}</strong>.</p>
          <p style={{ fontSize: 14, color: '#555' }}>
            Clique sur le lien reçu, ou entre directement le code à 6 chiffres ci-dessous (plus fiable) :
          </p>
          <form onSubmit={handleVerifyCode}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              placeholder="Code reçu par email"
              value={code}
              onChange={e => setCode(e.target.value)}
              style={{ width: '100%', padding: 12, fontSize: 20, letterSpacing: 4, textAlign: 'center', marginBottom: 12 }}
            />
            <button type="submit" disabled={verifying} style={{ width: '100%', padding: 12, background: '#1F3350', color: '#fff', border: 'none', borderRadius: 6 }}>
              {verifying ? 'Vérification...' : 'Valider le code'}
            </button>
          </form>
        </>
      ) : (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            required
            placeholder="ton-email@exemple.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: 12, fontSize: 15, marginBottom: 12 }}
          />
          <button type="submit" style={{ width: '100%', padding: 12, background: '#1F3350', color: '#fff', border: 'none', borderRadius: 6 }}>
            Recevoir mon lien de connexion
          </button>
        </form>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
}
