import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);

  async function handleAcheter() {
    setLoading(true);
    const res = await fetch('/api/create-checkout-session', { method: 'POST' });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url; // redirige vers la page de paiement Stripe
    } else {
      alert("Une erreur est survenue, réessaie dans un instant.");
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: '80px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Mon Budget</h1>
      <p>Gère ton budget mensuel simplement, avec historique et graphiques.</p>
      <button
        onClick={handleAcheter}
        disabled={loading}
        style={{
          padding: '14px 28px',
          fontSize: '16px',
          background: '#1F3350',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Redirection...' : "S'abonner — 9,99 €/mois"}
      </button>
      <p style={{ marginTop: 24, fontSize: 14, opacity: 0.7 }}>
        Déjà abonné ? <a href="/login">Se connecter</a>
      </p>
    </main>
  );
}
