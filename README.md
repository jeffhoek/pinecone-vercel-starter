# Pinecone RAG Chatbot

A production-ready Retrieval Augmented Generation (RAG) chatbot built with Next.js, Pinecone, and OpenAI. This application crawls web pages and Google Docs to create a knowledge base, then uses semantic search to provide accurate, context-aware responses without hallucination.

## Architecture Overview

**Frontend**: Next.js with React, using Vercel AI SDK's `useChat` hook for streaming responses
**Vector Database**: Pinecone for storing and querying document embeddings
**LLM**: OpenAI GPT for generating responses
**Authentication**: NextAuth.js with Google OAuth
**Deployment**: Vercel Edge Functions

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
- [Pinecone](https://www.pinecone.io) account and API key
- [OpenAI](https://platform.openai.com) API key
- [Google Cloud](https://console.cloud.google.com) OAuth credentials

### Installation

```bash
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

See [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) for detailed setup instructions.

## Configuration

### Authentication (Required)

All routes require Google OAuth authentication. Users must sign in with an authorized Google account to access the application.

**Setup**: See [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) for detailed instructions.

Required environment variables:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `ALLOWED_EMAILS` (optional - restrict to specific users)

Implementation: [`src/lib/auth.ts`](src/lib/auth.ts), [`src/middleware.ts`](src/middleware.ts)

### Admin Panel (Optional)

The admin panel provides dataset management capabilities including crawling URLs, clearing the index, and configuring document splitting methods.

**Configuration**: See [ADMIN_PANEL.md](ADMIN_PANEL.md) for visibility control.

- Set `NEXT_PUBLIC_SHOW_ADMIN_PANEL=true` for local development
- Set `NEXT_PUBLIC_SHOW_ADMIN_PANEL=false` to hide in production

Implementation: [`src/app/components/Context/index.tsx`](src/app/components/Context/index.tsx)

### Google Docs Access (Optional)

Enable crawling of private Google Docs by setting up a Google Service Account.

**Setup**: See [GOOGLE_AUTH_SETUP.md](GOOGLE_AUTH_SETUP.md) for detailed instructions.

Required environment variable:
- `GOOGLE_SERVICE_ACCOUNT_KEY` (minified JSON)

Implementation: [`src/app/utils/googleDrive.ts`](src/app/utils/googleDrive.ts)

## How It Works

### 1. Document Ingestion

The application crawls web pages and Google Docs using [`crawler.ts`](src/app/api/crawl/crawler.ts), which:
- Fetches HTML content from URLs
- Converts HTML to Markdown using Cheerio
- Extracts links for breadth-first traversal (configurable depth)

Documents are split into chunks using one of two strategies (see [`seed.ts`](src/app/api/crawl/seed.ts)):
- **Recursive**: Fixed-size chunks with overlap (configurable size/overlap)
- **Markdown**: Splits on headers to preserve semantic structure

Each chunk is embedded using OpenAI's `text-embedding-ada-002` model ([`embeddings.ts`](src/app/utils/embeddings.ts)) and stored in Pinecone with metadata (URL, text content).

### 2. Query Processing

When a user sends a message:

1. **Query Enhancement** ([`queryPreprocessing.ts`](src/app/utils/queryPreprocessing.ts)): The query is optionally enhanced using GPT to improve retrieval accuracy. See [QUERY_PREPROCESSING.md](QUERY_PREPROCESSING.md) for details.

2. **Semantic Search** ([`context.ts`](src/app/utils/context.ts)):
   - User query is embedded using the same OpenAI model
   - Pinecone performs cosine similarity search against indexed chunks
   - Top-K most relevant chunks are retrieved (default: 3, min score: 0.7)

3. **Context Injection** ([`chat/route.ts`](src/app/api/chat/route.ts)):
   - Retrieved chunks are concatenated into a context block
   - Context is injected into the system prompt
   - OpenAI generates a response using only the provided context

4. **Streaming Response**: The response is streamed back to the client using Vercel AI SDK's `StreamingTextResponse`.

### 3. UI Components

- **Chat Interface** ([`Chat/index.tsx`](src/app/components/Chat/index.tsx)): Message input and display using `useChat` hook
- **Messages** ([`Chat/Messages.tsx`](src/app/components/Chat/Messages.tsx)): Renders conversation history
- **Context Panel** ([`Context/index.tsx`](src/app/components/Context/index.tsx)): Shows which document chunks were used (admin only)

## Deployment

Deploy to Vercel with one click or manually configure environment variables.

**Full guide**: See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for step-by-step deployment instructions.

### Required Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Pinecone
PINECONE_API_KEY=pc-...
PINECONE_CLOUD=aws
PINECONE_REGION=us-east-1
PINECONE_INDEX=your-index-name

# NextAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-app.vercel.app

# Optional
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
ALLOWED_EMAILS=user1@example.com,user2@example.com
NEXT_PUBLIC_SHOW_ADMIN_PANEL=false
```

## Testing

The application uses Playwright for end-to-end testing.

```bash
# Run all tests
npm run test:e2e

# Show test report
npm run test:show
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

- [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) - Step-by-step setup guide
- [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) - Google OAuth configuration
- [GOOGLE_AUTH_SETUP.md](GOOGLE_AUTH_SETUP.md) - Google Docs authentication
- [ADMIN_PANEL.md](ADMIN_PANEL.md) - Admin panel configuration
- [QUERY_PREPROCESSING.md](QUERY_PREPROCESSING.md) - Query enhancement details
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Deployment guide

## License

MIT

