export default function Merci() {
  return (
    <main style={{ maxWidth: 480, margin: '80px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Merci pour ton abonnement 🎉</h1>
      <p>
        Un email vient de t'être envoyé avec un lien pour accéder à ton compte personnel.
        Vérifie ta boîte de réception (et les spams, au cas où).
      </p>
      <a href="/login" style={{ color: '#1F3350', fontWeight: 'bold' }}>Se connecter</a>
    </main>
  );
}
