# Mon Budget — SaaS avec comptes protégés

## Ce que fait ce projet
- Un client paie un abonnement via Stripe
- Un compte lui est automatiquement créé dans Supabase, lié à SON email
- Il reçoit un email pour se connecter (lien magique, pas de mot de passe à retenir)
- Une fois connecté, il voit UNIQUEMENT ses propres données de budget — vérifié côté serveur, donc impossible à contourner en trafiquant l'URL
- Si son abonnement est annulé, l'accès est automatiquement coupé

## Étapes de mise en ligne

### 1. Supabase
1. Va dans ton projet Supabase → **SQL Editor** → colle le contenu de `supabase-schema.sql` → **Run**
2. Va dans **Authentication → Providers** → vérifie que "Email" est activé
3. Va dans **Authentication → URL Configuration** → ajoute l'URL de ton site (ex. `https://tonsite.com`) dans "Redirect URLs"
4. Récupère tes clés dans **Project Settings → API** :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secret !) → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Stripe
1. Crée ton produit d'abonnement (**Product catalog → Add product**), prix 14,99€/mois → note l'ID du prix (`price_...`) → `STRIPE_PRICE_ID`
2. Récupère ta clé secrète dans **Developers → API keys** → `STRIPE_SECRET_KEY`
3. Le webhook sera configuré à l'étape 4 (il faut d'abord connaître l'URL du site déployé)

### 3. Déployer sur Vercel
1. Pousse ce dossier dans un nouveau dépôt GitHub
2. Sur Vercel : "Add New Project" → importe ce dépôt
3. Dans les paramètres du projet Vercel → **Environment Variables**, ajoute toutes les variables listées dans `.env.local.example` avec tes vraies valeurs
4. Déploie

### 4. Connecter le webhook Stripe
1. Une fois le site en ligne, va dans Stripe → **Developers → Webhooks → Add endpoint**
2. URL : `https://tonsite.com/api/webhook`
3. Événements à écouter : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Stripe te donne un "Signing secret" (`whsec_...`) → ajoute-le comme `STRIPE_WEBHOOK_SECRET` dans Vercel → redéploie

### 5. Tester
1. Ouvre ton site → clique "S'abonner" → utilise une carte de test Stripe (`4242 4242 4242 4242`, n'importe quelle date future, n'importe quel CVC) en mode test
2. Vérifie dans Supabase (**Authentication → Users**) qu'un compte a bien été créé
3. Vérifie ta boîte mail pour le lien de connexion
4. Connecte-toi → tu dois voir l'application budget, propre à ce compte

## Limites à connaître
- Rien n'empêche à 100% qu'un client partage volontairement son accès avec quelqu'un d'autre (aucun logiciel ne le peut totalement). Ce système empêche l'accès sans compte ni paiement, ce qui couvre l'essentiel du besoin.
- Les emails automatiques (compte créé, lien de connexion) utilisent le service email intégré à Supabase, limité en volume sur le plan gratuit. Pour un usage sérieux à plusieurs dizaines de clients/mois, connecte un vrai service d'envoi (Resend, Postmark) dans Supabase → Authentication → Email settings.
