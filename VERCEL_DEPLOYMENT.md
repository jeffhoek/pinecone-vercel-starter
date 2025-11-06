# Vercel Deployment Guide

This guide will help you deploy your RAG application to Vercel with proper configuration for Pinecone and Google Docs authentication.

## Prerequisites

- A [Vercel](https://vercel.com) account
- A [Pinecone](https://www.pinecone.io) account
- An [OpenAI](https://openai.com) API key
- (Optional) A Google Cloud service account for accessing private Google Docs

## Step 1: Prepare Your Pinecone Index

### Option A: Create a New Index

1. Log in to [Pinecone Console](https://app.pinecone.io)
2. Navigate to **Indexes** in your project
3. Click **Create Index**
4. Configure the index:
   - **Name**: Choose a unique name (e.g., `vercel-rag`)
   - **Dimensions**: `1536` (for OpenAI embeddings)
   - **Metric**: `cosine`
   - **Cloud Provider**: Choose your preferred provider (aws, gcp, or azure)
   - **Region**: Choose a region close to your users
5. Click **Create Index**
6. Wait for the index to be ready (status: "Ready")

### Option B: Use an Existing Index

If you already have a Pinecone index:
1. Make sure it has **1536 dimensions** (required for OpenAI embeddings)
2. Note the exact index name
3. Note the cloud provider and region

## Step 2: Gather Required Environment Variables

You'll need the following information:

### Pinecone Configuration

1. Go to [Pinecone Console](https://app.pinecone.io)
2. Navigate to **API Keys** under your project
3. Copy your API key
4. Note your cloud provider (e.g., `aws`, `gcp`, `azure`)
5. Note your region (e.g., `us-east-1`, `us-west-2`, `gcp-starter`)
6. Note your index name from Step 1

### OpenAI Configuration

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key or use an existing one
3. Copy the API key

### Google Service Account (Optional)

If you need to access private Google Docs:
1. Follow the [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md) guide
2. Get your service account JSON key
3. Minify it to a single line: `cat key.json | jq -c`

## Step 3: Deploy to Vercel

### Deploy from GitHub (Recommended)

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **Add New... > Project**
4. Import your GitHub repository
5. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Click **Deploy**

### Deploy from CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Step 4: Configure Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings > Environment Variables**
3. Add the following variables:

### Required Variables

| Variable | Value | Environment |
|----------|-------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key | Production, Preview, Development |
| `PINECONE_API_KEY` | Your Pinecone API key | Production, Preview, Development |
| `PINECONE_CLOUD` | Cloud provider (e.g., `aws`, `gcp`, `azure`) | Production, Preview, Development |
| `PINECONE_REGION` | Region (e.g., `us-east-1`, `us-west-2`) | Production, Preview, Development |
| `PINECONE_INDEX` | Your index name (e.g., `vercel-rag`) | Production, Preview, Development |

### Optional Variables

| Variable | Value | Environment |
|----------|-------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Minified JSON key (single line) | Production, Preview, Development |
| `PINECONE_NAMESPACE` | Custom namespace (default: empty string) | Production, Preview, Development |

**Important Notes:**
- Make sure to enable the variables for all environments (Production, Preview, Development)
- After adding/updating environment variables, you must redeploy for changes to take effect

## Step 5: Redeploy After Adding Environment Variables

After adding all environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **•••** menu on the latest deployment
3. Click **Redeploy**
4. Check **Use existing Build Cache** (optional)
5. Click **Redeploy**

Alternatively, push a new commit to trigger a deployment.

## Step 6: Test Your Deployment

1. Open your deployed application URL (e.g., `https://your-app.vercel.app`)
2. Try crawling a document by clicking one of the URL buttons
3. Check the logs in Vercel Dashboard:
   - Go to your project
   - Click on the latest deployment
   - Click **Functions** tab
   - Click on a function to see logs
   - Look for any error messages

## Troubleshooting

### Issue: "PineconeNotFoundError: HTTP status 404"

**Possible causes:**
1. Index name mismatch
2. Index doesn't exist
3. Wrong cloud/region configuration

**Solutions:**
1. Verify the index name matches exactly (case-sensitive)
2. Check that the index exists in Pinecone Console
3. Verify `PINECONE_CLOUD` and `PINECONE_REGION` match your index configuration
4. Check Vercel logs for "Available indexes" message to see what's actually available

### Issue: "GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set"

**Solution:**
1. Make sure you added the variable in Vercel
2. Ensure it's enabled for Production environment
3. Redeploy after adding the variable

### Issue: "Permission denied for Google Doc"

**Solution:**
1. Verify the Google Doc is shared with your service account email
2. Check that the service account email is in the JSON key under `client_email`
3. Make sure you gave the service account "Viewer" permissions

### Issue: "Module not found" errors

**Solution:**
1. Make sure all dependencies are in `package.json`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Commit changes and redeploy

### Issue: Function timeout

**Possible causes:**
- Crawling large documents
- Slow OpenAI API responses
- Network issues

**Solutions:**
1. Check Vercel function timeout settings (default: 10s for Hobby plan)
2. Consider upgrading Vercel plan for longer timeouts
3. Reduce the number of pages to crawl (currently set to 1)

## Viewing Logs

### Vercel Dashboard Logs

1. Go to your project in Vercel Dashboard
2. Click on **Deployments**
3. Click on a deployment
4. Click on **Functions** tab
5. Click on a function (e.g., `api/crawl`)
6. View real-time logs and errors

### CLI Logs

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# View logs
vercel logs [deployment-url]

# Follow logs in real-time
vercel logs --follow
```

## Best Practices

1. **Use Environment Variables**: Never hardcode API keys or secrets
2. **Test Locally First**: Always test changes locally before deploying
3. **Monitor Usage**: Keep an eye on your Pinecone and OpenAI usage/costs
4. **Set Up Alerts**: Configure Vercel to notify you of deployment failures
5. **Version Control**: Always commit environment variable changes to `.env.example`
6. **Security**: Rotate API keys and service account keys regularly

## Cost Considerations

### Vercel
- **Hobby Plan**: Free (includes 100GB bandwidth, function executions)
- **Pro Plan**: $20/month (longer function timeouts, more bandwidth)

### Pinecone
- **Free Tier**: 1 index, limited storage
- **Paid Plans**: Starting at $70/month

### OpenAI
- **Pay-as-you-go**: Based on token usage
- Embedding API (text-embedding-ada-002): ~$0.0001 per 1K tokens

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Pinecone Documentation](https://docs.pinecone.io)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
