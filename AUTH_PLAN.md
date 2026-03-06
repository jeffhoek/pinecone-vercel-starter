# Plan: Optional Google OAuth + Passphrase Fallback

## Goal

Make Google OAuth optional. Users who just clone and run the repo can set a
single `APP_PASSWORD` env var and get a working login page with no Google Cloud
setup required. Google OAuth remains available when its env vars are present.

## Auth provider logic

| Env vars present | Providers enabled |
|---|---|
| `APP_PASSWORD` only | Credentials (passphrase) |
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` only | Google OAuth |
| Both | Both (login page shows two options) |
| Neither | App starts but all logins fail — NextAuth requires at least one provider |

At startup, `src/lib/auth.ts` builds the providers array dynamically. No
providers are hard-coded as always-on.

## Login page behaviour

`src/app/login/page.tsx` calls NextAuth's `getProviders()` (hits
`/api/auth/providers`) at render time to discover which providers are active,
then conditionally renders:

- **Google button** — if `google` provider is present
- **Passphrase form** — if `credentials` provider is present
- **Divider** between them if both are present

The passphrase form has a single password field (no username). On submit it
calls `signIn("credentials", { password, callbackUrl })`.

## Files changed

| File | Change |
|---|---|
| `src/lib/auth.ts` | Build providers array from env vars; add `CredentialsProvider` when `APP_PASSWORD` is set |
| `src/app/login/page.tsx` | Call `getProviders()`, conditionally render Google button and/or passphrase form |
| `.env.example` | Add `APP_PASSWORD` with comment |
| `README.md` | Update auth section to describe both options |

`src/app/api/auth/[...nextauth]/route.ts` — **no change needed**, it just
re-exports `authOptions`.

## CredentialsProvider details

- Single field: `password` (labelled "Passphrase")
- `authorize()` compares the submitted value against `process.env.APP_PASSWORD`
  using a timing-safe comparison (`crypto.timingSafeEqual`) to avoid
  timing-based enumeration
- Returns a minimal user object `{ id: "local", name: "Local User" }` on
  success, `null` on failure
- NextAuth sessions work the same way as with OAuth

## Security notes

- `APP_PASSWORD` is a single shared passphrase (not per-user accounts). Fine
  for self-hosted / small team use; the README will say so.
- The Credentials provider requires `NEXTAUTH_SECRET` to be set (same as OAuth)
  — the middleware and session cookie encryption depend on it.
- `BYPASS_AUTH=true` continues to work for Playwright tests.

## What does NOT change

- Middleware route protection (`src/middleware.ts`) — unchanged
- `ALLOWED_EMAILS` email whitelist — still works with Google OAuth
- `NEXTAUTH_SECRET` — still required regardless of which provider is used
- All other env vars

## README update (auth section)

Replace the current "Authentication (Required)" section to show both options:

```
### Option A — Passphrase (no external accounts required)
Set APP_PASSWORD=yourpassphrase in .env. Users log in with that passphrase.

### Option B — Google OAuth
Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET. See GOOGLE_OAUTH_SETUP.md.
Both options can be active simultaneously.
```
