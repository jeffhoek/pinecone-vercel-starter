# Admin Panel Configuration

The admin panel is the right-hand side panel that provides dataset management capabilities including:
- Crawling and indexing new documents
- Clearing the Pinecone index
- Configuring document splitting methods (recursive vs markdown)
- Adjusting chunk size and overlap settings

## Why Hide the Admin Panel?

In production deployments, you typically want to:
- Prevent end users from modifying your knowledge base
- Provide a cleaner, simpler chat interface
- Reduce visual clutter for non-admin users
- Control when and how your dataset is updated

## Configuration

The admin panel visibility is controlled by the `NEXT_PUBLIC_SHOW_ADMIN_PANEL` environment variable.

### Show Admin Panel (Default)

To show the admin panel (typically for local development):

```bash
# In .env file
NEXT_PUBLIC_SHOW_ADMIN_PANEL=true
```

Or simply omit the variable entirely (defaults to `true`).

### Hide Admin Panel

To hide the admin panel (typically for production):

```bash
# In .env file
NEXT_PUBLIC_SHOW_ADMIN_PANEL=false
```

## Local Development Setup

For local development, you'll typically want the admin panel visible so you can manage your dataset:

1. Edit your `.env` file:
   ```bash
   NEXT_PUBLIC_SHOW_ADMIN_PANEL=true
   ```

2. Restart your development server:
   ```bash
   npm run dev
   ```

3. The admin panel will appear on the right side of the screen

## Production Setup (Vercel)

For production, hide the admin panel to provide a clean chat interface:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add new environment variable:
   - **Name**: `NEXT_PUBLIC_SHOW_ADMIN_PANEL`
   - **Value**: `false`
   - **Environments**: Production (and optionally Preview)

3. Redeploy your application

4. The admin panel will be hidden for production users

## UI Changes

### When Admin Panel is Shown
- Chat interface takes 3/5 of the screen width on large displays
- Admin panel takes 2/5 of the screen width
- Mobile users can toggle the panel with a hamburger button
- Context highlighting shows which document chunks were used for responses

### When Admin Panel is Hidden
- Chat interface takes the full screen width
- Cleaner, more focused UI
- No dataset management controls visible
- Context fetching is automatically disabled (performance optimization)

## Use Cases

### Development Environment
```bash
NEXT_PUBLIC_SHOW_ADMIN_PANEL=true
```
**Why**: You need to crawl documents, test different splitting methods, and manage the index.

### Staging/Preview Environment
```bash
NEXT_PUBLIC_SHOW_ADMIN_PANEL=true  # or false, depending on needs
```
**Why**: Keep it visible if testers need to update the dataset, hide it if testing the end-user experience.

### Production Environment
```bash
NEXT_PUBLIC_SHOW_ADMIN_PANEL=false
```
**Why**: End users should only chat with the bot, not modify the knowledge base.

## Managing Your Dataset in Production

If you hide the admin panel in production, you have a few options for managing your dataset:

### Option 1: Local Development (Recommended)
1. Update your dataset locally with `NEXT_PUBLIC_SHOW_ADMIN_PANEL=true`
2. Since Pinecone is cloud-based, changes sync automatically
3. Production users see the updated knowledge base immediately

### Option 2: Separate Admin Deployment
1. Deploy a separate Vercel preview deployment with admin panel enabled
2. Protect it with a different authentication whitelist
3. Use this admin deployment to manage the dataset
4. Production deployment shows only the chat interface

### Option 3: Direct API Calls
1. Use the crawl API endpoint directly:
   ```bash
   curl -X POST https://your-app.vercel.app/api/crawl \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com", "options": {"splittingMethod": "markdown", "chunkSize": 256, "overlap": 1}}'
   ```
2. Requires authentication (user must be logged in)

### Option 4: Conditional Access
You can modify the code to show the admin panel only to specific users:

Edit `src/app/page.tsx`:
```typescript
import { useSession } from "next-auth/react";

const Page: React.FC = () => {
  const { data: session } = useSession();

  // Show admin panel if env var is true OR user is an admin
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
  const isAdmin = session?.user?.email && adminEmails.includes(session.user.email);
  const showAdminPanel = process.env.NEXT_PUBLIC_SHOW_ADMIN_PANEL !== 'false' || isAdmin;

  // ... rest of component
}
```

Then add to `.env`:
```bash
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## Technical Details

### How It Works

The `NEXT_PUBLIC_` prefix makes the variable available in the client-side code. The page component checks this value and:

1. Conditionally renders the Context panel component
2. Adjusts the Chat component's width to fill available space
3. Skips fetching context data when panel is hidden (performance optimization)

### Code Location

The implementation is in:
- `src/app/page.tsx` - Main logic for showing/hiding panel
- `src/app/components/Context/index.tsx` - Admin panel component
- `.env.example` - Configuration template

### Performance Impact

When the admin panel is hidden:
- ✅ Slightly faster page load (fewer components to render)
- ✅ No context API calls after each chat message
- ✅ Cleaner DOM structure
- ✅ Full-width chat interface provides better readability

## Troubleshooting

### Admin panel not hiding in production

**Solution**:
1. Check environment variable in Vercel Dashboard
2. Make sure it's set to `false` (as a string, not boolean)
3. Redeploy after changing the variable

### Admin panel showing when it shouldn't

**Solution**:
1. Verify `NEXT_PUBLIC_SHOW_ADMIN_PANEL=false` is set correctly
2. Clear browser cache and hard refresh
3. Check that you deployed after adding the environment variable

### Can't manage dataset in production

**Solution**: This is by design if you set `NEXT_PUBLIC_SHOW_ADMIN_PANEL=false`. Use one of the dataset management options listed above.

## Best Practices

1. **Always show admin panel in local development** - Makes it easy to test and update your dataset
2. **Hide admin panel in production** - Provides a professional, clean interface for end users
3. **Use staging environment** - Test with admin panel hidden before deploying to production
4. **Document who can update the dataset** - Make it clear to your team how to update the knowledge base
5. **Version control your dataset** - Keep track of what documents are in your index

---

**Quick Reference:**
- Show panel: `NEXT_PUBLIC_SHOW_ADMIN_PANEL=true` (or omit)
- Hide panel: `NEXT_PUBLIC_SHOW_ADMIN_PANEL=false`
- After changing in Vercel: Always redeploy!
