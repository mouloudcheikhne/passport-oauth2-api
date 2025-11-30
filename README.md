# Node Express Mongo Auth

Documentation en français pour le projet d'API d'authentification (email/password + Google OAuth2) utilisant Node.js, Express, MongoDB, Passport et JWT.

## Objectif

Fournir un backend d'authentification minimal permettant :

- Inscription (signup) par email/mot de passe
- Connexion (login) par email/mot de passe
- Authentification via Google OAuth2
- Protection de routes via JWT

## Structure du projet

Principaux fichiers et dossiers :

- `server.js` : point d'entrée de l'application
- `package.json` : dépendances et scripts
- `src/config` : configuration et lecture des variables d'environnement
  - `index.js` : export des variables d'environnement utilisées
  - `db.js` : connexion à MongoDB
- `src/models/User.js` : modèle Mongoose pour l'utilisateur
- `src/routes/auth.js` : endpoints d'authentification (signup, login, google)
- `src/routes/auth/googleStrategy.js` : stratégie Passport Google
- `src/middleware/auth.js` : middleware pour protéger les routes (vérifie le JWT)
- `src/utils/jwt.js` : fonctions utilitaires pour signer/vérifier les JWT

## Prérequis

- Node.js (recommandé 18+)
- npm
- MongoDB (local ou distant)
- Pour Google OAuth : créer un projet Google Cloud et obtenir `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`.

Il y a un fichier d'exemple `.env.example` à la racine montrant les variables nécessaires.

## Variables d'environnement

Les variables attendues (voir `.env.example`) :

- `PORT` : port d'écoute (ex: 5000)
- `MONGO_URI` : URL de connexion MongoDB
- `JWT_SECRET` : secret pour signer les JWT
- `JWT_EXPIRES_IN` : durée d'expiration des tokens (ex: `7d`)
- `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` : identifiants OAuth Google
- `GOOGLE_CALLBACK_URL` : callback OAuth (ex: `http://localhost:5000/auth/google/callback`)
- `FRONTEND_URL` : URL du front (utilisé pour redirections si nécessaire)

## Installation

1. Copier l'exemple d'env et remplir les valeurs :

```bash
cp .env.example .env
# puis éditez .env
```

2. Installer les dépendances :

```bash
npm install
```

3. Démarrer l'application :

```bash
# mode production
npm start

# mode développement (avec nodemon)
npm run dev
```

### Avec Docker

Le projet contient un `Dockerfile` et `docker-compose.yml`. Si vous avez Docker installé :

```bash
docker-compose up --build
```

## Endpoints principaux

Base: `http://localhost:<PORT>`

- POST `/auth/signup` — Body JSON: `{ name, email, password }` — crée un utilisateur et renvoie `{ token, user }`
- POST `/auth/login` — Body JSON: `{ email, password }` — renvoie `{ token, user }` si succès
- GET `/auth/google` — redirige vers Google pour autorisation
- GET `/auth/google/callback` — callback OAuth Google. Renvoie `{ token, user }` (JSON)
- GET `/protected` — exemple de route protégée (header `Authorization: Bearer <token>` requis)

Exemple curl (signup) :

```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass1234"}'
```

Exemple curl (protection) :

```bash
curl http://localhost:5000/protected -H "Authorization: Bearer <token>"
```
