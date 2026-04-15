# CabaneApuseni - Minimal Next.js Starter

This repository contains a minimal Next.js starter structure.

## Run locally

```bash
npm install
cp .env.local.example .env.local
```

Then open `.env.local` and fill in your **Firebase Client + Admin SDK** values before starting the app:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → General → Your apps (Web app config) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same Web app config (`authDomain`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Same Web app config (`projectId`) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Same Web app config (`storageBucket`) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Same Web app config (`messagingSenderId`) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Same Web app config (`appId`) |
| `FIREBASE_PROJECT_ID` | Firebase project id (usually same as `NEXT_PUBLIC_FIREBASE_PROJECT_ID`) |
| `FIREBASE_CLIENT_EMAIL` | Firebase Console → Project Settings → Service Accounts → Generate new private key → `client_email` |
| `FIREBASE_PRIVATE_KEY` | Same JSON → `private_key` (replace literal newlines with `\n`) |
| `SESSION_SECRET` | Generate with `openssl rand -hex 32` |

```bash
npm run dev
```

The app will fail fast at startup if required Firebase env vars are missing or invalid.

## Quality checks

Run local automated checks before opening a PR:

```bash
npm run type-check
npm test
```

Pull requests to `main` also run these checks automatically in GitHub Actions.
