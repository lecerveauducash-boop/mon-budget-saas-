export default function AbonnementInactif() {
  return (
    <main style={{ maxWidth: 480, margin: '80px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Abonnement inactif</h1>
      <p>Ton compte existe mais aucun abonnement actif n'y est associé (paiement expiré ou annulé).</p>
      <a href="/" style={{ color: '#1F3350', fontWeight: 'bold' }}>Revenir à la page d'abonnement</a>
    </main>
  );
}
