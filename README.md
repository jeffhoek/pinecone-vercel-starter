# Pinecone RAG Chatbot

[![Playwright Tests](https://github.com/jeffhoek/pinecone-vercel-starter/actions/workflows/playwright.yml/badge.svg)](https://github.com/jeffhoek/pinecone-vercel-starter/actions/workflows/playwright.yml)

A Retrieval Augmented Generation (RAG) chatbot built with Next.js, Pinecone, and OpenAI. This application crawls web pages and Google Docs to create a knowledge base, then uses semantic search to provide accurate, context-aware responses.

> NOTE: This repo originated as a fork of [pinecone-vercel-starter](https://github.com/nicoalbanese/pinecone-vercel-starter/tree/main). Several vibe-coded enhancements (using Claude Code) have been made including:

- Basic UI/branding customizations
- Data preparation and ingest from Google Docs
- Authentication for ingest from private Google Docs
- Optional admin panel
- User authentication using OAuth2 and allow list
- Fixes for CVEs and vulnerabilities

## Architecture Overview

- **Frontend**: Next.js with React, using Vercel AI SDK's `useChat` hook for streaming responses
- **Vector Database**: Pinecone for storing and querying document embeddings
- **LLM**: OpenAI GPT for generating responses
- **Authentication**: NextAuth.js (passphrase or Google OAuth)
- **Deployment**: Vercel Edge Functions

### Key Components

- **Chat Interface** ([`src/app/page.tsx`](src/app/page.tsx)) - Main UI with message history and input
- **API Routes**:
  - Chat endpoint ([`src/app/api/chat/route.ts`](src/app/api/chat/route.ts)) - Handles chat requests with context injection
  - Crawl endpoint ([`src/app/api/crawl/route.ts`](src/app/api/crawl/route.ts)) - Crawls and indexes URLs
  - Context endpoint ([`src/app/api/context/route.ts`](src/app/api/context/route.ts)) - Retrieves relevant document chunks
- **Utilities**:
  - Crawler ([`src/app/api/crawl/crawler.ts`](src/app/api/crawl/crawler.ts)) - Web scraping with depth control
  - Embeddings ([`src/app/utils/embeddings.ts`](src/app/utils/embeddings.ts)) - OpenAI embedding generation
  - Context retrieval ([`src/app/utils/context.ts`](src/app/utils/context.ts)) - Semantic search in Pinecone
  - Query preprocessing ([`src/app/utils/queryPreprocessing.ts`](src/app/utils/queryPreprocessing.ts)) - Query enhancement

## Quick Start

### Prerequisites

- Node.js 18+
- [Pinecone](https://www.pinecone.io) account with a 1536-dimension cosine index
- [OpenAI](https://platform.openai.com) API key
- One auth method configured (see Step 1 below)

### Setup Checklist

**Step 1: Choose an auth method** — at least one is required

**Option A — Passphrase** (simplest, no external accounts):

```bash
APP_PASSWORD=your-chosen-passphrase
```

Anyone with the passphrase can log in. Good for self-hosted or small team use.

**Option B — Google OAuth** (~15 min) — see [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) for full details

- [ ] Create Google Cloud project → **APIs & Services > OAuth consent screen** → configure as External
- [ ] **APIs & Services > Credentials > Create Credentials > OAuth client ID** (Web application)
- [ ] Add authorized JavaScript origin: `http://localhost:3000`
- [ ] Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] Copy the Client ID and Client Secret into `.env` as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

Both options can be active at the same time — the login page shows whichever providers are configured.

**Step 2: Environment variables** (~5 min)

```bash
cp .env.example .env
openssl rand -base64 32   # paste output as NEXTAUTH_SECRET
```

Minimum `.env` for passphrase auth:

```bash
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=pc-...
PINECONE_CLOUD=aws
PINECONE_REGION=us-east-1
PINECONE_INDEX=your-index-name
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generated above>
APP_PASSWORD=<your-chosen-passphrase>
```

**Step 3: Install and run**

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to the login page. Sign in with your chosen method and you'll land on the chatbot.

**Step 4: Optional — Google Docs access**

To crawl private Google Docs, set up a service account. See [GOOGLE_AUTH_SETUP.md](GOOGLE_AUTH_SETUP.md).

```bash
# Minify the downloaded service account JSON to a single line:
cat key.json | jq -c
# Paste output as GOOGLE_SERVICE_ACCOUNT_KEY in .env
```

Share each target Google Doc with the service account email (Viewer access).

**Step 5: Optional — restrict by email**

To allow only specific users, set `ALLOWED_EMAILS` in `.env` and uncomment the email whitelist in `src/app/api/auth/[...nextauth]/route.ts`.

```bash
ALLOWED_EMAILS=user1@gmail.com,user2@gmail.com
```

## Configuration

### Admin Panel

The right-hand admin panel lets you crawl URLs, clear the index, and configure chunking. Control visibility with:

```bash
NEXT_PUBLIC_SHOW_ADMIN_PANEL=true   # local development (default)
NEXT_PUBLIC_SHOW_ADMIN_PANEL=false  # production (hides panel, disables context API calls)
```

When hidden, the chat takes the full width and context fetching is skipped for a slight performance gain.

### Authentication

All routes are protected. At least one provider must be configured or nobody can log in.

| Provider | Env vars needed | Notes |
|---|---|---|
| Passphrase | `APP_PASSWORD` | Single shared passphrase, no external accounts |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Per-user, supports `ALLOWED_EMAILS` whitelist |

Implementation: [`src/lib/auth.ts`](src/lib/auth.ts), [`src/middleware.ts`](src/middleware.ts).
Protected routes redirect to `/login`. Unprotected: `/api/auth/*`, `/login`, `/_next/*`.

## How It Works

### 1. Document Ingestion

The crawler ([`crawler.ts`](src/app/api/crawl/crawler.ts)) fetches HTML, converts it to Markdown, and follows links breadth-first. Documents are split into chunks ([`seed.ts`](src/app/api/crawl/seed.ts)) using either:

- **Recursive**: Fixed-size chunks with overlap
- **Markdown**: Splits on headers to preserve semantic structure

Each chunk is embedded with OpenAI's `text-embedding-ada-002` and stored in Pinecone with URL and text metadata.

### 2. Query Processing

1. **Query preprocessing** ([`queryPreprocessing.ts`](src/app/utils/queryPreprocessing.ts)): Strips stop words and question words before embedding (`"Does Jaco have health concerns?"` → `"jaco health concerns"`), improving cosine similarity against document embeddings. The original query is still passed to the LLM.

2. **Semantic search** ([`context.ts`](src/app/utils/context.ts)): The preprocessed query is embedded and matched against Pinecone (top-3 chunks, min score 0.7).

3. **Context injection** ([`chat/route.ts`](src/app/api/chat/route.ts)): Retrieved chunks are prepended to the system prompt; OpenAI generates a response grounded in that context.

4. **Streaming**: Response is streamed back via Vercel AI SDK.

### 3. UI Components

- **Chat Interface** ([`Chat/index.tsx`](src/app/components/Chat/index.tsx)): Message input and display using `useChat` hook
- **Messages** ([`Chat/Messages.tsx`](src/app/components/Chat/Messages.tsx)): Renders conversation history
- **Context Panel** ([`Context/index.tsx`](src/app/components/Context/index.tsx)): Shows which document chunks were used (admin only)

## Deployment

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for full step-by-step instructions including Pinecone index setup, troubleshooting function timeouts, and viewing logs.

### Required Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Pinecone
PINECONE_API_KEY=pc-...
PINECONE_CLOUD=aws
PINECONE_REGION=us-east-1
PINECONE_INDEX=your-index-name

# NextAuth (required)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-app.vercel.app

# Auth — at least one of the following blocks is required

# Option A: Passphrase
APP_PASSWORD=...

# Option B: Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Optional
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
ALLOWED_EMAILS=user1@example.com,user2@example.com
NEXT_PUBLIC_SHOW_ADMIN_PANEL=false
```

If using Google OAuth, also add the production redirect URI in Google Cloud Console:
`https://your-app.vercel.app/api/auth/callback/google`.

## Testing

```bash
npm run test:e2e   # run Playwright tests
npm run test:show  # view test report
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Chat endpoint with context injection
│   │   ├── context/route.ts       # Context retrieval endpoint
│   │   ├── crawl/
│   │   │   ├── route.ts           # Crawl endpoint
│   │   │   ├── crawler.ts         # Web crawler implementation
│   │   │   └── seed.ts            # Document embedding & indexing
│   │   └── clearIndex/route.ts    # Index management
│   ├── components/
│   │   ├── Chat/                  # Chat UI components
│   │   └── Context/               # Admin panel components
│   └── utils/
│       ├── context.ts             # Semantic search logic
│       ├── embeddings.ts          # OpenAI embedding generation
│       ├── queryPreprocessing.ts  # Query enhancement
│       └── googleDrive.ts         # Google Docs integration
├── lib/
│   └── auth.ts                    # NextAuth configuration
└── middleware.ts                   # Route protection
```

## Additional Documentation

- [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) - Google OAuth step-by-step (consent screen, credentials, redirect URIs, troubleshooting)
- [GOOGLE_AUTH_SETUP.md](GOOGLE_AUTH_SETUP.md) - Google Docs service account setup
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Vercel deployment guide

## License

MIT
