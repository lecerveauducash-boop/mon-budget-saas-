import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const featuresRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.2 }
    );
    featuresRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

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

  const features = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 7.5l9 6 9-6" />
        </svg>
      ),
      title: 'Enveloppes claires',
      text: "Répartissez votre salaire par catégorie et suivez ce qu'il vous reste, en temps réel.",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </svg>
      ),
      title: 'Historique complet',
      text: "Retrouvez chaque mois passé et comparez votre évolution d'un coup d'œil.",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
          <path d="M9.5 12l1.8 1.8L14.5 10" />
        </svg>
      ),
      title: 'Paiement sécurisé',
      text: 'Vos informations bancaires sont traitées par Stripe et ne transitent jamais par nos serveurs.',
    },
  ];

  return (
    <>
      <Head>
        <title>Mon Budget — Gérez votre budget simplement</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main className="page">
        <section className="hero">
          <div className="glow" />
          <div className="heroInner">
            <p className="eyebrow anim a1">Budget mensuel</p>
            <h1 className="anim a2">Mon Budget</h1>
            <p className="tagline anim a3">
              Répartissez votre salaire en enveloppes, mois après mois.
              Simple, visuel, sans prise de tête.
            </p>

            <div className="priceBox anim a4">
              <span className="priceAmount">9,99&nbsp;€</span>
              <span className="pricePeriod">/ mois</span>
            </div>

            <button className="cta anim a5" onClick={handleAcheter} disabled={loading}>
              {loading ? 'Redirection…' : "S'abonner maintenant"}
            </button>

            <p className="loginLine anim a6">
              Déjà abonné ? <a href="/login">Se connecter</a>
            </p>
          </div>
        </section>

        <section className="featuresWrap">
          <div className="divider" />
          <div className="features">
            {features.map((f, i) => (
              <div
                className="feature"
                key={f.title}
                ref={(el) => (featuresRef.current[i] = el)}
              >
                <div className="featureIcon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="footer">
          <p>Annulable à tout moment. Aucun engagement.</p>
        </footer>
      </main>

      <style jsx>{`
        :global(html, body) {
          margin: 0;
          padding: 0;
          background: #EAD9B8;
        }
        .page {
          font-family: 'Inter', sans-serif;
          color: #2A1E14;
        }

        .hero {
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg,
            #241E18 0%, #34211A 16%, #4B241D 32%, #6B2320 48%,
            #8A3524 62%, #A85833 75%, #C68449 86%, #DEB27E 95%, #EAD9B8 100%
          );
          color: #fff;
          padding: 96px 24px 150px;
        }
        .glow {
          position: absolute;
          top: -35%;
          left: -15%;
          width: 58%;
          height: 170%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.20), rgba(255,255,255,0.05) 45%, transparent 72%);
          animation: drift 12s cubic-bezier(.45,.05,.55,.95) infinite;
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        @keyframes drift {
          0%   { transform: translate(-8%, 6%) scale(0.92); opacity: 0.55; }
          50%  { transform: translate(66%, -22%) scale(1.2); opacity: 0.9; }
          100% { transform: translate(-8%, 6%) scale(0.92); opacity: 0.55; }
        }

        @keyframes riseIn {
          from { opacity: 0; transform: translateY(18px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .anim {
          opacity: 0;
          animation: riseIn 0.8s cubic-bezier(.22,1,.36,1) forwards;
        }
        .a1 { animation-delay: 0.05s; }
        .a2 { animation-delay: 0.20s; }
        .a3 { animation-delay: 0.38s; }
        .a4 { animation-delay: 0.56s; }
        .a5 { animation-delay: 0.72s; }
        .a6 { animation-delay: 0.86s; }

        .heroInner {
          position: relative;
          max-width: 560px;
          margin: 0 auto;
          text-align: center;
        }
        .eyebrow {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.68);
          margin: 0 0 14px;
        }
        h1 {
          font-size: clamp(34px, 6vw, 48px);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0 0 16px;
        }
        .tagline {
          font-size: 16px;
          line-height: 1.6;
          color: rgba(255,255,255,0.82);
          max-width: 420px;
          margin: 0 auto 40px;
        }

        .priceBox {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 6px;
          margin-bottom: 28px;
          font-family: 'IBM Plex Mono', monospace;
        }
        .priceAmount {
          font-size: 40px;
          font-weight: 700;
        }
        .pricePeriod {
          font-size: 15px;
          color: rgba(255,255,255,0.65);
        }

        .cta {
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.01em;
          padding: 16px 36px;
          border: none;
          border-radius: 10px;
          background: #9E2B25;
          color: #fff;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(0,0,0,0.25);
          transition: transform 0.12s ease, background 0.15s ease;
        }
        .cta:hover:not(:disabled) {
          background: #7A211C;
          transform: translateY(-1px);
        }
        .cta:active:not(:disabled) {
          transform: scale(0.97);
        }
        .cta:disabled {
          opacity: 0.75;
          cursor: default;
        }
        .cta::after {
          content: "";
          position: absolute;
          top: 0; bottom: 0; left: -60%;
          width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          transform: skewX(-20deg);
          transition: left 0.55s ease;
        }
        .cta:hover:not(:disabled)::after {
          left: 130%;
        }

        .loginLine {
          margin-top: 22px;
          font-size: 13.5px;
          color: rgba(255,255,255,0.7);
        }
        .loginLine a {
          color: #fff;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .featuresWrap {
          max-width: 900px;
          margin: -90px auto 0;
          padding: 0 24px 70px;
          position: relative;
        }
        .divider {
          width: 56px;
          height: 2px;
          background: linear-gradient(90deg, #9E2B25, #B8860B);
          margin: 0 auto 56px;
          border-radius: 2px;
          opacity: 0;
          animation: riseIn 0.6s cubic-bezier(.22,1,.36,1) 0.9s forwards;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 44px;
        }
        .feature {
          text-align: center;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1);
        }
        .feature.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .feature:nth-child(1) { transition-delay: 0s; }
        .feature:nth-child(2) { transition-delay: 0.12s; }
        .feature:nth-child(3) { transition-delay: 0.24s; }

        .featureIcon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C68449, #9E2B25);
          box-shadow: 0 4px 14px rgba(158,43,37,0.28);
        }
        .feature h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 10px;
          letter-spacing: -0.01em;
          color: #2A1E14;
        }
        .feature p {
          font-size: 14px;
          line-height: 1.65;
          color: #6B5B45;
          margin: 0;
        }

        .footer {
          text-align: center;
          padding: 0 24px 60px;
          font-size: 12.5px;
          color: #8A7C64;
        }

        @media (max-width: 640px) {
          .hero { padding: 72px 20px 130px; }
          .features { grid-template-columns: 1fr; gap: 40px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .anim, .divider { animation: none; opacity: 1; }
          .feature { opacity: 1; transform: none; transition: none; }
          .glow { animation: none; }
        }
      `}</style>
    </>
  );
}
