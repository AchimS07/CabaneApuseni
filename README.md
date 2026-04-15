# CabaneApuseni

Next.js + Firebase web app for listing and booking cabins.

## Run locally

### 1) Prerequisites
- Node.js 20+ (recommended)
- npm
- A Firebase project (for auth/data features)

### 2) Install dependencies
```bash
npm install
```

### 3) Configure environment variables
```bash
cp .env.example .env.local
```

Then edit `.env.local`:
- Fill all `NEXT_PUBLIC_FIREBASE_*` values from Firebase project settings
- Set `SESSION_SECRET` to a long random value (64+ chars)
- If you use server-side Firebase Admin features, also set:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY` (replace line breaks with `\n`)

### 4) Start the app
```bash
npm run dev
```

Open: http://localhost:3000

## Useful scripts

```bash
npm run dev          # start local dev server
npm run build        # production build
npm run start        # run production build locally
npm run type-check   # TypeScript checks
npm run test         # run tests
npm run test:coverage
```

## Useful notes
- Keep `.env.local` private; never commit secrets.
- If auth/firestore/storage features fail locally, re-check Firebase keys and project IDs first.
- `NEXT_PUBLIC_*` variables are exposed to the browser; keep sensitive values in server-only vars.
