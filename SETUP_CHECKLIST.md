# Setup Checklist

Quick checklist to get your authenticated RAG chatbot running.

## Prerequisites

- [ ] Node.js installed
- [ ] Google account
- [ ] OpenAI API key
- [ ] Pinecone account with an index

## Step 1: Google OAuth Setup (15 minutes)

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create a new project (or select existing)
- [ ] Navigate to **APIs & Services > OAuth consent screen**
- [ ] Configure consent screen:
  - [ ] Select "External" user type
  - [ ] Fill in app name and contact email
  - [ ] Save and continue through all steps
- [ ] Navigate to **APIs & Services > Credentials**
- [ ] Click **Create Credentials > OAuth client ID**
- [ ] Select "Web application"
- [ ] Add authorized JavaScript origin: `http://localhost:3000`
- [ ] Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] Click **Create**
- [ ] Copy the **Client ID** and **Client Secret**

**Detailed instructions**: See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

## Step 2: Environment Variables (5 minutes)

- [ ] Copy `.env.example` to `.env`:
  ```bash
  cp .env.example .env
  ```

- [ ] Generate NextAuth secret:
  ```bash
  openssl rand -base64 32
  ```

- [ ] Fill in `.env` file with your credentials:
  ```bash
  # OpenAI
  OPENAI_API_KEY=sk-...

  # Pinecone
  PINECONE_API_KEY=...
  PINECONE_CLOUD=aws
  PINECONE_REGION=us-west-2
  PINECONE_INDEX=your-index-name

  # NextAuth
  NEXTAUTH_URL=http://localhost:3000
  NEXTAUTH_SECRET=<paste generated secret>

  # Google OAuth
  GOOGLE_CLIENT_ID=<paste from step 1>
  GOOGLE_CLIENT_SECRET=<paste from step 1>
  ```

## Step 3: Install & Run (2 minutes)

- [ ] Install dependencies:
  ```bash
  npm install
  ```

- [ ] Start development server:
  ```bash
  npm run dev
  ```

- [ ] Open browser to `http://localhost:3000`

## Step 4: Test Authentication (2 minutes)

- [ ] You should be redirected to login page
- [ ] Click "Sign in with Google"
- [ ] Authorize the app
- [ ] You should see the chatbot interface
- [ ] Verify user menu appears in top-left corner
- [ ] Click user menu and verify sign out works

## Optional: Google Docs Access

If you want to crawl private Google Docs:

- [ ] Follow [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)
- [ ] Create service account
- [ ] Enable Google Drive API
- [ ] Download service account JSON key
- [ ] Minify JSON: `cat key.json | jq -c`
- [ ] Add to `.env`:
  ```bash
  GOOGLE_SERVICE_ACCOUNT_KEY='<paste minified JSON>'
  ```
- [ ] Share Google Docs with service account email

## Optional: Email Whitelist

To restrict access to specific emails:

- [ ] Edit `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Uncomment the email whitelist code
- [ ] Add to `.env`:
  ```bash
  ALLOWED_EMAILS=user1@gmail.com,user2@gmail.com
  ```
- [ ] Restart dev server

## Vercel Deployment

- [ ] Push code to GitHub
- [ ] Import project in Vercel
- [ ] Add environment variables in Vercel:
  - [ ] `OPENAI_API_KEY`
  - [ ] `PINECONE_API_KEY`
  - [ ] `PINECONE_CLOUD`
  - [ ] `PINECONE_REGION`
  - [ ] `PINECONE_INDEX`
  - [ ] `NEXTAUTH_URL` (set to your Vercel domain)
  - [ ] `NEXTAUTH_SECRET` (same as local)
  - [ ] `GOOGLE_CLIENT_ID` (same as local)
  - [ ] `GOOGLE_CLIENT_SECRET` (same as local)
  - [ ] (Optional) `GOOGLE_SERVICE_ACCOUNT_KEY`
  - [ ] (Optional) `ALLOWED_EMAILS`

- [ ] Update Google OAuth redirect URIs:
  - [ ] Add production origin: `https://your-domain.vercel.app`
  - [ ] Add production redirect: `https://your-domain.vercel.app/api/auth/callback/google`

- [ ] Deploy

## Troubleshooting

### Can't sign in locally?

1. Check `.env` file has all required variables
2. Make sure redirect URI in Google Console matches exactly
3. Clear browser cookies and try again

### "Redirect URI mismatch" error?

- Verify redirect URI in Google Console: `http://localhost:3000/api/auth/callback/google`
- Make sure there are no trailing slashes

### Session not persisting?

- Make sure `NEXTAUTH_SECRET` is set
- Clear browser cookies
- Restart dev server

### Need more help?

See detailed documentation:
- [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) - OAuth setup guide
- [AUTHENTICATION_SUMMARY.md](./AUTHENTICATION_SUMMARY.md) - Implementation details
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Deployment guide

---

**Total setup time: ~30 minutes**

Once complete, your chatbot will be protected and only accessible to authorized users!
