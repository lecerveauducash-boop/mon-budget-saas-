import { useState } from 'react';
import { createServerSupabase } from '../lib/supabaseServer';
import { createClient } from '../lib/supabaseClient';

export async function getServerSideProps({ req, res }) {
  const supabase = createServerSupabase(req, res);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  return { props: { email: user.email } };
}

export default function MotDePasse({ email }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage('Ton mot de passe a bien été enregistré. Tu peux maintenant l\'utiliser pour te connecter.');
      setPassword('');
      setConfirm('');
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: '80px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Mot de passe</h1>
      <p style={{ fontSize: 14, color: '#555' }}>
        Définis un mot de passe pour <strong>{email}</strong> afin de te connecter plus rapidement la prochaine fois, sans passer par un code envoyé par email.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          required
          placeholder="Nouveau mot de passe (8 caractères min.)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: 12, fontSize: 15, marginBottom: 12 }}
        />
        <input
          type="password"
          required
          placeholder="Confirme le mot de passe"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          style={{ width: '100%', padding: 12, fontSize: 15, marginBottom: 12 }}
        />
        <button type="submit" disabled={saving} style={{ width: '100%', padding: 12, background: '#1F3350', color: '#fff', border: 'none', borderRadius: 6 }}>
          {saving ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
        </button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p style={{ marginTop: 24 }}><a href="/dashboard" style={{ color: '#1F3350' }}>← Retour au dashboard</a></p>
    </main>
  );
}
