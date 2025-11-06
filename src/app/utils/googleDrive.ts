import 'server-only';
import { google } from 'googleapis';

/**
 * Creates an authenticated Google Drive client using service account credentials
 */
export function getGoogleDriveClient() {
  try {
    // Parse service account credentials from environment variable
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
      : null;

    if (!credentials) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
    }

    // Create JWT client with service account credentials
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    // Return authenticated Drive client
    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Error creating Google Drive client:', error);
    throw error;
  }
}

/**
 * Extracts Google Doc ID from various Google Docs URL formats
 * Examples:
 * - https://docs.google.com/document/d/DOC_ID/edit
 * - https://docs.google.com/document/d/DOC_ID/
 */
export function extractGoogleDocId(url: string): string | null {
  const patterns = [
    /\/document\/d\/([a-zA-Z0-9-_]+)/,
    /\/file\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Checks if a URL is a Google Docs/Drive URL
 */
export function isGoogleDocsUrl(url: string): boolean {
  return url.includes('docs.google.com') || url.includes('drive.google.com');
}

/**
 * Fetches the HTML content of a Google Doc using the Drive API
 * The document must be shared with the service account email
 */
export async function fetchGoogleDocContent(docId: string): Promise<string> {
  try {
    const drive = getGoogleDriveClient();

    // Export the document as HTML
    const response = await drive.files.export({
      fileId: docId,
      mimeType: 'text/html',
    }, {
      responseType: 'text',
    });

    return response.data as string;
  } catch (error: any) {
    console.error(`Error fetching Google Doc ${docId}:`, error);

    if (error.code === 404) {
      throw new Error(`Google Doc not found: ${docId}. Make sure the document exists and is shared with your service account.`);
    } else if (error.code === 403) {
      throw new Error(`Permission denied for Google Doc: ${docId}. Make sure the document is shared with your service account email.`);
    }

    throw error;
  }
}
