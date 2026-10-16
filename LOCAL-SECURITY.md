# Sécurité analyse — validation locale

## Variables (`.env` et/ou `.env.local`)

| Nom | Rôle |
|-----|------|
| `ANALYZE_SECRET` | Badge d’entrée API (à noter chez toi) |
| `OPENAI_API_KEY` | Clé OpenAI (requis pour une vraie analyse) |
| `ALLOWED_ORIGINS` | Domaines autorisés (CORS) |
| `ANALYZE_RATE_LIMIT` | Max appels / IP / fenêtre (défaut 20) |

`vercel dev` lit surtout `.env` — garde `ANALYZE_SECRET` dedans pour le local.

Helpers d’auth : `soointelligence/security.js` (pas `.mjs`, pour le build Vercel).

## Lancer l’API en local

```bash
cd soohwa-intelligence-api
# Ne pas passer par npm run dev (récursion Vercel)
vercel dev --listen 3000
```

## Tester l’auth (sans casser la prod)

```bash
npm run test:auth
```

Attendu (déjà validé) :
- sans secret → **401**
- avec secret → auth OK ; **500** si `OPENAI_API_KEY` manquant, **200** si OpenAI OK

## Thème (local uniquement)

Dans l’éditeur de thème (thème **dev**, pas live) section diagnostic :
- **URL API analyse** → `http://127.0.0.1:3000/api/analyze`
- **Secret API analyse** → la valeur de `ANALYZE_SECRET`

Ne pas pousser en live tant que Vercel prod n’a pas le même `ANALYZE_SECRET`.

## Clé OpenAI en local (obligatoire pour les photos)

Vercel marque `OPENAI_API_KEY` comme **Sensitive** : `vercel env pull` ne récupère pas la vraie valeur.

Pour valider SooScan en local, colle la clé dans `.env` (et `.env.local`) :

```bash
OPENAI_API_KEY=sk-...
```

Puis relance `vercel dev --listen 3000`.

Sans cette clé, l’API répond `OPENAI_API_KEY missing` et le thème ignore les photos (bannière « Ajouter des vues » reste).
