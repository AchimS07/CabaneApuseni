# CabaneApuseni - Minimal Next.js Starter

This repository contains a minimal Next.js starter structure.

## Run locally

```bash
npm install
cp .env.local.example .env.local
```

Then open `.env.local` and fill in the **Firebase Admin SDK** values before starting the app:

| Variable | Where to find it |
|---|---|
| `FIREBASE_PROJECT_ID` | Firebase project id (for this repo: `apusenirental`) |
| `FIREBASE_CLIENT_EMAIL` | Firebase Console → Project Settings → Service Accounts → Generate new private key → `client_email` |
| `FIREBASE_PRIVATE_KEY` | Same JSON → `private_key` (replace literal newlines with `\n`) |
| `SESSION_SECRET` | Generate with `openssl rand -hex 32` |

```bash
npm run dev
```

The public Firebase client config (`NEXT_PUBLIC_*`) is pre-filled in `.env.local.example` and works without changes for the `apusenirental` project.

## Quality checks

Run local automated checks before opening a PR:

```bash
npm run type-check
npm test
```

Pull requests to `main` also run these checks automatically in GitHub Actions.
