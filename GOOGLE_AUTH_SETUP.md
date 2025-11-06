# Google Service Account Setup Guide

This guide explains how to set up Google Service Account authentication to access private Google Docs in your RAG application.

## Why This Is Needed

When your app is hosted in the cloud, it cannot access private Google Docs without authentication. Using a service account allows your application to access Google Docs that have been explicitly shared with it.

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID for later use

### 2. Enable Google Drive API

1. In the Google Cloud Console, navigate to **APIs & Services > Library**
2. Search for "Google Drive API"
3. Click on it and press **Enable**

### 3. Create a Service Account

1. Navigate to **APIs & Services > Credentials**
2. Click **Create Credentials** and select **Service Account**
3. Fill in the service account details:
   - **Service account name**: `pinecone-rag-crawler` (or any name you prefer)
   - **Service account ID**: Will be auto-generated
   - **Description**: "Service account for accessing Google Docs in RAG application"
4. Click **Create and Continue**
5. Skip the optional "Grant this service account access to project" section (click **Continue**)
6. Skip the optional "Grant users access to this service account" section (click **Done**)

### 4. Create and Download Service Account Key

1. In the **Credentials** page, find your newly created service account
2. Click on the service account email to open its details
3. Go to the **Keys** tab
4. Click **Add Key > Create New Key**
5. Select **JSON** as the key type
6. Click **Create**
7. The JSON key file will be downloaded to your computer
8. **IMPORTANT**: Keep this file secure and never commit it to version control

### 5. Get the Service Account Email

1. Open the downloaded JSON file
2. Find the `client_email` field - it will look like:
   ```
   your-service-account@your-project.iam.gserviceaccount.com
   ```
3. Copy this email address

### 6. Share Your Google Docs

For each Google Doc you want to crawl:

1. Open the Google Doc in your browser
2. Click the **Share** button
3. Paste the service account email address
4. Set permissions to **Viewer** (read-only access)
5. Uncheck "Notify people" (the service account won't receive emails)
6. Click **Share**

### 7. Configure Environment Variables

#### For Local Development:

1. Open your `.env` file (create one if it doesn't exist)
2. Minify the JSON key file content (remove all newlines and extra spaces)
3. Add the following line:
   ```bash
   GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project",...}'
   ```

   **Tip**: You can minify JSON using this command:
   ```bash
   cat path/to/your-key.json | jq -c
   ```

#### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Add a new environment variable:
   - **Name**: `GOOGLE_SERVICE_ACCOUNT_KEY`
   - **Value**: The minified JSON content (as a single line)
4. Make sure it's available for all environments (Production, Preview, Development)
5. Click **Save**

### 8. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. In the application UI, click the "Jaco Dogsitting" button to crawl the Google Doc

3. Check the console logs for:
   - `Fetching Google Doc with ID: ...` (success)
   - Any error messages about permissions or authentication

## Troubleshooting

### Error: "Permission denied for Google Doc"

**Solution**: Make sure you've shared the Google Doc with the service account email address. Check the "Share" settings in Google Docs.

### Error: "GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set"

**Solution**: Verify that you've added the environment variable correctly. For Vercel, you may need to redeploy after adding the variable.

### Error: "Google Doc not found"

**Solution**:
- Verify the Google Doc URL is correct
- Ensure the document hasn't been deleted
- Check that the document is shared with the service account

### Error: "Invalid JSON in service account key"

**Solution**: Make sure the JSON is properly formatted and minified to a single line. Use `jq -c` to minify it correctly.

## Security Best Practices

1. **Never commit** the service account JSON key to version control
2. Add `*.json` to your `.gitignore` if storing keys locally
3. Use environment variables for all sensitive credentials
4. Rotate service account keys periodically (every 90 days recommended)
5. Grant only the minimum permissions needed (Viewer access for reading docs)
6. Monitor service account usage in the Google Cloud Console

## Cost Considerations

- Google Drive API usage is free for most use cases
- Check the [Google Drive API quotas](https://developers.google.com/drive/api/guides/limits) if you're crawling many documents
- Standard quotas: 1,000 queries per 100 seconds per user

## Additional Resources

- [Google Cloud Service Accounts Documentation](https://cloud.google.com/iam/docs/service-accounts)
- [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)
- [Vercel Environment Variables Documentation](https://vercel.com/docs/projects/environment-variables)
