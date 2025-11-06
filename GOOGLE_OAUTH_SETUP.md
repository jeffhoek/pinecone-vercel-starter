# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for your RAG chatbot application using NextAuth.js.

## Why Authentication?

Authentication restricts access to your chatbot so only authorized users can use it. With Google OAuth, users can securely sign in using their Google accounts, and you can optionally restrict access to specific email addresses.

## Overview

The authentication system uses:
- **NextAuth.js**: Authentication library for Next.js
- **Google OAuth 2.0**: Allows users to sign in with their Google account
- **Middleware**: Automatically protects all pages (redirects to login if not authenticated)

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **New Project**
4. Enter a project name (e.g., "RAG Chatbot Auth")
5. Click **Create**
6. Wait for the project to be created and select it

### 2. Configure OAuth Consent Screen

1. In the Google Cloud Console, navigate to **APIs & Services > OAuth consent screen**
2. Select **External** as the user type (unless you have a Google Workspace account)
3. Click **Create**
4. Fill in the required information:
   - **App name**: RAG Chatbot (or your preferred name)
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **Save and Continue**
6. On the "Scopes" page, click **Save and Continue** (default scopes are sufficient)
7. On the "Test users" page:
   - If you want to test before publishing, add your email addresses here
   - Otherwise, skip this and click **Save and Continue**
8. Click **Back to Dashboard**
9. (Optional) Click **Publish App** if you want anyone with a Google account to sign in
   - If you don't publish, only test users can sign in

### 3. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services > Credentials**
2. Click **Create Credentials** at the top
3. Select **OAuth client ID**
4. Configure the OAuth client:
   - **Application type**: Web application
   - **Name**: RAG Chatbot Web Client (or any name you prefer)

5. Add **Authorized JavaScript origins**:
   - For local development: `http://localhost:3000`
   - For production: `https://your-domain.vercel.app`

6. Add **Authorized redirect URIs**:
   - For local development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://your-domain.vercel.app/api/auth/callback/google`

   **Important**: The redirect URI must exactly match this pattern: `{YOUR_URL}/api/auth/callback/google`

7. Click **Create**
8. A dialog will appear with your credentials:
   - **Client ID**: Copy this (starts with something like `123456789-abc...apps.googleusercontent.com`)
   - **Client Secret**: Copy this
9. Click **OK**

**Note**: You can always retrieve these credentials later from the Credentials page.

### 4. Generate NextAuth Secret

The NextAuth secret is used to encrypt session tokens. Generate a secure random string:

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Or use an online generator:**
- Visit: https://generate-secret.vercel.app/32

Copy the generated secret for the next step.

### 5. Configure Local Environment Variables

1. Open or create `.env` file in your project root
2. Add the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-from-step-4

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id-from-step-3
GOOGLE_CLIENT_SECRET=your-client-secret-from-step-3
```

3. Replace the placeholder values with your actual credentials
4. Save the file

**Important**: Never commit your `.env` file to version control! It's already in `.gitignore`.

### 6. Test Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and go to `http://localhost:3000`

3. You should be redirected to the login page

4. Click "Sign in with Google"

5. You'll be redirected to Google's OAuth consent screen

6. Select your Google account and grant permissions

7. You should be redirected back to the application and see the chatbot interface

8. Look for your user profile picture/name in the top left corner

9. Click it to see the user menu with "Sign out" option

### 7. Configure for Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Add the following variables for **Production, Preview, and Development**:

   | Variable | Value |
   |----------|-------|
   | `NEXTAUTH_URL` | `https://your-domain.vercel.app` |
   | `NEXTAUTH_SECRET` | Your generated secret from Step 4 |
   | `GOOGLE_CLIENT_ID` | Your Google Client ID |
   | `GOOGLE_CLIENT_SECRET` | Your Google Client Secret |

4. Click **Save** for each variable

5. Go back to Google Cloud Console → Credentials
6. Edit your OAuth 2.0 Client ID
7. Add your Vercel production URL to:
   - **Authorized JavaScript origins**: `https://your-domain.vercel.app`
   - **Authorized redirect URIs**: `https://your-domain.vercel.app/api/auth/callback/google`
8. Click **Save**

9. Redeploy your Vercel application for changes to take effect

## Optional: Restrict Access to Specific Emails

If you want to allow only specific email addresses to access your chatbot:

### Option 1: Whitelist in Code (Recommended)

1. Open `src/app/api/auth/[...nextauth]/route.ts`
2. Uncomment the email whitelist code in the `signIn` callback:

```typescript
async signIn({ user, account, profile }) {
  const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') || [];
  if (allowedEmails.length > 0 && user.email) {
    return allowedEmails.includes(user.email);
  }
  return true;
},
```

3. Add `ALLOWED_EMAILS` to your `.env` file:

```bash
ALLOWED_EMAILS=user1@gmail.com,user2@gmail.com,user3@example.com
```

4. Add the same variable to Vercel environment variables

5. Restart your dev server or redeploy to Vercel

Now only users with these email addresses can sign in. Others will see an error message from NextAuth.

### Option 2: Restrict by Domain

To allow all users from a specific domain (e.g., `@yourcompany.com`):

1. Modify the `signIn` callback:

```typescript
async signIn({ user, account, profile }) {
  const allowedDomain = process.env.ALLOWED_DOMAIN;
  if (allowedDomain && user.email) {
    return user.email.endsWith(`@${allowedDomain}`);
  }
  return true;
},
```

2. Add to `.env`:

```bash
ALLOWED_DOMAIN=yourcompany.com
```

## Troubleshooting

### Error: "Redirect URI mismatch"

**Cause**: The redirect URI in your OAuth consent doesn't match the actual callback URL.

**Solution**:
1. Check the error message for the exact redirect URI being used
2. Go to Google Cloud Console → Credentials
3. Edit your OAuth 2.0 Client ID
4. Make sure the redirect URI exactly matches: `{YOUR_URL}/api/auth/callback/google`
5. Save and try again

### Error: "Access blocked: This app's request is invalid"

**Cause**: OAuth consent screen not properly configured or app not published.

**Solution**:
1. Go to Google Cloud Console → OAuth consent screen
2. Make sure all required fields are filled in
3. Add your email as a test user, or publish the app
4. Try again

### Error: "NEXTAUTH_SECRET is not set"

**Solution**:
1. Make sure you've generated a secret using `openssl rand -base64 32`
2. Add it to your `.env` file as `NEXTAUTH_SECRET=your-secret`
3. For Vercel, add it to environment variables
4. Restart your dev server

### Error: "signin" error with no message

**Cause**: Usually means the `signIn` callback returned `false` (user not allowed).

**Solution**:
1. Check if you have email whitelist enabled
2. Make sure your email is in the `ALLOWED_EMAILS` list
3. Check the server logs for more details

### Can't sign out or session not persisting

**Solution**:
1. Clear your browser cookies for `localhost:3000` or your domain
2. Make sure `NEXTAUTH_SECRET` is set correctly
3. Restart your development server

## Security Best Practices

1. **Keep secrets safe**: Never commit `.env` file or expose secrets in client-side code
2. **Use strong secrets**: Always generate secrets with `openssl rand -base64 32`
3. **Rotate secrets regularly**: Update your `NEXTAUTH_SECRET` periodically
4. **Restrict by email**: Use the whitelist feature to limit access
5. **Monitor access**: Check Vercel logs to see who's accessing your app
6. **Use HTTPS in production**: Always use secure URLs (https://) for production

## How It Works

1. **User visits app** → Middleware checks if authenticated
2. **Not authenticated** → Redirects to `/login` page
3. **User clicks "Sign in with Google"** → Redirects to Google OAuth
4. **User grants permission** → Google redirects back with authorization code
5. **NextAuth exchanges code for tokens** → Creates session
6. **User is redirected to app** → Session cookie is set
7. **Subsequent requests** → Middleware checks session cookie, allows access

## Files Created/Modified

- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `src/app/login/page.tsx` - Login page with Google sign-in button
- `src/app/components/SessionProvider.tsx` - Session context provider
- `src/app/components/UserMenu.tsx` - User profile dropdown menu
- `src/middleware.ts` - Route protection middleware
- `src/app/layout.tsx` - Updated to include SessionProvider
- `src/app/page.tsx` - Updated to show user menu
- `.env.example` - Added authentication variables

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## Cost

- **NextAuth.js**: Free and open source
- **Google OAuth**: Free (no usage limits for authentication)
- **No additional infrastructure needed**: Works with your existing setup

---

If you run into any issues not covered here, check the [NextAuth.js documentation](https://next-auth.js.org/) or the application logs in Vercel Dashboard.
