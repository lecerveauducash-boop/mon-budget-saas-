import { useState } from 'react';
import { createClient } from '../lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    const supabase = createClient();

    // Connexion sans mot de passe : Supabase envoie un lien magique.
    // Simple, sécurisé, et évite les mots de passe faibles/réutilisés.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });

    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main style={{ maxWidth: 420, margin: '80px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Connexion</h1>
      {sent ? (
        <p>Un lien de connexion vient d'être envoyé à <strong>{email}</strong>. Ouvre-le pour accéder à ton budget.</p>
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
