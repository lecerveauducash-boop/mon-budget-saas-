import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '../lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('password'); // 'password' | 'code-request' | 'code-verify'
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (router.query.error) {
      setError("Le lien de connexion a expiré ou a déjà été utilisé. Utilise le mot de passe ou redemande un code ci-dessous.");
    }
  }, [router.query.error]);

  async function handlePasswordLogin(e) {
    e.preventDefault();
    setError('');
    setSending(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setSending(false);
    if (error) {
      setError("Email ou mot de passe incorrect, ou aucun mot de passe défini pour ce compte. Utilise le code par email ci-dessous.");
    } else {
      window.location.href = '/dashboard';
    }
  }

  async function handleRequestCode(e) {
    e.preventDefault();
    setError('');
    setSending(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard` },
    });

    setSending(false);
    if (error) setError(error.message);
    else setMode('code-verify');
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    setError('');
    setSending(true);
    const supabase = createClient();

    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });

    setSending(false);
    if (error) {
      setError("Code incorrect ou expiré. Vérifie le code reçu par email, ou redemande-en un nouveau.");
    } else {
      window.location.href = '/dashboard';
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: '80px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Connexion</h1>

      {mode === 'password' && (
        <form onSubmit={handlePasswordLogin}>
          <input
            type="email"
            required
            placeholder="ton-email@exemple.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: 12, fontSize: 15, marginBottom: 12 }}
          />
          <input
            type="password"
            required
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 12, fontSize: 15, marginBottom: 12 }}
          />
          <button type="submit" disabled={sending} style={{ width: '100%', padding: 12, background: '#1F3350', color: '#fff', border: 'none', borderRadius: 6 }}>
            {sending ? 'Connexion...' : 'Se connecter'}
          </button>
          <p style={{ fontSize: 13, marginTop: 12 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); setError(''); setMode('code-request'); }} style={{ color: '#1F3350' }}>
              Pas de mot de passe ? Recevoir un code par email
            </a>
          </p>
        </form>
      )}

      {mode === 'code-request' && (
        <form onSubmit={handleRequestCode}>
          <input
            type="email"
            required
            placeholder="ton-email@exemple.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: 12, fontSize: 15, marginBottom: 12 }}
          />
          <button type="submit" disabled={sending} style={{ width: '100%', padding: 12, background: '#1F3350', color: '#fff', border: 'none', borderRadius: 6 }}>
            {sending ? 'Envoi...' : 'Recevoir mon code de connexion'}
          </button>
          <p style={{ fontSize: 13, marginTop: 12 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); setError(''); setMode('password'); }} style={{ color: '#1F3350' }}>
              ← Se connecter avec un mot de passe
            </a>
          </p>
        </form>
      )}

      {mode === 'code-verify' && (
        <>
          <p>Un email vient d'être envoyé à <strong>{email}</strong>.</p>
          <p style={{ fontSize: 14, color: '#555' }}>Entre le code reçu par email :</p>
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
            <button type="submit" disabled={sending} style={{ width: '100%', padding: 12, background: '#1F3350', color: '#fff', border: 'none', borderRadius: 6 }}>
              {sending ? 'Vérification...' : 'Valider le code'}
            </button>
          </form>
        </>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
}
